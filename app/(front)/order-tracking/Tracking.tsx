'use client'

import { Order } from '@/lib/models/OrderModel'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

export default function Tracking() {
    const router = useRouter()
    const { data: orders, error } = useSWR(`/api/orders/mine`)

    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <></>

    if (error) return 'An error has occurred.'
    if (!orders) return 'Loading...'

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>DATE</th>
                        <th>TOTAL</th>
                        <th>PAID</th>
                        <th>DELIVERED</th>
                        <th>ESTIMATE TIME</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order: Order) => (
                        <tr key={order._id}>
                            <td>{order._id.substring(20, 24)}</td>
                            <td>{order.createdAt.substring(0, 10)}</td>
                            <td>${order.totalPrice}</td>
                            <td className={order.isDelivered && order.deliveredAt ? 'text-green-500' : 'text-red-500'}>
                                {order.isPaid && order.paidAt
                                    ? `${order.paidAt.substring(0, 10)}`
                                    : 'Not paid'}
                            </td>
                            <td className={order.isDelivered && order.deliveredAt ? 'text-green-500' : 'text-red-500'}>
                                {order.isDelivered && order.deliveredAt
                                    ? `${order.deliveredAt.substring(0, 10)}`
                                    : 'Not delivered'}
                            </td>
                            <td className={order.isDelivered ? 'text-green-500' : 'text-red-500'}>
                                {order.isDelivered ? (
                                    //@ts-ignore
                                    `Delivered on: ${new Date(order.deliveredAt).toLocaleDateString()}`
                                ) : order.estimatedDeliveryAt ? (
                                    <>
                                        {`Estimated Delivery: in ${Math.ceil(
                                            (new Date(order.estimatedDeliveryAt).getTime() - Date.now()) / 60000
                                        )} minutes`}
                                    </>
                                ) : (
                                    'Delivery time unavailable'
                                )}
                            </td>

                            <td>
                                <Link href={`/order/${order._id}`} passHref>
                                    Details
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
