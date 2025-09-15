"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Drawer, DrawerTrigger, DrawerContent } from "@/components/ui/drawer";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSettingsStore } from "@/utils/shippingStore";

interface Order {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  user: {
    username: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  items?: {
    id: string;
    product?: {
      name: string;
    };
    quantity: number;
    size: string;
    color: string;
    price: number;
  }[];
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    apartment?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
}

const allStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderManagement({
  initialOrders,
  totalPages: initialTotalPages,
  token,
}: {
  initialOrders: Order[];
  totalPages: number;
  token: string;
}) {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const {currency} = useSettingsStore()
  const fetchOrders = useCallback(
    async (page = 1) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/all?page=${page}&limit=10`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    },
    [token]
  );

  useEffect(() => {
    if (page !== 1) fetchOrders(page);
  }, [page, fetchOrders]);

  const handleStatusSelect = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setOpenDropdown(null);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Order status updated");
        fetchOrders(page);
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating order status", err);
      toast.error("Error updating order status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge className="bg-yellow-400 text-black">Pending</Badge>;
      case "processing":
        return <Badge className="bg-purple-500 text-white">Processing</Badge>;
      case "shipped":
        return <Badge className="bg-blue-500 text-white">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-green-500 text-white">Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 text-white">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredOrders = useMemo(() => {
    if (filteredStatus === "all") return orders;
    return orders.filter((order) => order.status === filteredStatus);
  }, [orders, filteredStatus]);
  if (!session || session.user.isAdmin !== true) {
    return (
      <div className="text-center text-destructive mt-10 text-lg font-semibold">
        Access denied.
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <h2 className="text-base font-medium tracking-tight">
          {orders.length} orders found
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filteredStatus === "all" ? "default" : "outline"}
            onClick={() => setFilteredStatus("all")}
          >
            All Orders
          </Button>
          {allStatuses.map((status) => (
            <Button
              key={status}
              variant={filteredStatus === status ? "default" : "outline"}
              onClick={() => setFilteredStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>
                      {order.shippingAddress?.firstName}{" "}
                      {order.shippingAddress?.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.shippingAddress?.address}</span>
                        <span>{order.shippingAddress?.apartment}</span>
                        <span>{order.shippingAddress?.city}</span>
                        <span>{order.shippingAddress?.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {order.paymentMethod === "cod" ? "COD" : "Paypal"}
                    </TableCell>
                    <TableCell>
                      {currency} {order.totalAmount.toLocaleString("en-PK")}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="relative">
                        <div
                          className="flex items-center justify-between px-2 py-1 border rounded cursor-pointer bg-gray-50 w-[120px]"
                          onClick={() =>
                            setOpenDropdown((prev) =>
                              prev === order.id ? null : order.id
                            )
                          }
                        >
                          <span className="capitalize text-sm">
                            {order.status}
                          </span>
                          {openDropdown === order.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                        {openDropdown === order.id && (
                          <div className="absolute z-10 w-[120px] mt-1 bg-white border rounded shadow">
                            {allStatuses.map((status) => (
                              <div
                                key={status}
                                onClick={() =>
                                  handleStatusSelect(order.id, status)
                                }
                                className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 capitalize ${
                                  order.status === status
                                    ? "font-medium text-blue-600"
                                    : ""
                                }`}
                              >
                                {status}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 ml-9 mt-2">
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, order.status)
                            }
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          {selectedOrder && (
                            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                              <h2 className="text-xl font-bold">
                                Order #{selectedOrder.id}
                              </h2>
                              <div>
                                <h3 className="font-semibold">Customer</h3>
                                <p>
                                  <span className="font-semibold">Email:</span>{" "}
                                  {selectedOrder.contactEmail}
                                </p>
                                <p>
                                  <span className="font-semibold">Phone:</span>{" "}
                                  {selectedOrder.contactPhone}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-semibold">
                                  Shipping Address
                                </h3>
                                <div className="whitespace-pre-line text-base">
                                  <div className="flex gap-1">
                                    <span>
                                      <span className="font-semibold">
                                        Name:{" "}
                                      </span>
                                      {selectedOrder.shippingAddress?.firstName}
                                    </span>
                                    <span>
                                      {selectedOrder.shippingAddress?.lastName}
                                    </span>
                                  </div>
                                  <div>
                                    <p>
                                      <span className="font-semibold">
                                        Address:{" "}
                                      </span>
                                      {selectedOrder.shippingAddress?.address}
                                    </p>
                                    <p>
                                      <span className="font-semibold">
                                        Apartment:{" "}
                                      </span>
                                      {selectedOrder.shippingAddress?.apartment}
                                    </p>
                                  </div>
                                  <div className="flex flex-col">
                                    <span>
                                      <span className="font-semibold">
                                        City:{" "}
                                      </span>
                                      {selectedOrder.shippingAddress?.city}
                                    </span>
                                    <span>
                                      <span className="font-semibold">
                                        Postal Code:{" "}
                                      </span>
                                      {
                                        selectedOrder.shippingAddress
                                          ?.postalCode
                                      }
                                    </span>
                                    <span>
                                      <span className="font-semibold">
                                        Country:{" "}
                                      </span>
                                      {selectedOrder.shippingAddress?.country}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h3 className="font-semibold">Order Summary</h3>
                                <p>
                                  <span className="font-semibold">
                                    Status:{" "}
                                  </span>
                                  {selectedOrder.status}
                                </p>
                                <p>
                                  <span className="font-semibold">
                                    Payment:{" "}
                                  </span>
                                  {selectedOrder.paymentMethod}
                                </p>
                                <p>
                                  <span className="font-semibold">Total: </span>
                                  {currency}{" "}
                                  {selectedOrder.totalAmount.toLocaleString(
                                    "en-PK"
                                  )}
                                </p>
                              </div>
                              <div>
                                <h3 className="font-semibold">Items</h3>
                                {selectedOrder.items?.length ? (
                                  <ul className="space-y-2">
                                    {selectedOrder.items.map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex flex-col border p-2 rounded text-base"
                                      >
                                        <span>
                                          <span className="font-semibold">
                                            Product Name:
                                          </span>{" "}
                                          {item.product?.name}
                                        </span>
                                        <span>
                                          <span className="font-semibold">
                                            Quantity:{" "}
                                          </span>
                                          {item.quantity}
                                        </span>
                                        <span>
                                          <span className="font-semibold">
                                            Size:{" "}
                                          </span>
                                          {item.size}
                                        </span>

                                        <span className="font-semibold">
                                          Color:{" "}
                                        </span>
                                        <span className="inline-flex items-center gap-2">
                                          <span
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{
                                              backgroundColor: item.color,
                                            }}
                                          />
                                        </span>

                                        <span>
                                          <span className="font-semibold">
                                            Price:{" "}
                                          </span>
                                          {item.price.toLocaleString("en-PK")}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p>No items</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
