//@ts-nocheck
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import OrderModel from '@/lib/models/OrderModel';
import { paynow } from '@/lib/paynow';

export const POST = auth(async (req, { params }) => {
    if (!req.auth) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const order = await OrderModel.findById(params.id);
    if (order) {
        try {
            const { link, pollUrl } = await paynow.createPayNowOrder(order._id, order.totalPrice);

            // Save poll URL to the order for later use
            order.paymentPollUrl = pollUrl;
            await order.save();

            return Response.json({ link });
        } catch (err) {
            return Response.json({ message: err.message }, { status: 500 });
        }
    } else {
        return Response.json({ message: 'Order not found' }, { status: 404 });
    }
});
