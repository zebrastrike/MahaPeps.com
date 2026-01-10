"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch("/api/admin/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-slate-100 text-slate-700",
      PENDING_PAYMENT: "bg-amber-100 text-amber-700",
      PAID: "bg-emerald-100 text-emerald-700",
      FULFILLING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-teal-100 text-teal-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELED: "bg-red-100 text-red-700",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
        <Button onClick={fetchOrders} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "PENDING_PAYMENT", "PAID", "SHIPPED", "COMPLETED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === status
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {status === "all" ? "All Orders" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <code className="text-sm text-slate-900">
                        {order.id.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{order.user.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Total Orders</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{orders.length}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Pending Payment</div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {orders.filter((o) => o.status === "PENDING_PAYMENT").length}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Paid</div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {orders.filter((o) => o.status === "PAID").length}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">Shipped</div>
          <div className="mt-2 text-2xl font-bold text-teal-600">
            {orders.filter((o) => o.status === "SHIPPED").length}
          </div>
        </div>
      </div>
    </div>
  );
}
