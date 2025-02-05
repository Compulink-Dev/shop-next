import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import BannerModel from "@/lib/models/BannerModel";
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
  const banner = await BannerModel.findById(params.id);
  if (!banner) {
    return Response.json(
      { message: "Banner not found" },
      {
        status: 404,
      }
    );
  }
  return Response.json(banner);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, slug, image } = await req.json();

  try {
    await dbConnect();

    const banner = await BannerModel.findById(params.id);
    if (banner) {
      banner.name = name;
      banner.slug = slug;
      banner.image = image;

      const updatedbanner = await banner.save();
      return Response.json(updatedbanner);
    } else {
      return Response.json(
        { message: "Banner not found" },
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
    const banner = await BannerModel.findById(params.id);
    if (banner) {
      await banner.deleteOne();
      return Response.json({ message: "Banner deleted successfully" });
    } else {
      return Response.json(
        { message: "Banner not found" },
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
