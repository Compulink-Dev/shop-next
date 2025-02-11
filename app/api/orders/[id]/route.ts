import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { NextResponse, NextRequest } from "next/server";

// const validStatuses = [
//   "Order Received",
//   "Shipped",
//   "In Transit",
//   "Out for Delivery",
//   "Delivered",
//   "Collected",
// ];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;
    const order = await OrderModel.findById(id)
      .populate({ path: "tracking.product", select: "name slug" })
      .populate({ path: "user", select: "name email" });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ tracking: order.tracking }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
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
