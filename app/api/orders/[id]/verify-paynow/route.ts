// app/api/orders/[id]/verify-paynow/route.ts
//@ts-nocheck
import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { paynow } from "@/lib/paynow";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const MAX_RETRIES = 5; // Reduce retries to 5
const RETRY_DELAY = 5000; // Reduce delay to 5 seconds
const PAYNOW_TIMEOUT = 10000; // 10s fetch timeout

export const config = {
  api: {
    responseLimit: false,
    bodyParser: { sizeLimit: "1mb" },
    externalResolver: true, // Prevents Vercel timeouts
  },
};

// Retry logic for checking PayNow payment status
async function checkPaymentStatusWithRetry(
  pollUrl: string,
  retries: number = MAX_RETRIES
) {
  let attempt = 0;
  let paymentStatus;

  while (attempt < retries) {
    try {
      console.log(`Checking PayNow payment status (Attempt #${attempt + 1})`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PAYNOW_TIMEOUT);

      // Fetch payment status from PayNow
      paymentStatus = await paynow.capturePayNowOrder(pollUrl);

      clearTimeout(timeout);

      if (
        paymentStatus.success &&
        paymentStatus.paymentDetails?.status === "paid"
      ) {
        return paymentStatus; // Payment confirmed
      }

      console.log(
        `Payment still pending, retrying in ${RETRY_DELAY / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // Delay before retry
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
    attempt++;
  }

  return paymentStatus; // Return last known status
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const order = await OrderModel.findById(params.id);

  if (!order) {
    console.error("Order not found:", params.id);
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  if (!order.paymentPollUrl) {
    console.error("Missing PayNow poll URL for order:", order._id);
    return NextResponse.json(
      { message: "Poll URL not found" },
      { status: 400 }
    );
  }

  try {
    console.log("Verifying payment for order:", order._id);
    console.log("Using Poll URL:", order.paymentPollUrl);

    const paymentStatus = await checkPaymentStatusWithRetry(
      order.paymentPollUrl
    );
    console.log("Received payment status:", paymentStatus);

    const paymentDetails = paymentStatus?.paymentDetails;
    if (!paymentDetails || !paymentDetails.status) {
      console.error("Invalid payment status for order:", order._id);
      return NextResponse.json(
        { message: "Payment status unavailable" },
        { status: 500 }
      );
    }

    // Update order status based on payment result
    switch (paymentDetails.status) {
      case "paid":
        order.status = "paid";
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentDetails = paymentDetails;
        await order.save();
        console.log("Payment successful for order:", order._id);
        return NextResponse.json({ message: "Payment verified", isPaid: true });

      case "created":
      case "pending":
        console.log("Payment still processing for order:", order._id);
        return NextResponse.json({
          message: "Payment pending, try again later",
          isPaid: false,
        });

      default:
        console.warn("Unexpected payment status:", paymentDetails.status);
        return NextResponse.json({
          message: `Unexpected status: ${paymentDetails.status}`,
          isPaid: false,
        });
    }
  } catch (err) {
    console.error("Error verifying PayNow payment:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
