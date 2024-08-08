import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import BannerModel from '@/lib/models/BannerModel'

export const GET = auth(async (...args: any) => {
    const [req, { params }] = args
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
            { message: 'unauthorized' },
            {
                status: 401,
            }
        )
    }
    await dbConnect()
    const banner = await BannerModel.findById(params.id)
    if (!banner) {
        return Response.json(
            { message: 'Banner not found' },
            {
                status: 404,
            }
        )
    }
    return Response.json(banner)
}) as any

export const PUT = auth(async (...args: any) => {
    const [req, { params }] = args
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
            { message: 'unauthorized' },
            {
                status: 401,
            }
        )
    }

    const {
        name,
        slug,
        image,

    } = await req.json()

    try {
        await dbConnect()

        const banner = await BannerModel.findById(params.id)
        if (banner) {
            banner.name = name
            banner.slug = slug
            banner.image = image


            const updatedbanner = await banner.save()
            return Response.json(updatedbanner)
        } else {
            return Response.json(
                { message: 'Banner not found' },
                {
                    status: 404,
                }
            )
        }
    } catch (err: any) {
        return Response.json(
            { message: err.message },
            {
                status: 500,
            }
        )
    }
}) as any

export const DELETE = auth(async (...args: any) => {
    const [req, { params }] = args

    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
            { message: 'unauthorized' },
            {
                status: 401,
            }
        )
    }

    try {
        await dbConnect()
        const banner = await BannerModel.findById(params.id)
        if (banner) {
            await banner.deleteOne()
            return Response.json({ message: 'Banner deleted successfully' })
        } else {
            return Response.json(
                { message: 'Banner not found' },
                {
                    status: 404,
                }
            )
        }
    } catch (err: any) {
        return Response.json(
            { message: err.message },
            {
                status: 500,
            }
        )
    }
}) as any
