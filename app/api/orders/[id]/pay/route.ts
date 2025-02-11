import { NextResponse } from "next/server";
import Order from "@/lib/models/OrderModel";
import dbConnect from "@/lib/dbConnect";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    await dbConnect();
    const { orderId } = params;
    const { isPaid } = await req.json(); // Assuming payment update sends { isPaid: true }

    const updatedOrder = await Order.findByIdAndUpdate(
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
