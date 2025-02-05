import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/lib/models/UserModel";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
  const user = await UserModel.findById(params.id);
  if (!user) {
    return Response.json(
      { message: "user not found" },
      {
        status: 404,
      }
    );
  }
  return Response.json(user);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, email, isAdmin } = await req.json();

  try {
    await dbConnect();
    const user = await UserModel.findById(params.id);
    if (user) {
      user.name = name;
      user.email = email;
      user.isAdmin = Boolean(isAdmin);

      const updatedUser = await user.save();
      return Response.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } else {
      return Response.json(
        { message: "User not found" },
        {
          status: 404,
        }
      );
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      }
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
    const user = await UserModel.findById(params.id);
    if (user) {
      if (user.isAdmin)
        return Response.json(
          { message: "User is admin" },
          {
            status: 400,
          }
        );
      await user.deleteOne();
      return Response.json({ message: "User deleted successfully" });
    } else {
      return Response.json(
        { message: "User not found" },
        {
          status: 404,
        }
      );
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      }
    );
  }
}
