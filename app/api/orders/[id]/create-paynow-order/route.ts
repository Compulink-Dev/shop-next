//@ts-nocheck
import { options } from "@/app/api/auth/[...nextauth]/options";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { paynow } from "@/lib/paynow";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/*************  ✨ Codeium Command ⭐  *************/
/******  164239dc-98e7-4c19-bc14-f6ec8e181428  *******/

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  await dbConnect();

  const order = await OrderModel.findById(params.id);
  if (order) {
    try {
      const { link, pollUrl } = await paynow.createPayNowOrder(
        order._id,
        order.totalPrice
      );

      // Save poll URL to the order for later use
      order.paymentPollUrl = pollUrl;
      await order.save();

      return NextResponse.json({ link });
    } catch (err) {
      return NextResponse.json({ message: err.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }
}
