"use client";
import AdminLoading from "@/components/admin/AdminLoading";
import { fetcher } from "@/lib/services/fetcher";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Tracking() {
  const router = useRouter();
  const { data: orders, error } = useSWR(`/api/orders/mine`, fetcher);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <></>;

  if (error) return "An error has occurred.";
  if (!orders) return <AdminLoading />;

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Delivered</th>
            <th>Estimate time </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order._id}>
              <td
                className={
                  order.isDelivered && order.deliveredAt
                    ? "text-blue-500"
                    : "text-red-500"
                }
              >
                {order._id.substring(20, 24)}
              </td>
              <td
                className={
                  order.isDelivered && order.deliveredAt
                    ? "text-blue-500"
                    : "text-red-500"
                }
              >
                {order.createdAt.substring(0, 10)}
              </td>
              <td
                className={
                  order.isDelivered && order.deliveredAt
                    ? "text-blue-500"
                    : "text-red-500"
                }
              >
                ${order.totalPrice}
              </td>
              <td
                className={
                  order.isDelivered && order.deliveredAt
                    ? "text-blue-500"
                    : "text-red-500"
                }
              >
                {order.isPaid && order.paidAt
                  ? `${order.paidAt.substring(0, 10)}`
                  : "Not paid"}
              </td>
              <td
                className={
                  order.isDelivered && order.deliveredAt
                    ? "text-blue-500"
                    : "text-red-500"
                }
              >
                {order.isDelivered && order.deliveredAt
                  ? `${order.deliveredAt.substring(0, 10)}`
                  : "Not delivered"}
              </td>
              <td
                className={order.isDelivered ? "text-blue-500" : "text-red-500"}
              >
                {order.isDelivered ? (
                  //@ts-ignore
                  `Delivered on: ${new Date(
                    order.deliveredAt
                  ).toLocaleDateString()}`
                ) : order.estimatedDeliveryAt ? (
                  <>
                    {`Estimated Delivery: in ${Math.ceil(
                      (new Date(order.estimatedDeliveryAt).getTime() -
                        Date.now()) /
                        60000
                    )} minutes`}
                  </>
                ) : (
                  "Delivery time unavailable"
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
  );
}
