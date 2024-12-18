//@ts-ignore
import { Paynow } from 'paynow';

// This is the base PayNow setup similar to the PayPal one
export const paynow = {
    createPayNowOrder: async function createPayNowOrder(orderId: string, amount: number) {
        const paynow = new Paynow(process.env.INTEGRATION_ID, process.env.INTEGRATION_KEY);

        // Set PayNow URLs for redirection and results
        paynow.resultUrl = 'http://example.com/gateways/paynow/update';
        paynow.returnUrl = `http://example.com/return?gateway=paynow&merchantReference=${orderId}`;

        const payment = paynow.createPayment(`Invoice_${orderId}`);

        // Add the order details
        payment.add(`Order ${orderId}`, amount);

        try {
            // Send payment to PayNow and get the redirect and poll URLs
            const response = await paynow.send(payment);

            if (response.success) {
                return {
                    link: response.redirectUrl, // URL to redirect for payment
                    pollUrl: response.pollUrl,  // URL to check the payment status
                };
            } else {
                throw new Error('Failed to create PayNow payment');
            }
        } catch (error) {
            console.error('Error in createPayNowOrder:', error);
            throw error;
        }
    },

    capturePayNowOrder: async function capturePayNowOrder(pollUrl: string) {
        const paynow = new Paynow(process.env.INTEGRATION_ID, process.env.INTEGRATION_KEY);

        try {
            // Poll the payment result
            const status = await paynow.pollTransaction(pollUrl);

            if (status.paid()) {
                // Return details if payment was successful
                return {
                    success: true,
                    paidAt: status.paidAt,
                    paymentDetails: status,
                };
            } else {
                throw new Error('Payment not completed');
            }
        } catch (error) {
            console.error('Error in capturePayNowOrder:', error);
            throw error;
        }
    },
};
