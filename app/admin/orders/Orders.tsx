"use client";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLoading from "@/components/admin/AdminLoading";
import DataError from "@/components/admin/DataError";
import { fetcher } from "@/lib/services/fetcher";
import Link from "next/link";
import useSWR from "swr";

export default function Orders() {
  const {
    data: orders,
    error,
    isLoading,
  } = useSWR(`/api/admin/orders`, fetcher);

  console.log("Orders Response:", orders); // Debug orders data

  if (error) return <div>An error has occurred: {error.message}</div>;

  if (isLoading) return <AdminLoading />;

  // If no orders are returned, display an appropriate message
  if (!orders || orders.length === 0) return <DataError name="orders" />;

  return (
    <div>
      <h1 className="py-4 text-2xl">Orders</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Delivered</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order._id}>
                <td
                  className={`${
                    order.isDelivered ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  ..{order._id.substring(20, 24)}
                </td>
                <td
                  className={`${
                    order.isDelivered ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  {order.user?.name || "Deleted user"}
                </td>
                <td
                  className={`${
                    order.isDelivered ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  {order.createdAt.substring(0, 10)}
                </td>
                <td
                  className={`${
                    order.isDelivered ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  ${order.totalPrice}
                </td>
                <td
                  className={`${
                    order.isDelivered ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  {order.isPaid && order.paidAt
                    ? `${order.paidAt.substring(0, 10)}`
                    : "not paid"}
                </td>
                <td
                  className={`${
                    order.isDelivered ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  {order.isDelivered && order.deliveredAt
                    ? `${order.deliveredAt.substring(0, 10)}`
                    : "not delivered"}
                </td>
                <td className={`${order.isDelivered ? "" : ""}`}>
                  <Link href={`/order/${order._id}`} passHref>
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
