import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import ProductModel from "@/lib/models/ProductModel"; // Ensure import
import { NextResponse } from "next/server";

const validStatuses = [
  "Order Received",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
  "Collected",
];

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const order = await OrderModel.findById(params.id).populate("product");

    if (!order) {
      return NextResponse.json(
        { message: "Tracking data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { message: "Error fetching tracking data", error },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const { id } = params;

  try {
    const { status, message } = await req.json();

    // Validate input
    if (!status || status.trim() === "") {
      return new Response(JSON.stringify({ message: "Status is required" }), {
        status: 400,
      });
    }

    // Validate status value
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ message: "Invalid status value" }), {
        status: 400,
      });
    }

    // Find the order by ID
    const order = await OrderModel.findById(id);

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    // Add tracking information
    order.tracking.push({
      status,
      message,
      timestamp: new Date(),
    });

    await order.save();

    return new Response(
      JSON.stringify({
        message: "Tracking updated successfully",
        tracking: order.tracking,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tracking data:", error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: 500 }
    );
  }
}
