//@ts-ignore
import { Paynow } from "paynow";

// This is the base PayNow setup similar to the PayPal one
export const paynow = {
  createPayNowOrder: async function createPayNowOrder(
    orderId: string,
    amount: number
  ) {
    const paynow = new Paynow(
      process.env.INTEGRATION_ID,
      process.env.INTEGRATION_KEY
    );

    // Set PayNow URLs for redirection and results
    paynow.resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${orderId}/verify-paynow`;
    paynow.returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/order/${orderId}`;

    const payment = paynow.createPayment(`Invoice_${orderId}`);

    // Add the order details
    payment.add(`Order ${orderId}`, amount);

    try {
      // Send payment to PayNow and get the redirect and poll URLs
      const response = await paynow.send(payment);

      if (response.success) {
        return {
          link: response.redirectUrl, // URL to redirect for payment
          pollUrl: response.pollUrl, // URL to check the payment status
        };
      } else {
        throw new Error("Failed to create PayNow payment");
      }
    } catch (error) {
      console.error("Error in createPayNowOrder:", error);
      throw error;
    }
  },

  capturePayNowOrder: async function capturePayNowOrder(pollUrl: string) {
    const paynow = new Paynow(
      process.env.INTEGRATION_ID,
      process.env.INTEGRATION_KEY
    );

    try {
      // Poll the payment result
      let paymentStatus;
      let retryCount = 0;
      const maxRetries = 5;

      // Retry mechanism for polling
      while (retryCount < maxRetries) {
        paymentStatus = await paynow.pollTransaction(pollUrl);
        console.log("Payment status received:", paymentStatus);

        if (paymentStatus.status === "paid") {
          break;
        }
        retryCount++;
        // Wait before retrying (e.g., 5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (paymentStatus.status !== "paid") {
        console.error("Payment not completed after retries");
        return { success: false, message: "Payment not completed" };
      }

      return {
        success: true,
        id: paymentStatus.transactionId, // Extracting transaction ID
        paidAt: paymentStatus.paidAt,
        paymentDetails: paymentStatus,
      };
    } catch (error) {
      console.error("Error in capturePayNowOrder:", error);
      throw error;
    }
  },
};
