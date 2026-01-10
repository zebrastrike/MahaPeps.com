"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminHeaders, getApiBaseUrl, hasAdminHeader } from "@/lib/admin";

interface KycRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  status: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  canResubmitAt?: string | null;
  documentCount: number;
}

const statusOptions = ["all", "PENDING", "APPROVED", "REJECTED"];

export default function AdminKycPage() {
  const apiBaseUrl = getApiBaseUrl();
  const adminHeaders = getAdminHeaders();
  const missingAdminHeader = !hasAdminHeader();

  const [records, setRecords] = useState<KycRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKyc();
  }, [statusFilter]);

  const fetchKyc = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `${apiBaseUrl}/admin/kyc${params.toString() ? `?${params.toString()}` : ""}`,
        {
          headers: {
            ...adminHeaders
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load KYC records");
      }

      const data = (await response.json()) as KycRecord[];
      setRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KYC records");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading KYC records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">KYC</h1>
          <p className="text-sm text-slate-600">
            Review verification submissions and document status.
          </p>
        </div>
        <Button variant="outline" onClick={fetchKyc}>
          Refresh
        </Button>
      </div>

      {missingAdminHeader && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Missing admin credentials. Set NEXT_PUBLIC_ADMIN_TOKEN to use admin endpoints.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="block text-xs font-semibold uppercase text-slate-500">
          Status
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm lg:max-w-xs"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="text-sm text-slate-600">
            {records.length} submission(s)
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Documents
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {record.userEmail || record.userId}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.userRole || "Unknown role"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {record.status.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {record.submittedAt
                        ? new Date(record.submittedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {record.documentCount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/kyc/${record.id}`}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
