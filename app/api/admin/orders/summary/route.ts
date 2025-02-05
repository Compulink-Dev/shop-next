import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import UserModel from "@/lib/models/UserModel";
import ProductModel from "@/lib/models/ProductModel";
import { getServerSession } from "next-auth";

import { NextResponse } from "next/server";
import { options } from "@/app/api/auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();

    const ordersCount = await OrderModel.countDocuments();
    const productsCount = await ProductModel.countDocuments();
    const usersCount = await UserModel.countDocuments();

    const ordersPriceGroup = await OrderModel.aggregate([
      {
        $group: {
          _id: null,
          sales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const ordersPrice =
      ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;

    const salesData = await OrderModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productsData = await ProductModel.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const usersData = await UserModel.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return Response.json({
      ordersCount,
      productsCount,
      usersCount,
      ordersPrice,
      salesData,
      productsData,
      usersData,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product." },
      { status: 500 }
    );
  }
}
