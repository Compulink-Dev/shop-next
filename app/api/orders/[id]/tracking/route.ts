import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import ProductModel from "@/lib/models/ProductModel";

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

  const { id } = params;

  try {
    // Find the order by ID and populate tracking data
    const order = await OrderModel.findById(id)
      .populate("tracking.product", "name slug")
      .populate("user", "name email");

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
      });
    }

    // Return tracking data
    return new Response(JSON.stringify({ tracking: order.tracking }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return new Response(
      JSON.stringify({
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
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

  const { status, message } = await req.json();

  // Validate input
  if (!status || !validStatuses.includes(status)) {
    return new Response(JSON.stringify({ message: "Invalid status" }), {
      status: 400,
    });
  }

  try {
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
