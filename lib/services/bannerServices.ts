import { cache } from "react";
import dbConnect from "../dbConnect";
import BannerModel from "../models/BannerModel";

const getBanners = cache(async () => {
  await dbConnect();
  const banner = await BannerModel.find().limit(3).lean();
  return banner as any[];
});

export default getBanners;
