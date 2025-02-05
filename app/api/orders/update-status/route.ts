import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

export async function PATCH(req: any) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { user } = req.auth;
  const { orderId, status } = await req.json();

  try {
    await dbConnect();

    // Find the order by ID
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if the user is authorized to update the order status (only the admin or user who created it)
    if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
      return NextResponse.json(
        { message: "Not authorized to update this order" },
        { status: 403 }
      );
    }

    // Update the order status and add the tracking entry
    const newStatus = {
      status,
      timestamp: new Date(),
    };

    order.tracking.push(newStatus);

    // Update the order status and save it
    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else if (status === "Paid") {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    await order.save();

    return NextResponse.json(
      { message: "Order status updated", order },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
