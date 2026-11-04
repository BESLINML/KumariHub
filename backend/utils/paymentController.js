const Razorpay = require('razorpay');
const crypto = require('node:crypto');
const { getChargeBreakdown, loadBillingSettings } = require('./billingSettings');
const { pool } = require('../db');
const { sendBusinessPaymentFailureNotice } = require('./sendBusinessPaymentReceipt');

const createOrder = async (req, res) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(503).json({ error: "Payments are not configured" });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const planPrices = { 15: 299, 30: 499 };
    const durationDays = Number(req.body?.durationDays);
    let amountPaise;
    let billingSettings = null;
    let advertisementDetails = null;
    let businessDetails = null;
    if (durationDays) {
      const amountRupees = planPrices[durationDays];
      if (!amountRupees) return res.status(400).json({ error: 'Choose a valid plan: 15 days or 30 days.' });
      amountPaise = amountRupees * 100;
      advertisementDetails = req.body?.advertisementDetails || {};
      if (['companyName', 'place', 'phone', 'category', 'coverPhoto', 'description'].some((field) => !String(advertisementDetails[field] || '').trim())) {
        return res.status(400).json({ error: 'Complete the advertisement details before starting payment.' });
      }
    } else {
      const customer = {
        email: String(req.body?.email || '').trim().toLowerCase(),
        ownerName: String(req.body?.ownerName || '').trim(),
        businessName: String(req.body?.businessName || '').trim(),
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !customer.businessName) {
        return res.status(400).json({ error: 'A valid customer email and business name are required.' });
      }
      billingSettings = await loadBillingSettings(pool);
      if (billingSettings.gstRate > 0 && !billingSettings.sellerGstin) {
        return res.status(503).json({ error: 'Enter the seller GSTIN in admin billing settings before accepting GST payments.' });
      }
      amountPaise = getChargeBreakdown(billingSettings).totalPaise;
      businessDetails = req.body?.businessDetails || {};
      if (['businessName', 'category', 'location', 'address', 'phone', 'aboutBusness'].some((field) => !String(businessDetails[field] || '').trim())) {
        return res.status(400).json({ error: 'Complete the required business details before starting payment.' });
      }
      req.paymentCustomer = customer;
    }
    if (!amountPaise) {
      return res.status(400).json({ error: 'Choose a valid plan: 15 days or 30 days.' });
    }
    const options = {
      amount: amountPaise,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
    if (billingSettings) {
      await pool.query(
        'INSERT INTO billing_orders ("orderId", settings, "expectedAmountPaise", customer, "businessDetails") VALUES ($1, $2::jsonb, $3, $4::jsonb, $5::jsonb)',
        [order.id, JSON.stringify(billingSettings), amountPaise, JSON.stringify(req.paymentCustomer), JSON.stringify(businessDetails)],
      );
    } else {
      await pool.query(
        'INSERT INTO advertisement_orders ("orderId", "expectedAmountPaise", "durationDays", details) VALUES ($1, $2, $3, $4::jsonb)',
        [order.id, amountPaise, durationDays, JSON.stringify(advertisementDetails)],
      );
    }
    res.json({ ...order, keyId });
  } catch (error) {
    const providerError = error?.error || {};
    const statusCode = error?.statusCode || null;
    const code = providerError.code || error?.code || null;
    const description = providerError.description || null;
    console.error('Razorpay order error:', { statusCode, code, description, message: description ? undefined : error?.message });
    const message = statusCode === 401
      ? 'Razorpay rejected the API credentials. Confirm the live Key ID and Key Secret belong to the same Razorpay account.'
      : description || 'Razorpay could not create the order. Check the backend logs for the provider error.';
    res.status(502).json({ error: message, code });
  }
};

const notifyPaymentFailure = async (req, res) => {
  const orderId = String(req.body?.orderId || '').trim();
  const paymentId = String(req.body?.paymentId || '').trim();
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    return res.status(400).json({ error: 'Valid order and payment references are required.' });
  }

  try {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== orderId || payment.status !== 'failed') {
      return res.status(409).json({ error: 'Razorpay has not confirmed a failed payment for this order.' });
    }
    const result = await sendFailureNoticeForVerifiedPayment(orderId, payment);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.json(result);
  } catch (error) {
    console.error('Could not verify failed payment:', error.message);
    return res.status(400).json({ error: 'Could not verify the payment failure.' });
  }
};

const sendFailureNoticeForVerifiedPayment = async (orderId, payment) => {
  const paymentId = payment.id;
  const order = (await pool.query(
    'SELECT customer, settings FROM billing_orders WHERE "orderId"=$1', [orderId],
  )).rows[0];
  if (!order?.customer?.email) return { status: 404, error: 'Listing order was not found.' };
  if (payment.order_id !== orderId || payment.status !== 'failed') {
    return { status: 409, error: 'Razorpay has not confirmed a failed payment for this order.' };
  }
  if (payment.email && payment.email.toLowerCase() !== String(order.customer.email).toLowerCase()) {
    return { status: 403, error: 'The payment email does not match the checkout email.' };
  }

  const claim = await pool.query(
    `INSERT INTO payment_notifications ("paymentId", type) VALUES ($1, 'failed')
     ON CONFLICT ("paymentId") DO NOTHING RETURNING "paymentId"`,
    [paymentId],
  );
  if (!claim.rowCount) return { notified: false, alreadyNotified: true };

  try {
    const notified = await sendBusinessPaymentFailureNotice({
      ...order.customer,
      paymentId,
      amount: Number(payment.amount || 0) / 100,
      failureReason: payment.error_description || payment.error_reason || payment.error_code || '',
      billingSettings: order.settings,
      taxBreakdown: getChargeBreakdown(order.settings),
    });
    if (!notified) {
      await pool.query('DELETE FROM payment_notifications WHERE "paymentId"=$1', [paymentId]);
      return { status: 503, error: 'Payment failure email is not configured.', notified: false };
    }
    return { notified: true };
  } catch (emailError) {
    await pool.query('DELETE FROM payment_notifications WHERE "paymentId"=$1', [paymentId]);
    console.error('Could not send payment failure notice:', emailError.message);
    return { status: 502, error: 'Payment failed, but the email could not be sent.' };
  }
};

const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.get('x-razorpay-signature');
  if (!secret) return res.status(503).send('Webhook secret is not configured.');
  if (!Buffer.isBuffer(req.body) || !signature) return res.status(400).send('Invalid webhook request.');

  const expected = crypto.createHmac('sha256', secret).update(req.body).digest();
  let supplied;
  try { supplied = Buffer.from(signature, 'hex'); } catch { return res.status(400).send('Invalid webhook signature.'); }
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
    return res.status(400).send('Invalid webhook signature.');
  }

  let event;
  try { event = JSON.parse(req.body.toString('utf8')); } catch { return res.status(400).send('Invalid webhook body.'); }
  if (!['payment.failed', 'payment.captured'].includes(event.event)) return res.status(200).json({ received: true });

  const payment = event.payload?.payment?.entity;
  const expectedStatus = event.event === 'payment.failed' ? 'failed' : 'captured';
  if (!payment?.id || !payment?.order_id || payment.status !== expectedStatus) {
    return res.status(400).send('Missing payment details.');
  }
  try {
    if (event.event === 'payment.captured') {
      const { recoverCapturedPayment } = require('./paidSubmissionRecovery');
      await recoverCapturedPayment(payment);
      return res.status(200).json({ received: true, recovered: true });
    }
    const result = await sendFailureNoticeForVerifiedPayment(payment.order_id, payment);
    if (result.status === 502) return res.status(503).json({ error: result.error });
    if (result.status && ![403, 404, 409].includes(result.status)) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ received: true, notified: Boolean(result.notified || result.alreadyNotified) });
  } catch (error) {
    console.error('Could not process Razorpay failure webhook:', error.message);
    return res.status(503).send('Could not process payment failure webhook.');
  }
};

module.exports = { createOrder, notifyPaymentFailure, handleRazorpayWebhook };
