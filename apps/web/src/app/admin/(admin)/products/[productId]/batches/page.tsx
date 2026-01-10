"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminHeaders, getApiBaseUrl, hasAdminHeader } from "@/lib/admin";

interface BatchInfo {
  id: string;
  batchCode: string;
  purityPercent: number;
  manufacturedAt: string;
  expiresAt: string;
  testingLab?: string | null;
  isActive: boolean;
  hasCoa: boolean;
  coaFileCount: number;
}

interface VariantInfo {
  id: string;
  strengthValue: number;
  strengthUnit: string;
  sku: string;
  batches: BatchInfo[];
}

interface ProductDetail {
  id: string;
  name: string;
  variants: VariantInfo[];
}

const formatStrength = (value: number, unit: string) =>
  `${value}${unit.toLowerCase()}`;

export default function ProductBatchesPage() {
  const params = useParams();
  const productId = params.productId as string;

  const apiBaseUrl = getApiBaseUrl();
  const adminHeaders = getAdminHeaders();
  const missingAdminHeader = !hasAdminHeader();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newBatchForms, setNewBatchForms] = useState<Record<string, any>>({});
  const [coaUploads, setCoaUploads] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/products/${productId}`, {
        headers: {
          ...adminHeaders
        }
      });

      if (!response.ok) {
        throw new Error("Failed to load product batches");
      }

      const data = (await response.json()) as ProductDetail;
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product batches");
    } finally {
      setLoading(false);
    }
  };

  const updateBatchForm = (variantId: string, field: string, value: string) => {
    setNewBatchForms((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value }
    }));
  };

  const updateCoaUpload = (batchId: string, field: string, value: any) => {
    setCoaUploads((prev) => ({
      ...prev,
      [batchId]: { ...prev[batchId], [field]: value }
    }));
  };

  const createBatch = async (variantId: string) => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before managing batches.");
      return;
    }

    const form = newBatchForms[variantId] || {};
    if (!form.batchCode || !form.purityPercent || !form.manufacturedAt || !form.expiresAt) {
      setError("Batch code, purity, manufactured date, and expiration are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        batchCode: form.batchCode,
        purityPercent: form.purityPercent,
        manufacturedAt: form.manufacturedAt,
        expiresAt: form.expiresAt,
        qtyInitial: form.qtyInitial || "0",
        qtyAvailable: form.qtyAvailable || "0",
        storageInstructions: form.storageInstructions || null,
        testingLab: form.testingLab || null
      };

      const response = await fetch(`${apiBaseUrl}/admin/variants/${variantId}/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to create batch");
      }

      setNewBatchForms((prev) => ({ ...prev, [variantId]: {} }));
      await fetchProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create batch");
    } finally {
      setSaving(false);
    }
  };

  const uploadCoa = async (batchId: string) => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before managing batches.");
      return;
    }

    const upload = coaUploads[batchId] || {};
    if (!upload.file) {
      setError("Select a COA PDF file to upload.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", upload.file);
      if (upload.purityPercent) {
        formData.append("purityPercent", upload.purityPercent);
      }
      if (upload.testingLab) {
        formData.append("testingLab", upload.testingLab);
      }

      const response = await fetch(`${apiBaseUrl}/admin/batches/${batchId}/coa`, {
        method: "POST",
        headers: {
          ...adminHeaders
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload COA");
      }

      setCoaUploads((prev) => ({ ...prev, [batchId]: {} }));
      await fetchProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload COA");
    } finally {
      setSaving(false);
    }
  };

  const activateBatch = async (batchId: string) => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before managing batches.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/batches/${batchId}/activate`, {
        method: "POST",
        headers: {
          ...adminHeaders
        }
      });

      if (!response.ok) {
        throw new Error("Failed to activate batch");
      }

      await fetchProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate batch");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading batches...</div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-slate-600">Product not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Batches</h1>
          <p className="text-sm text-slate-600">
            Manage batches and COA uploads for {product.name}.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/products/${productId}`}>Back to Product</Link>
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

      <div className="space-y-6">
        {product.variants.map((variant) => (
          <div key={variant.id} className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {formatStrength(variant.strengthValue, variant.strengthUnit)}
                </h2>
                <p className="text-sm text-slate-500">SKU: {variant.sku}</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Existing Batches</h3>
                {variant.batches.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">No batches yet.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    {variant.batches.map((batch) => (
                      <div
                        key={batch.id}
                        className="rounded-lg border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              Batch {batch.batchCode}
                            </div>
                            <div className="text-xs text-slate-500">
                              Purity {batch.purityPercent}% | Mfg {new Date(batch.manufacturedAt).toLocaleDateString()} | Exp {new Date(batch.expiresAt).toLocaleDateString()}
                            </div>
                            {batch.testingLab && (
                              <div className="text-xs text-slate-500">Lab: {batch.testingLab}</div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                batch.isActive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {batch.isActive ? "Active" : "Inactive"}
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                batch.hasCoa
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {batch.hasCoa ? "COA attached" : "COA missing"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3 lg:grid-cols-3">
                          <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                              COA File
                            </label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(event) =>
                                updateCoaUpload(batch.id, "file", event.target.files?.[0])
                              }
                              className="mt-2 w-full text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                              Purity %
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              onChange={(event) =>
                                updateCoaUpload(batch.id, "purityPercent", event.target.value)
                              }
                              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                              Testing Lab
                            </label>
                            <input
                              type="text"
                              onChange={(event) =>
                                updateCoaUpload(batch.id, "testingLab", event.target.value)
                              }
                              className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => uploadCoa(batch.id)}
                            disabled={saving}
                          >
                            Upload COA
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => activateBatch(batch.id)}
                            disabled={saving || !batch.hasCoa || batch.isActive}
                          >
                            Activate Batch
                          </Button>
                        </div>
                        {!batch.hasCoa && (
                          <p className="mt-2 text-xs text-amber-700">
                            COA required before activation.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-dashed border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Create Batch</h3>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Batch Code
                    </label>
                    <input
                      type="text"
                      value={(newBatchForms[variant.id] || {}).batchCode || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "batchCode", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Purity %
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={(newBatchForms[variant.id] || {}).purityPercent || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "purityPercent", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Testing Lab
                    </label>
                    <input
                      type="text"
                      value={(newBatchForms[variant.id] || {}).testingLab || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "testingLab", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Manufactured At
                    </label>
                    <input
                      type="date"
                      value={(newBatchForms[variant.id] || {}).manufacturedAt || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "manufacturedAt", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Expires At
                    </label>
                    <input
                      type="date"
                      value={(newBatchForms[variant.id] || {}).expiresAt || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "expiresAt", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Qty Initial
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={(newBatchForms[variant.id] || {}).qtyInitial || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "qtyInitial", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Qty Available
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={(newBatchForms[variant.id] || {}).qtyAvailable || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "qtyAvailable", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-xs font-semibold uppercase text-slate-500">
                      Storage Instructions
                    </label>
                    <input
                      type="text"
                      value={(newBatchForms[variant.id] || {}).storageInstructions || ""}
                      onChange={(event) =>
                        updateBatchForm(variant.id, "storageInstructions", event.target.value)
                      }
                      className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={() => createBatch(variant.id)} disabled={saving}>
                    Create Batch
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

