//@ts-nocheck
import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { paynow } from "@/lib/paynow";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const MAX_RETRIES = 10; // Reduce retries to 10
const RETRY_DELAY = 10000; // Reduce delay to 10 seconds

async function checkPaymentStatusWithRetry(
  pollUrl: string,
  retries: number = MAX_RETRIES
): Promise<any> {
  let attempt = 0;
  let paymentStatus;

  while (attempt < retries) {
    try {
      console.log(
        `Attempting to check payment status, attempt #${attempt + 1}`
      );
      paymentStatus = await paynow.capturePayNowOrder(pollUrl);

      if (
        paymentStatus.success &&
        paymentStatus.paymentDetails?.status === "paid"
      ) {
        return paymentStatus; // Payment is successful
      }

      console.log(
        `Payment not completed. Retrying in ${RETRY_DELAY / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // Wait before retrying
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
    attempt++;
  }

  // If all retries failed, return the last status received
  return paymentStatus;
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Get the session data to confirm the user is logged in
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Connect to the database
  await dbConnect();

  // Retrieve the order using the provided ID
  const order = await OrderModel.findById(params.id);
  if (!order) {
    console.error("Order not found for ID:", params.id);
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  // If there is no poll URL, the payment cannot be verified
  if (!order.paymentPollUrl) {
    console.error("No poll URL found for order:", order._id);
    return NextResponse.json(
      { message: "Poll URL not found" },
      { status: 400 }
    );
  }

  try {
    console.log("Checking payment status for order:", order._id);
    console.log("Poll URL:", order.paymentPollUrl);

    // Capture the payment status with retry logic
    const paymentStatus = await checkPaymentStatusWithRetry(
      order.paymentPollUrl
    );
    console.log("Payment status response:", paymentStatus);

    // Check if paymentDetails exists and contains a valid status
    const paymentDetails = paymentStatus?.paymentDetails;
    if (!paymentDetails || !paymentDetails.status) {
      console.error(
        "Payment status is missing or undefined for order:",
        order._id
      );
      return NextResponse.json(
        { message: "Unable to fetch payment status" },
        { status: 500 }
      );
    }

    // Handle payment status response
    switch (paymentDetails.status) {
      case "paid":
        // Payment successful
        console.log("Payment successfully verified for order:", order._id);
        order.status = "paid"; // Set order status to 'paid'
        order.isPaid = true;
        order.paidAt = new Date(); // Record the payment timestamp
        order.paymentDetails = paymentDetails; // Attach payment details to the order
        await order.save();
        return NextResponse.json({ message: "Payment verified", isPaid: true });

      case "created":
      case "pending":
        // Payment is in process or hasn't been completed yet
        console.log("Payment still in progress for order:", order._id);
        return NextResponse.json({
          message: "Payment not completed yet, please try again later",
          isPaid: false,
        });

      default:
        console.warn("Unexpected payment status:", paymentDetails.status);
        return NextResponse.json({
          message: `Unexpected payment status: ${paymentDetails.status}`,
          isPaid: false,
        });
    }
  } catch (err) {
    // Log the error and respond with an appropriate message
    console.error("Error verifying PayNow payment:", err);
    return NextResponse.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
