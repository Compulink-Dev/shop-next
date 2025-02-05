import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/UserModel";
import { options } from "../../auth/[...nextauth]/options";

export async function GET(req: Request) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await dbConnect();
    const users = await UserModel.find();
    return Response.json(users);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
