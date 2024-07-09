import dbConnect from '@/lib/dbConnect'
import OrderModel from '@/lib/models/OrderModel'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const GET = auth(async (req: any) => {
  if (!req.auth) {
    return NextResponse.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  const { user } = req.auth
  await dbConnect()
  const orders = await OrderModel.find({ user: user._id })
  return NextResponse.json(orders)
}) as any
