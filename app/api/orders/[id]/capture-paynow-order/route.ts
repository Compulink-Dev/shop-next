//@ts-nocheck
import { options } from "@/app/api/auth/[...nextauth]/options";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { paynow } from "@/lib/paynow";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Define a type for the request and params
type Context = {
  params: { id: string };
};

// Ensure the handler returns a Promise<Response>

export async function POST(req: Request, context: Context) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Find the order by the ID from the request params
    const order = await OrderModel.findById(context.params.id);

    if (!order || !order.paymentPollUrl) {
      return new Response(
        JSON.stringify({
          message: "Order not found or paymentPollUrl missing",
        }),
        { status: 404 }
      );
    }

    // Call PayNow to capture the order
    const paymentStatus = await paynow.capturePayNowOrder(order.paymentPollUrl);

    // Check if the payment was successful
    if (paymentStatus.success) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: paymentStatus.id,
        update_time: paymentStatus.update_time,
        email_address: paymentStatus.email_address,
      };

      const updatedOrder = await order.save();

      // Return the updated order details as the response
      return new Response(JSON.stringify(updatedOrder), { status: 200 });
    } else {
      return new Response(
        JSON.stringify({ message: "Payment not completed" }),
        { status: 400 }
      );
    }
  } catch (err) {
    // Return a 500 error with the error message
    return new Response(
      JSON.stringify({
        message: err instanceof Error ? err.message : "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}
