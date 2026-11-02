export const handlePayment = async (API_URL, businessData, onSuccess, plan = null) => {
  try {
    const orderRes = await fetch(`${API_URL}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan ? { durationDays: plan.days } : {})
    });

    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error || "Failed to create order");
    if (!order.keyId) throw new Error("Razorpay is not configured");

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "KumariHUB",
      description: "Business Listing Fee - ₹199 (Inclusive of all taxes)",
      order_id: order.id,
      ...(plan && { description: `Business Advertisement - ${plan.days} days - INR ${plan.amount}` }),


      config: {
        display: {
          blocks: {
            upi: {
              name: "Pay using UPI",
              instruments: [
                {
                  method: "upi"
                }
              ]
            }
          },
          sequence: ["block.upi", "block.card", "block.netbanking"],
          preferences: {
            show_default_blocks: true
          }
        }
      },


      handler: async function (response) {
        onSuccess(response);
      },
      prefill: {
        name: businessData.businessName,
        contact: businessData.phone
      },
      theme: {
        color: "#10B981"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error("Payment initialization error:", error);
    alert("Could not initiate payment. Please try again.");
  }
};
