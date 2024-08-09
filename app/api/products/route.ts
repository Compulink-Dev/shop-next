import dbConnect from '@/lib/dbConnect'
import ProductModel from '@/lib/models/ProductModel'

export const GET = (async (req: any) => {
    await dbConnect()
    const products = await ProductModel.find()
    return Response.json(products)
}) as any
