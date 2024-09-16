import React from 'react'
import Tracking from './Tracking'

function OrderTracking({
    orderId,
    paypalClientId,
}: {
    orderId: string
    paypalClientId: string
}) {

    return (
        <div className='text-2xl py-2'>
            <p className="">Order Tracking</p>
            <div className="">
                <Tracking />
            </div>
        </div>
    )
}

export default OrderTracking