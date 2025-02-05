import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { paypal } from "@/lib/paypal";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  await dbConnect();

  const order = await OrderModel.findById(params.id);
  if (order) {
    try {
      const paypalOrder = await paypal.createOrder(order.totalPrice);
      return NextResponse.json(paypalOrder);
    } catch (err: any) {
      return NextResponse.json(
        { message: err.message },
        {
          status: 500,
        }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Order not found" },
      {
        status: 404,
      }
    );
  }
}
