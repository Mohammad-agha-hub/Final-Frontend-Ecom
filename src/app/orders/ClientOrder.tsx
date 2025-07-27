"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Loading from "../loading";

type OrderItem = {
  id: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: {
    id: string;
    product: {
      name: string;
      image: string;
    };
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
};

export default function OrderClient({ orders }: { orders: OrderItem[] }) {
  const [orderItems] = useState<OrderItem[]>(orders);
  const [loading] = useState(false);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-center mb-6">
          Your Order History
        </h1>

        {orderItems.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No orders found.
          </div>
        ) : (
          <div className="space-y-8">
            {orderItems.map((order) => (
              <Card key={order.id} className="shadow-md rounded-2xl border">
                <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                  <div>
                    <p className="text-md font-medium text-gray-700">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </CardHeader>

                <CardContent className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 relative">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.product.image}`}
                          alt={item.product.name}
                          fill
                          className="rounded object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-md font-semibold text-gray-800">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Size: <span className="font-medium">{item.size}</span>{" "}
                          | Color:{" "}
                          <span className="font-medium">{item.color}</span> |
                          Qty:{" "}
                          <span className="font-medium">{item.quantity}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: Rs {item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 border-t pt-4">
                    <div>
                      <p className="font-semibold">Shipping Address</p>
                      <p>
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.address}</p>
                      {order.shippingAddress.apartment && (
                        <p>Apartment: {order.shippingAddress.apartment}</p>
                      )}
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state},{" "}
                        {order.shippingAddress.country}
                      </p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>

                    <div>
                      <p className="font-semibold mb-1">Order Summary</p>
                      <div className="flex justify-between">
                        <span>Shipping Charges</span>
                        <span>
                          Rs {(order.shippingAmount ?? 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span>
                          - Rs {order.discountAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 mt-2">
                        <span>Total</span>
                        <span>Rs {order.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-600">Payment: </span>
                        <span className="font-medium">
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : "PayPal"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
