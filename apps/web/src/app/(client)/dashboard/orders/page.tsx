"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  itemCount: number;
  trackingNumber?: string;
  shippingCarrier?: string;
}

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        setError("Please log in to view your orders");
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-slate-100 text-slate-700",
      PENDING_PAYMENT: "bg-amber-100 text-amber-800",
      PAID: "bg-emerald-100 text-emerald-800",
      FULFILLING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-teal-100 text-teal-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELED: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          styles[status] || "bg-slate-100 text-slate-700"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <div className="text-red-900">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="text-6xl">📦</div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">No orders yet</h2>
        <p className="mt-2 text-slate-600">
          Start shopping for research peptides to place your first order
        </p>
        <div className="mt-6">
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
          <p className="mt-2 text-slate-600">
            Track and manage your research material orders
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Order #{order.id.substring(0, 8)}...
                  </h3>
                  {getStatusBadge(order.status)}
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>

                <div className="mt-4 space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="text-sm text-slate-700">
                      • {item.productName} (Qty: {item.quantity})
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 p-3">
                    <p className="text-sm font-medium text-teal-900">
                      Tracking Number: <code className="ml-1">{order.trackingNumber}</code>
                    </p>
                    {order.shippingCarrier && (
                      <p className="mt-1 text-xs text-teal-700">
                        Carrier: {order.shippingCarrier}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  ${order.total.toFixed(2)}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                </div>
              </div>
            </div>

            {/* Status-specific actions */}
            <div className="mt-4 flex gap-3 border-t border-slate-200 pt-4">
              {order.status === "PENDING_PAYMENT" && (
                <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                  ⚠️ Awaiting payment. Check your email for payment instructions.
                </div>
              )}

              {order.status === "PAID" && (
                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">
                  ✓ Payment verified. Your order is being prepared for shipment.
                </div>
              )}

              {order.status === "SHIPPED" && order.trackingNumber && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.google.com/search?q=${order.trackingNumber}+tracking`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Track Package
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-600">Total Orders</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{orders.length}</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-600">Pending Payment</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {orders.filter((o) => o.status === "PENDING_PAYMENT").length}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-600">In Transit</div>
          <div className="mt-2 text-2xl font-bold text-teal-600">
            {orders.filter((o) => o.status === "SHIPPED").length}
          </div>
        </div>
      </div>
    </div>
  );
}
