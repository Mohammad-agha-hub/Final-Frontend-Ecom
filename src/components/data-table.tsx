"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSettingsStore } from "@/utils/shippingStore";

type Address = {
  address: string;
  apartment?: string | null;
  city: string;
  postalCode: string;
  country: string;
};

type OrderItem = {
  id: string;
  productId: string;
  product: {
    name: string;
    image: string;
  };
  quantity: number;
  color: string;
  size: string;
  price: number;
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  userId: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  items: OrderItem[];
};

type User = {
  id: string;
  username: string;
  email: string;
};

type Props = {
  orders: Order[];
  users: User[];
};

export default function DataTable({ orders, users }: Props) {
  const [activeView, setActiveView] = useState<"customer" | "history">(
    "customer"
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const {currency} = useSettingsStore()
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  const getStatusBadge = (status: string) => {
    const statusClassMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      processing: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge
        className={cn(
          "capitalize",
          statusClassMap[status.toLowerCase()] || "bg-gray-100 text-gray-800"
        )}
      >
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Orders</CardTitle>
          <div className="space-x-2">
            <Button
              variant={activeView === "customer" ? "default" : "outline"}
              onClick={() => setActiveView("customer")}
            >
              Customer
            </Button>
            <Button
              variant={activeView === "history" ? "default" : "outline"}
              onClick={() => setActiveView("history")}
            >
              Order History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-md">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">
                      Order ID
                    </th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Amount</th>
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                    <th className="px-4 py-2 text-left font-medium">Items</th>
                    {activeView === "customer" && (
                      <>
                        <th className="px-4 py-2 text-left font-medium">
                          Customer
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Shipping Address
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Billing Address
                        </th>
                      </>
                    )}
                    <th className="px-4 py-2 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const user = getUser(order.userId);
                    return (
                      <tr
                        key={order.id}
                        className="border-t hover:bg-muted transition"
                      >
                        <td className="px-4 py-2 font-mono text-xs">
                          {order.id}
                        </td>
                        <td className="px-4 py-2">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-2 font-semibold">
                          {currency} {order.totalAmount}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {order.items.map((item, index) => (
                              <div
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                <span className="font-medium">
                                  {item.product?.name}
                                </span>
                                {` - ${item.size}, `}
                                <span className="inline-flex items-center gap-1">
                                  <span
                                    className="w-3 h-3 rounded-full border border-gray-300"
                                    style={{ backgroundColor: item.color }}
                                  />
                                </span>
                                {` (x${item.quantity})`}
                              </div>
                            ))}
                          </div>
                        </td>
                        {activeView === "customer" && (
                          <>
                            <td className="px-4 py-2 text-xs">
                              {user ? (
                                <>
                                  <div className="font-medium">
                                    {user.username}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {user.email}
                                  </div>
                                </>
                              ) : (
                                <span className="text-muted-foreground">
                                  Unknown
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {order.shippingAddress ? (
                                <div className="text-xs leading-5 space-y-1">
                                  <div>{order.shippingAddress.address}</div>
                                  {order.shippingAddress.apartment && (
                                    <div>{order.shippingAddress.apartment}</div>
                                  )}
                                  <div>
                                    {order.shippingAddress.city},{" "}
                                    {order.shippingAddress.postalCode}
                                  </div>
                                  <div>{order.shippingAddress.country}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  N/A
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {order.billingAddress ? (
                                <div className="text-xs leading-5 space-y-1">
                                  <div>{order.billingAddress.address}</div>
                                  {order.billingAddress.apartment && (
                                    <div>{order.billingAddress.apartment}</div>
                                  )}
                                  <div>
                                    {order.billingAddress.city},{" "}
                                    {order.billingAddress.postalCode}
                                  </div>
                                  <div>{order.billingAddress.country}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">
                                  N/A
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Order ID:</strong> {selectedOrder.id}
              </div>
              <div>
                <strong>Status:</strong> {selectedOrder.status}
              </div>
              <div>
                <strong>Total:</strong> {currency} {selectedOrder.totalAmount}
              </div>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc ml-4 mt-1">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product?.name} - {item.size}, {item.color} (x
                      {item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
