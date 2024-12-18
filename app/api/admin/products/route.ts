import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import ProductModel from '@/lib/models/ProductModel'

export const GET = auth(async (req: any) => {
  // if (!req.auth || !req.auth.user?.isAdmin) {
  //   return Response.json(
  //     { message: 'unauthorized' },
  //     {
  //       status: 401,
  //     }
  //   )
  // }
  await dbConnect()
  const products = await ProductModel.find()
  return Response.json(products)
}) as any

export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  await dbConnect()
  // Define the dummy tracking data
  const trackingData = [
    {
      status: 'Order Received',
      timestamp: new Date('2024-12-10T08:00:00Z'),
      message: 'Your order has been received and is being processed.',
    },
  ]

  // Create a new product with tracking data
  const product = new ProductModel({
    name: 'Laptop',
    slug: 'laptop-123',
    image: '/images/laptop.jpg',
    price: 1200,
    category: 'Electronics',
    brand: 'TechBrand',
    countInStock: 50,
    description: 'High-performance laptop for gaming and work.',
    rating: 4.5,
    numReviews: 15,
    tracking: trackingData,  // Include tracking data
  })
  try {
    await product.save()
    return Response.json(
      { message: 'Product created successfully', product },
      {
        status: 201,
      }
    )
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      }
    )
  }
}) as any
