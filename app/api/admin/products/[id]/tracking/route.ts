import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/lib/models/ProductModel";

// GET Tracking Information
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const product = await ProductModel.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tracking: product.tracking });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { message: "Error fetching tracking data" },
      { status: 500 }
    );
  }
}

// POST Update Tracking Information
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { status, message } = await req.json();

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      params.id,
      {
        $push: {
          tracking: {
            status,
            message,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tracking: updatedProduct.tracking });
  } catch (error) {
    console.error("Error updating tracking data:", error);
    return NextResponse.json(
      { message: "Error updating tracking data" },
      { status: 500 }
    );
  }
}
