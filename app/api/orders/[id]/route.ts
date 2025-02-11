import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const order = await OrderModel.findById(params.id);
  return NextResponse.json(order);
}

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    await dbConnect();
    const { orderId } = params;
    const { isPaid } = await req.json(); // Assuming payment update sends { isPaid: true }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { isPaid },
      { new: true }
    );

    if (!updatedOrder)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating order", error },
      { status: 500 }
    );
  }
}
