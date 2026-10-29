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
    res.json(order);
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

module.exports = { createOrder };
