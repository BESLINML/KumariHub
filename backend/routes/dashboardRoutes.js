const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { camelize } = require('../utils/records');
const authenticateAdmin = require('../utils/adminAuth');
const crypto = require('node:crypto');
const { DEFAULT_BILLING_SETTINGS, getChargeBreakdown, loadBillingSettings, validateBillingSettings } = require('../utils/billingSettings');
const createInvoicePdf = require('../utils/createInvoicePdf');

const safeEqual = (left, right) => {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

router.post('/login', (req, res) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!expectedPassword || !adminToken) {
    return res.status(503).json({ error: 'Admin login is not configured.' });
  }
  if (!safeEqual(req.body?.password, expectedPassword)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  return res.json({ token: adminToken });
});

router.use(authenticateAdmin);
router.get('/billing-settings', async (_req, res) => {
  try {
    res.json(await loadBillingSettings(pool));
  } catch (error) {
    res.status(500).json({ error: 'Could not load billing settings.' });
  }
});
router.post('/billing-settings/preview', (req, res) => {
  const validation = validateBillingSettings(req.body || {});
  if (validation.error) return res.status(400).json({ error: validation.error });
  try {
    const settings = validation.settings;
    const amounts = getChargeBreakdown(settings);
    const pdf = createInvoicePdf({
      sellerName: settings.sellerName,
      sellerGstin: settings.sellerGstin,
      issueDate: new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ownerName: 'Sample Customer',
      email: 'customer@example.com',
      businessName: 'Sample Business',
      businessDetails: { category: 'Sample category', location: 'Nagercoil' },
      paymentId: 'pay_demo123456',
      baseAmount: amounts.basePaise / 100,
      gstRate: settings.gstRate,
      taxAmount: amounts.taxPaise / 100,
      totalAmount: amounts.totalPaise / 100,
      message: settings.invoiceMessage,
    });
    res.type('application/pdf').set('Content-Disposition', 'inline; filename="KumariHub-Invoice-Demo.pdf"').send(pdf);
  } catch (error) {
    res.status(500).json({ error: 'Could not create the invoice PDF preview.' });
  }
});
router.put('/billing-settings', async (req, res) => {
  const validation = validateBillingSettings(req.body || {});
  if (validation.error) return res.status(400).json({ error: validation.error });
  try {
    const result = await pool.query(
      `INSERT INTO billing_settings (id, settings) VALUES (1, $1::jsonb)
       ON CONFLICT (id) DO UPDATE SET settings=$1::jsonb, "updatedAt"=NOW()
       RETURNING settings`,
      [JSON.stringify(validation.settings)],
    );
    res.json({ ...DEFAULT_BILLING_SETTINGS, ...result.rows[0].settings });
  } catch (error) {
    res.status(500).json({ error: 'Could not save billing settings.' });
  }
});
router.get('/dashboard-stats',async(req,res)=>{try{const params=[];let where='';if(req.query.startDate&&req.query.endDate){params.push(req.query.startDate,new Date(new Date(req.query.endDate).setHours(23,59,59,999)));where='WHERE "createdAt">=$1 AND "createdAt"<=$2';}const all=(await pool.query(`SELECT * FROM businesses ${where}`,params)).rows.map(camelize);const now=new Date(),today=new Date();today.setHours(0,0,0,0);const nextWeek=new Date(today);nextWeek.setDate(nextWeek.getDate()+7);nextWeek.setHours(23,59,59,999);const activePremium=all.filter(b=>b.premium&&b.status==='active');res.json({totalBusinesses:all.length,todaysListings:all.filter(b=>new Date(b.createdAt)>=today).length,upcomingRenewals:all.filter(b=>b.status==='active'&&new Date(b.expiryDate)>=today&&new Date(b.expiryDate)<=nextWeek),expiredListings:all.filter(b=>b.status==='expired'||new Date(b.expiryDate)<now),inactiveListings:all.filter(b=>b.status==='inactive').length,categories:Number((await pool.query('SELECT COUNT(*) FROM categories')).rows[0].count),locations:Number((await pool.query('SELECT COUNT(*) FROM locations')).rows[0].count),revenue:activePremium.reduce((sum,b)=>sum+(b.price||500),0),premiumList:all.filter(b=>b.premium),nonPremiumList:all.filter(b=>!b.premium)});}catch(e){res.status(500).json({error:e.message});}});
module.exports=router;
