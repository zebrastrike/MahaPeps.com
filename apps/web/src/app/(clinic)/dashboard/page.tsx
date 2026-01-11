"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface KycStatus {
  status: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  canResubmitAt?: string;
}

interface DashboardData {
  kyc: KycStatus;
  orderStats: {
    totalOrders: number;
    pendingPayment: number;
    activeOrders: number;
    totalSpent: number;
  };
  accountType: string;
}

export default function ClinicDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/dashboard/clinic", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
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

  const kycStatus = data?.kyc?.status || "NOT_SUBMITTED";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Clinic Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Manage your research orders and access B2B wholesale pricing
        </p>
      </div>

      {/* KYC Status Card */}
      <div
        className={`rounded-lg border-2 p-6 ${
          kycStatus === "APPROVED"
            ? "border-emerald-500 bg-emerald-50"
            : kycStatus === "PENDING"
            ? "border-amber-500 bg-amber-50"
            : kycStatus === "REJECTED"
            ? "border-red-500 bg-red-50"
            : "border-blue-500 bg-blue-50"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">KYC Verification Status</h2>

            {kycStatus === "APPROVED" && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-emerald-900">
                  <span className="text-2xl">✓</span>
                  <span className="text-lg font-semibold">Verified</span>
                </div>
                <p className="mt-2 text-emerald-800">
                  Your clinic verification is approved. You now have access to B2B wholesale pricing
                  and bulk ordering options.
                </p>
                {data?.kyc.reviewedAt && (
                  <p className="mt-2 text-sm text-emerald-700">
                    Approved on {new Date(data.kyc.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {kycStatus === "PENDING" && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-amber-900">
                  <span className="text-2xl">⏳</span>
                  <span className="text-lg font-semibold">Under Review</span>
                </div>
                <p className="mt-2 text-amber-800">
                  Your KYC documents are being reviewed. This typically takes 24-48 business hours.
                  We'll notify you via email once the review is complete.
                </p>
                {data?.kyc.submittedAt && (
                  <p className="mt-2 text-sm text-amber-700">
                    Submitted on {new Date(data.kyc.submittedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {kycStatus === "REJECTED" && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-red-900">
                  <span className="text-2xl">✗</span>
                  <span className="text-lg font-semibold">Additional Information Required</span>
                </div>
                <p className="mt-2 text-red-800">
                  {data?.kyc.rejectionReason ||
                    "Your KYC submission needs additional information. Please review and resubmit."}
                </p>
                {data?.kyc.canResubmitAt && (
                  <p className="mt-2 text-sm text-red-700">
                    You can resubmit after{" "}
                    {new Date(data.kyc.canResubmitAt).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4">
                  <Button variant="outline">Resubmit KYC Documents</Button>
                </div>
              </div>
            )}

            {kycStatus === "NOT_SUBMITTED" && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-blue-900">
                  <span className="text-2xl">📋</span>
                  <span className="text-lg font-semibold">Verification Required</span>
                </div>
                <p className="mt-2 text-blue-800">
                  Complete your clinic verification to unlock B2B wholesale pricing and bulk
                  ordering capabilities.
                </p>
                <div className="mt-4">
                  <Link href="/kyc/submit">
                    <Button>Start Verification Process</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Total Orders</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">
            {data?.orderStats.totalOrders || 0}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Pending Payment</div>
          <div className="mt-2 text-3xl font-bold text-amber-600">
            {data?.orderStats.pendingPayment || 0}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Active Orders</div>
          <div className="mt-2 text-3xl font-bold text-teal-600">
            {data?.orderStats.activeOrders || 0}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-600">Total Spent</div>
          <div className="mt-2 text-3xl font-bold text-emerald-600">
            ${data?.orderStats.totalSpent?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/products">
            <Button variant="outline" className="w-full">
              Browse Catalog
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" className="w-full">
              View Orders
            </Button>
          </Link>
          <Link href="/bulk-order">
            <Button variant="outline" className="w-full">
              Bulk Order Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Pricing Information */}
      {kycStatus === "APPROVED" && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-6">
          <h2 className="text-xl font-bold text-teal-900">B2B Wholesale Pricing Unlocked</h2>
          <p className="mt-2 text-teal-800">
            As a verified clinic, you now have access to tiered wholesale pricing based on order
            volume. Discounts automatically apply at checkout.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-teal-800">
            <li>10-49 units: 10% off</li>
            <li>50-99 units: 15% off</li>
            <li>100+ units: 20% off + priority support</li>
          </ul>
        </div>
      )}
    </div>
  );
}
