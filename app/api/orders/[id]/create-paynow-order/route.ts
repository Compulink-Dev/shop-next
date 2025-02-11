//@ts-nocheck
import { options } from "@/app/api/auth/[...nextauth]/options";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { paynow } from "@/lib/paynow";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
    console.log("❌ Poll URL missing for order:", order._id);
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  try {
    console.log("Creating PayNow order for order:", order._id);

    const { link, pollUrl } = await paynow.createPayNowOrder(
      order._id,
      order.totalPrice
    );

    console.log("✅ Poll URL:", pollUrl);

    if (!pollUrl) {
      console.error("❌ Poll URL missing from PayNow response:", {
        link,
        pollUrl,
      });
      return NextResponse.json(
        { message: "PayNow poll URL missing" },
        { status: 500 }
      );
    }

    console.log("✅ Poll URL retrieved:", pollUrl);

    console.log("PayNow link generated:", link);

    // Save the poll URL in the order
    order.paymentPollUrl = pollUrl;
    await order.save(); // Ensure poll URL is saved to the database

    return NextResponse.json({ link });
  } catch (err) {
    console.error("Error creating PayNow order:", err);
    console.log("Error creating PayNow order:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
