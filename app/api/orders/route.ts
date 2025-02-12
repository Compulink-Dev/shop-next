import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import ProductModel from "@/lib/models/ProductModel";
import { round2 } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { options } from "../auth/[...nextauth]/options";
import { OrderItem } from "@/lib/types";

const calcPrices = (orderItems: OrderItem[]) => {
  // Calculate the items price
  const itemsPrice = round2(
    orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  // Calculate the shipping price
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 10);
  // Calculate the tax price
  const taxPrice = round2(Number((0.15 * itemsPrice).toFixed(2)));
  // Calculate the total price
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

export async function POST(req: any) {
  const session = await getServerSession(options);
  console.log("Session", session);

  try {
    const payload = await req.json();
    await dbConnect();
    const dbProductPrices = await ProductModel.find(
      {
        _id: { $in: payload.items.map((x: { _id: string }) => x._id) },
      },
      "price"
    );
    const dbOrderItems = payload.items.map((item: { _id: string }) => {
      const product = dbProductPrices.find(
        (prod) => prod._id.toString() === item._id.toString()
      );

      if (product) {
        return {
          ...item,
          product: item._id,
          price: product.price, // Correctly assigning the price here
          _id: undefined,
        };
      }
      // Handle the case where product is not found, if necessary
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbOrderItems);

    const newOrder = new OrderModel({
      items: dbOrderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod,
      user: session?.user._id,
    });

    const createdOrder = await newOrder.save();
    return NextResponse.json(
      { message: "Order has been created", order: createdOrder },
      {
        status: 201,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      {
        status: 500,
      }
    );
  }
}
