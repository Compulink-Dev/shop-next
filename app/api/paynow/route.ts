// app/api/paynow/route.ts

import { NextResponse } from 'next/server';
//@ts-ignore
import { Paynow } from 'paynow';

// Paynow integration details
const INTEGRATION_ID = process.env.NEXT_PUBLIC_PAYNOW_ID || 'your_integration_id';
const INTEGRATION_KEY = process.env.NEXT_PUBLIC_PAYNOW_KEY || 'your_integration_key';

const paynow = new Paynow(INTEGRATION_ID, INTEGRATION_KEY);

export async function GET() {
    try {
        // Create a new payment
        const payment = paynow.createPayment("Invoice 35");

        // Add items to the payment list
        payment.add("Bananas", 2.5);
        payment.add("Apples", 3.4);

        // Set return and result URLs
        paynow.resultUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/paynow/result`;
        paynow.returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/return?gateway=paynow&merchantReference=1234`;

        // Send off the payment to Paynow
        const response = await paynow.send(payment);

        // Check if request was successful
        if (response.success) {
            return NextResponse.json({
                redirectUrl: response.redirectUrl,
                pollUrl: response.pollUrl
            });
        } else {
            return NextResponse.json({ error: 'Payment creation failed', details: response }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
    }
}
