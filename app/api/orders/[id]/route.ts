import dbConnect from '@/lib/dbConnect'
import OrderModel from '@/lib/models/OrderModel'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const GET = auth(async (...request: any) => {
  const [req, { params }] = request
  if (!req.auth) {
    return NextResponse.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  await dbConnect()
  const order = await OrderModel.findById(params.id)
  return NextResponse.json(order)
}) as any
