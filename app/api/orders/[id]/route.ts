import dbConnect from "@/lib/dbConnect";
import OrderModel from "@/lib/models/OrderModel";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const order = await OrderModel.findById(params.id);
  return NextResponse.json(order);
}
