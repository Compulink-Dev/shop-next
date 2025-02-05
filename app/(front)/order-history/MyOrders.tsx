"use client";
//@ts-ignore
import { Order } from "@/lib/models/OrderModel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/services/fetcher";
import AdminLoading from "@/components/admin/AdminLoading";

export default function MyOrders() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      //@ts-ignore
      setSession(sessionData);
    };

    fetchSession();
    setMounted(true);
  }, []);

  const { data: orders, error } = useSWR(
    //@ts-ignore
    session?.user.isAdmin ? "/api/orders/admin" : "/api/orders/mine",
    fetcher
  );

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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: Order) => (
            <tr key={order._id}>
              <td
                className={order.isDelivered ? "text-blue-500" : "text-red-500"}
              >
                {order._id.substring(20, 24)}
              </td>
              <td
                className={order.isDelivered ? "text-blue-500" : "text-red-500"}
              >
                {order.createdAt.substring(0, 10)}
              </td>
              <td
                className={order.isDelivered ? "text-blue-500" : "text-red-500"}
              >
                ${order.totalPrice}
              </td>
              <td
                className={order.isDelivered ? "text-blue-500" : "text-red-500"}
              >
                {order.isPaid && order.paidAt
                  ? `${order.paidAt.substring(0, 10)}`
                  : "Not paid"}
              </td>
              <td
                className={order.isDelivered ? "text-blue-500" : "text-red-500"}
              >
                {order.isDelivered && order.deliveredAt
                  ? `${order.deliveredAt.substring(0, 10)}`
                  : "Not delivered"}
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
