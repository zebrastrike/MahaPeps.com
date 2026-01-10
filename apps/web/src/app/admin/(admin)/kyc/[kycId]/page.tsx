"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminHeaders, getApiBaseUrl, hasAdminHeader } from "@/lib/admin";

interface KycDocument {
  id: string;
  documentType: string;
  status: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  downloadUrl: string;
}

interface KycDetail {
  id: string;
  userId: string;
  userEmail?: string;
  userRole?: string;
  status: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  internalNotes?: string | null;
  documents: KycDocument[];
}

const documentStatusOptions = ["PENDING", "APPROVED", "REJECTED"];

export default function KycDetailPage() {
  const params = useParams();
  const kycId = params.kycId as string;

  const apiBaseUrl = getApiBaseUrl();
  const adminHeaders = getAdminHeaders();
  const missingAdminHeader = !hasAdminHeader();

  const [record, setRecord] = useState<KycDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchKyc();
  }, [kycId]);

  const fetchKyc = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/kyc/${kycId}`, {
        headers: {
          ...adminHeaders
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load KYC record");
      }

      const data = (await response.json()) as KycDetail;
      setRecord(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KYC record");
    } finally {
      setLoading(false);
    }
  };

  const approveKyc = async () => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before approving.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/kyc/${kycId}/approve`, {
        method: "POST",
        headers: {
          ...adminHeaders
        }
      });

      if (!response.ok) {
        throw new Error("Failed to approve KYC");
      }

      await fetchKyc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve KYC");
    } finally {
      setSaving(false);
    }
  };

  const rejectKyc = async () => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before rejecting.");
      return;
    }

    const reason = prompt("Enter a rejection reason to share with the applicant.");
    if (!reason) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/kyc/${kycId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (!response.ok) {
        throw new Error("Failed to reject KYC");
      }

      await fetchKyc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject KYC");
    } finally {
      setSaving(false);
    }
  };

  const reviewDocument = async (docId: string, status: string) => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before reviewing documents.");
      return;
    }

    let rejectionReason: string | undefined;
    if (status === "REJECTED") {
      rejectionReason = prompt("Enter a document rejection reason.") || undefined;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/kyc/documents/${docId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({ status, rejectionReason })
      });

      if (!response.ok) {
        throw new Error("Failed to update document status");
      }

      await fetchKyc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update document status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading KYC record...</div>
      </div>
    );
  }

  if (!record) {
    return <div className="text-slate-600">KYC record not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">KYC Review</h1>
          <p className="text-sm text-slate-600">
            {record.userEmail || record.userId} • {record.userRole || "Unknown role"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/kyc">Back to KYC</Link>
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

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Submission Status</h2>
            <p className="text-sm text-slate-600">
              Current status: {record.status.replace(/_/g, " ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={approveKyc} disabled={saving}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={rejectKyc} disabled={saving}>
              Reject
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
        <div className="mt-4 space-y-4">
          {record.documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded.</p>
          ) : (
            record.documents.map((doc) => (
              <div key={doc.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {doc.documentType.replace(/_/g, " ")}
                    </div>
                    <div className="text-xs text-slate-500">
                      Status: {doc.status.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      View Document
                    </a>
                    <select
                      value={doc.status}
                      onChange={(event) => reviewDocument(doc.id, event.target.value)}
                      className="rounded-md border border-slate-200 px-2 py-2 text-xs"
                      disabled={saving}
                    >
                      {documentStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {doc.rejectionReason && (
                  <p className="mt-2 text-xs text-rose-600">
                    {doc.rejectionReason}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
