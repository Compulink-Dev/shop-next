import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/lib/models/ProductModel";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const product = await ProductModel.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      slug,
      price,
      category,
      image,
      brand,
      countInStock,
      description,
      part,
    } = await req.json();

    await dbConnect();
    const product = await ProductModel.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    product.name = name;
    product.slug = slug;
    product.price = price;
    product.category = category;
    product.image = image;
    product.brand = brand;
    product.countInStock = countInStock;
    product.description = description;
    product.part = part;

    const updatedProduct = await product.save();
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const product = await ProductModel.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    await product.deleteOne();
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
