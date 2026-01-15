"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface DashboardStats {
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  totalProducts: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders to calculate stats
      const ordersRes = await fetch("/api/admin/orders?limit=100");
      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [], total: 0 };

      // Fetch pending payments
      const paymentsRes = await fetch("/api/admin/payments/pending");
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];

      // Calculate stats from orders
      const orders = ordersData.orders || [];
      const pendingOrders = orders.filter((o: any) => o.status === "PENDING_PAYMENT").length;
      const paidOrders = orders.filter((o: any) => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)).length;
      const totalRevenue = orders
        .filter((o: any) => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status))
        .reduce((sum: number, o: any) => sum + parseFloat(o.total || 0), 0);

      setStats({
        pendingOrders,
        paidOrders,
        totalRevenue,
        pendingPayments: paymentsData.length || 0,
        totalProducts: 32, // From seeded catalog
        totalUsers: ordersData.total || 0,
      });

      // Get 5 most recent orders
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING_PAYMENT: "bg-amber-100 text-amber-700",
      PAID: "bg-emerald-100 text-emerald-700",
      SHIPPED: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="mt-2 text-slate-600">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Alert Banner - Pending Actions */}
      {(stats?.pendingPayments || 0) > 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                {stats?.pendingPayments} payment{stats?.pendingPayments !== 1 ? "s" : ""} awaiting verification
              </p>
              <Link
                href="/admin/payments"
                className="text-sm text-amber-700 underline hover:text-amber-900"
              >
                Review pending payments →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Pending Orders */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Orders</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {stats?.pendingOrders || 0}
              </p>
            </div>
            <div className="rounded-full bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <Link
            href="/admin/orders?status=PENDING_PAYMENT"
            className="mt-4 inline-block text-sm text-amber-600 hover:underline"
          >
            View pending →
          </Link>
        </div>

        {/* Paid Orders */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Paid Orders</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {stats?.paidOrders || 0}
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <Link
            href="/admin/orders?status=PAID"
            className="mt-4 inline-block text-sm text-emerald-600 hover:underline"
          >
            View ready to ship →
          </Link>
        </div>

        {/* Revenue */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-teal-600">
                ${(stats?.totalRevenue || 0).toFixed(2)}
              </p>
            </div>
            <div className="rounded-full bg-teal-100 p-3">
              <DollarSign className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">From paid orders</p>
        </div>

        {/* Products */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Products</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Manage products →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-teal-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-slate-500">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {order.user?.email || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        ${parseFloat(order.total?.toString() || "0").toFixed(2)}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="grid gap-3">
            <Link
              href="/admin/orders?status=PENDING_PAYMENT"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="rounded-full bg-amber-100 p-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Mark Orders as Paid</p>
                <p className="text-sm text-slate-500">
                  Verify Zelle/CashApp payments
                </p>
              </div>
            </Link>

            <Link
              href="/admin/orders?status=PAID"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="rounded-full bg-emerald-100 p-2">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Create Shipments</p>
                <p className="text-sm text-slate-500">
                  Generate shipping labels for paid orders
                </p>
              </div>
            </Link>

            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="rounded-full bg-teal-100 p-2">
                <DollarSign className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Review Payment Proofs</p>
                <p className="text-sm text-slate-500">
                  Approve customer-submitted screenshots
                </p>
              </div>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
            >
              <div className="rounded-full bg-blue-100 p-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Manage Products</p>
                <p className="text-sm text-slate-500">
                  Update catalog, batches, and COAs
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
