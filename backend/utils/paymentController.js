const Razorpay = require('razorpay');

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
    const amountRupees = durationDays ? planPrices[durationDays] : 199;
    if (!amountRupees) {
      return res.status(400).json({ error: 'Choose a valid plan: 15 days or 30 days.' });
    }
    const options = {
      amount: amountRupees * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
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

module.exports = { createOrder };
