const crypto = require('node:crypto');
const Razorpay = require('razorpay');
const { pool } = require('../db');
const { getChargeBreakdown } = require('./billingSettings');

const verifyRazorpayPayment = async (req, res, next) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Payments are not configured.' });
  if (!orderId || !paymentId || !signature) return res.status(400).json({ error: 'Payment verification details are required.' });
  if (!['business_listing', 'advertisement'].includes(req.paymentPurpose)) {
    return res.status(400).json({ error: 'Payment purpose is missing.' });
  }

  try {
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
    if (!/^[0-9a-f]{64}$/i.test(String(signature))) return res.status(400).json({ error: 'Payment signature is invalid.' });
    const received = Buffer.from(signature, 'hex');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return res.status(400).json({ error: 'Payment signature is invalid.' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(paymentId);
    let expectedAmountPaise;
    if (req.paymentPurpose === 'business_listing') {
      const billingOrder = (await pool.query(
        'SELECT settings, "expectedAmountPaise", customer, "businessDetails" FROM billing_orders WHERE "orderId"=$1', [orderId],
      )).rows[0];
      if (!billingOrder) return res.status(400).json({ error: 'Listing payment order was not found. Please start a new payment.' });
      req.verifiedBillingOrder = billingOrder;
      req.verifiedBillingSettings = billingOrder.settings;
      expectedAmountPaise = Number(billingOrder.expectedAmountPaise);
    } else {
      const adOrder = (await pool.query(
        'SELECT "expectedAmountPaise", "durationDays", details FROM advertisement_orders WHERE "orderId"=$1', [orderId],
      )).rows[0];
      if (!adOrder) return res.status(400).json({ error: 'Advertisement payment order was not found. Please start a new payment.' });
      req.verifiedAdvertisementOrder = adOrder;
      expectedAmountPaise = Number(adOrder.expectedAmountPaise);
      if (Number(req.body.durationDays) !== Number(adOrder.durationDays)) {
        return res.status(400).json({ error: 'Payment does not match the selected advertisement plan.' });
      }
    }
    if (payment.order_id !== orderId || payment.status !== 'captured' || payment.amount !== expectedAmountPaise || payment.currency !== 'INR') {
      return res.status(400).json({ error: 'Payment does not match the selected purchase.' });
    }

    req.verifiedPaymentId = paymentId;
    req.verifiedPaymentAmount = payment.amount / 100;
    req.verifiedPaymentTaxBreakdown = req.paymentPurpose === 'business_listing'
      ? getChargeBreakdown(req.verifiedBillingSettings)
      : null;
    req.verifiedPaymentPurpose = req.paymentPurpose;
    return next();
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    return res.status(400).json({ error: 'Payment could not be verified.' });
  }
};

module.exports = verifyRazorpayPayment;
