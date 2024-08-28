// app/api/paynow/result/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('Payment result:', data);

        // Process the result from Paynow as needed

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error processing result', details: error }, { status: 500 });
    }
}
