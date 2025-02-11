import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { NextRequest, NextResponse } from "next/server";

// GET Order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const order = await OrderModel.findById(params.id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Error fetching order", error },
      { status: 500 }
    );
  }
}

// PATCH - Update Order Payment Status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    const { isPaid } = await req.json();

    // Validate isPaid input
    if (typeof isPaid !== "boolean") {
      return NextResponse.json(
        { message: "Invalid value for isPaid. Must be a boolean." },
        { status: 400 }
      );
    }

    // Update order
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { isPaid },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Error updating order", error },
      { status: 500 }
    );
  }
}
