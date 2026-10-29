const crypto = require('node:crypto');
const Razorpay = require('razorpay');

const verifyRazorpayPayment = async (req, res, next) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(503).json({ error: 'Payments are not configured.' });
  if (!orderId || !paymentId || !signature) return res.status(400).json({ error: 'Payment verification details are required.' });

  try {
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest();
    const received = Buffer.from(signature, 'hex');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      return res.status(400).json({ error: 'Payment signature is invalid.' });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const payment = await razorpay.payments.fetch(paymentId);
    const amountRupees = req.body.durationDays
      ? ({ 15: 299, 30: 499 }[Number(req.body.durationDays)] || 0)
      : 199;
    if (payment.order_id !== orderId || payment.status !== 'captured' || payment.amount !== amountRupees * 100 || payment.currency !== 'INR') {
      return res.status(400).json({ error: 'Payment does not match the selected purchase.' });
    }

    req.verifiedPaymentId = paymentId;
    return next();
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    return res.status(400).json({ error: 'Payment could not be verified.' });
  }
};

module.exports = verifyRazorpayPayment;
