const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id:"rzp_test_TbnCjuzHe8P0cj",
  key_secret:"oOivvAYZQHN5yWXnGFcPGVXB"
});

const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 199 * 100, // ₹199 in paise
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