const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { camelize, normalizePhone } = require('../utils/records');
const verifyRazorpayPayment = require('../utils/verifyRazorpayPayment');
const authenticateAdmin = require('../utils/adminAuth');

const findRegisteredBusiness = async (businessName, phone) => {
  const normalizedPhone = normalizePhone(phone);
  const phoneDigits = String(normalizedPhone).replace(/\D/g, '');
  const possiblePhones = [phoneDigits, phoneDigits.slice(-10)];
  const result = await pool.query(
    `SELECT id FROM businesses
     WHERE LOWER(BTRIM("businessName")) = LOWER(BTRIM($1))
       AND regexp_replace(phone, '\\D', '', 'g') = ANY($2::text[])
     LIMIT 1`,
    [String(businessName || ''), possiblePhones],
  );
  return result.rowCount > 0;
};

router.get('/eligibility', async (req, res) => {
  try {
    const { businessName, phone } = req.query;
    if (!businessName || !phone) {
      return res.status(400).json({ error: 'Business name and listing phone number are required.' });
    }
    const eligible = await findRegisteredBusiness(businessName, phone);
    return res.json({ eligible, error: eligible ? undefined : 'Only businesses already listed on KumariHub can advertise. Use the same business name and phone number as your listing.' });
  } catch (error) {
    return res.status(500).json({ error: 'Could not verify the business listing.' });
  }
});

router.get('/', (req,res,next)=>req.query.all==='true'?authenticateAdmin(req,res,next):next(), async (req, res) => {
  try {
    const includeExpired = req.query.all === 'true';
    const result = await pool.query(
      `SELECT * FROM advertisements ${includeExpired ? '' : 'WHERE "expiresAt" > NOW()'} ORDER BY "createdAt" DESC`
    );
    res.json(result.rows.map(camelize));
  } catch (error) {
    res.status(500).json({ error: 'Could not load advertisements.' });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { companyName, phone } = req.body || {};
    if (!companyName || !phone || !(await findRegisteredBusiness(companyName, phone))) {
      return res.status(403).json({ error: 'Only businesses already listed on KumariHub can advertise. Use the same business name and phone number as your listing.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Could not verify the business listing.' });
  }
}, verifyRazorpayPayment, async (req, res) => {
  try {
    const { companyName, place, phone, category, coverPhoto, description, durationDays, amount } = req.body;
    const paymentId = req.verifiedPaymentId;
    const days = Number(durationDays);
    const price = days === 15 ? 299 : days === 30 ? 499 : 0;
    if (!companyName || !place || !phone || !category || !coverPhoto || !description || !paymentId || !price || Number(amount) !== price) {
      return res.status(400).json({ error: 'Advertisement details or selected plan are invalid.' });
    }

    const result = await pool.query(
      `INSERT INTO advertisements
        ("companyName", place, phone, category, "coverPhoto", description, "durationDays", amount, "paymentId", "expiresAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW() + ($7::integer * INTERVAL '1 day'))
       RETURNING *`,
      [companyName.trim(), place.trim(), normalizePhone(phone), category.trim(), coverPhoto, description.trim(), days, price, paymentId],
    );
    res.status(201).json(camelize(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: 'Could not save advertisement.' });
  }
});

const editableFields = ['companyName', 'place', 'phone', 'category', 'coverPhoto', 'description'];
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const fields = editableFields.filter((field) => req.body?.[field] !== undefined);
    if (!fields.length) return res.status(400).json({ error: 'No advertisement details were provided.' });
    const requiredFields = ['companyName', 'place', 'phone', 'category', 'coverPhoto', 'description'];
    if (requiredFields.some((field) => !String(req.body[field] ?? '').trim())) {
      return res.status(400).json({ error: 'All advertisement details are required.' });
    }
    const values = fields.map((field) => field === 'phone' ? normalizePhone(req.body[field]) : String(req.body[field]).trim());
    const sets = fields.map((field, index) => `"${field}"=$${index + 1}`).join(', ');
    const result = await pool.query(`UPDATE advertisements SET ${sets} WHERE id=$${fields.length + 1} RETURNING *`, [...values, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Advertisement not found.' });
    res.json(camelize(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: 'Could not update advertisement.' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM advertisements WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Advertisement not found.' });
    res.json({ message: 'Advertisement deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete advertisement.' });
  }
});

module.exports = router;
