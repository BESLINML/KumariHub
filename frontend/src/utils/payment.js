export const handlePayment = async (API_URL, businessData, onSuccess) => {
  try {
    // 1. Create Order from Backend
    const orderRes = await fetch(`${API_URL}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!orderRes.ok) throw new Error("Failed to create order");
    const order = await orderRes.json();

    // 2. Configure Razorpay Options
    const options = {
      key: "rzp_test_TbnCjuzHe8P0cj",
      amount: order.amount,
      currency: order.currency,
      name: "KumariHUB",
      description: "Business Listing Verification Fee (₹199)",
      order_id: order.id,
      handler: async function (response) {
        // Payment success aana antha response-ai callback moolama anupprom
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