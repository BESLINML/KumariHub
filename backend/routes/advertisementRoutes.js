const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { camelize, normalizePhone } = require('../utils/records');
const verifyRazorpayPayment = require('../utils/verifyRazorpayPayment');
const authenticateAdmin = require('../utils/adminAuth');

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

router.post('/', verifyRazorpayPayment, async (req, res) => {
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

module.exports = router;
