export const handlePayment = async (API_URL, businessData, onSuccess, plan = null, onFailure = () => {}) => {
  try {
    const orderRes = await fetch(`${API_URL}/api/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan
        ? { durationDays: plan.days, advertisementDetails: businessData.advertisementDetails }
        : {
            email: businessData.email,
            ownerName: businessData.ownerName,
            businessName: businessData.businessName,
            businessDetails: businessData.businessDetails,
          })
    });

    const order = await orderRes.json();
    if (!orderRes.ok) throw new Error(order.error || "Failed to create order");
    if (!order.keyId) throw new Error("Razorpay is not configured");

    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "KumariHUB",
      description: `Business Listing Fee - INR ${(Number(order.amount) / 100).toFixed(2)} (GST if applicable)`,
      order_id: order.id,
      ...(plan && { description: `Business Advertisement - ${plan.days} days - INR ${plan.amount}` }),


      handler: async function (response) {
        onSuccess(response);
      },
      prefill: {
        name: businessData.ownerName || businessData.businessName,
        email: businessData.email,
        contact: businessData.phone
      },
      theme: {
        color: "#10B981"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', async (failureResponse) => {
      const error = failureResponse?.error || {};
      const metadata = error.metadata || {};
      const paymentId = metadata.payment_id;
      let emailSent = false;
      if (paymentId) {
        try {
          const response = await fetch(`${API_URL}/api/payment-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, orderId: metadata.order_id || order.id }),
          });
          const result = await response.json();
          emailSent = response.ok && Boolean(result.notified || result.alreadyNotified);
        } catch (failureEmailError) {
          console.error('Could not request payment failure email:', failureEmailError);
        }
      }
      onFailure({
        message: error.description || 'The payment could not be completed.',
        emailSent,
      });
    });
    rzp.open();

  } catch (error) {
    console.error("Payment initialization error:", error);
    alert("Could not initiate payment. Please try again.");
  }
};
