"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ShippingAddress {
  address: string;
  city: string;
  country: string;
  fullName: string;
  postalCode: string;
}

interface Item {
  product: string;
  name: string;
  slug: string;
  qty: number;
  image: string;
  price: number;
}

interface Tracking {
  message: string;
  status: string;
  timestamp: string;
}

interface Order {
  _id: string;
  user: string;
  items: Item[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  tracking: Tracking[];
}

export default function Result() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) throw new Error("Failed to fetch order");

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const markAsPaid = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true }),
      });

      if (!response.ok) throw new Error("Failed to update payment status");

      const updatedOrder = await response.json();
      setOrder(updatedOrder); // Update UI after change
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!order) return <div>Order not found</div>;

  return (
    <div className="p-6">
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold mb-4">Order Summary</h1>
        <Button onClick={() => router.push(`/order/${order._id}`)}>
          Check Order
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="">
          <h2 className="text-lg font-semibold mt-4">Shipping Address</h2>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.country}
          </p>
          <p>Postal Code: {order.shippingAddress.postalCode}</p>
        </div>
        <div className="">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={order.isPaid ? "text-green-500" : "text-red-500"}>
              {order.isPaid ? "Paid" : "Pending"}
            </span>
          </p>
          <p>
            <strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}
          </p>
          {!order.isPaid && (
            <Button className="mt-4 bg-green-500" onClick={markAsPaid}>
              Mark as Paid
            </Button>
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-4">Items</h2>
      {order.items.map((item) => (
        <div key={item.product} className="border-b flex gap-4 items-center ">
          <img
            src={item.image}
            alt={item.name}
            className="w-56 h-56 object-contain"
          />
          <div className="">
            <p>
              <strong>{item.name}</strong>
            </p>
            <p>Quantity: {item.qty}</p>
            <p>Price: ${item.price.toFixed(2)}</p>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <div className="">
          <h2 className="text-lg font-semibold mt-2">Tracking</h2>
          {order.tracking.map((track, index) => (
            <div key={index} className=" ">
              <p>
                <strong>Status:</strong> {track.status}
              </p>
              <p>
                <strong>Message:</strong> {track.message}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(track.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="">
          <h2 className="text-lg font-semibold mt-2">Order Totals</h2>
          <p>Items Price: ${order.itemsPrice.toFixed(2)}</p>
          <p>Shipping Price: ${order.shippingPrice.toFixed(2)}</p>
          <p>Tax Price: ${order.taxPrice.toFixed(2)}</p>
          <p>
            <strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
