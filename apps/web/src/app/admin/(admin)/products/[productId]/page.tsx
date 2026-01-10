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
  priceCents: number | null;
  isActive: boolean;
  batches: BatchInfo[];
}

interface ProductDetail {
  id: string;
  name: string;
  slug?: string | null;
  sku: string;
  description?: string | null;
  category?: string | null;
  form?: string | null;
  concentration?: string | null;
  casNumber?: string | null;
  molecularFormula?: string | null;
  visibility?: string | null;
  isActive: boolean;
  stockStatus?: string | null;
  currentStock?: number | null;
  expectedRestockDate?: string | null;
  variants: VariantInfo[];
}

const categoryOptions = [
  "RESEARCH_PEPTIDES",
  "ANALYTICAL_REFERENCE_MATERIALS",
  "LABORATORY_ADJUNCTS",
  "RESEARCH_COMBINATIONS",
  "MATERIALS_SUPPLIES",
  "MERCHANDISE"
];

const strengthUnits = ["MG", "IU", "ML"];
const visibilityOptions = ["B2C_ONLY", "B2B_ONLY", "BOTH"];
const stockStatusOptions = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "DISCONTINUED",
  "BACKORDER"
];

export default function AdminProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  const apiBaseUrl = getApiBaseUrl();
  const adminHeaders = getAdminHeaders();
  const missingAdminHeader = !hasAdminHeader();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    category: "",
    form: "",
    concentration: "",
    casNumber: "",
    molecularFormula: "",
    visibility: "B2C_ONLY",
    isActive: true,
    stockStatus: "OUT_OF_STOCK",
    currentStock: "",
    expectedRestockDate: ""
  });
  const [variantForms, setVariantForms] = useState<Record<string, any>>({});
  const [newVariant, setNewVariant] = useState({
    strengthValue: "",
    strengthUnit: "MG",
    sku: "",
    price: "",
    pricingOnRequest: true,
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        throw new Error("Failed to load product");
      }

      const data = (await response.json()) as ProductDetail;
      setProduct(data);
      setProductForm({
        name: data.name || "",
        slug: data.slug || "",
        sku: data.sku || "",
        description: data.description || "",
        category: data.category || "",
        form: data.form || "",
        concentration: data.concentration || "",
        casNumber: data.casNumber || "",
        molecularFormula: data.molecularFormula || "",
        visibility: data.visibility || "B2C_ONLY",
        isActive: data.isActive,
        stockStatus: data.stockStatus || "OUT_OF_STOCK",
        currentStock:
          data.currentStock !== null && data.currentStock !== undefined
            ? data.currentStock.toString()
            : "",
        expectedRestockDate: data.expectedRestockDate
          ? new Date(data.expectedRestockDate).toISOString().slice(0, 10)
          : ""
      });

      const variantState: Record<string, any> = {};
      data.variants.forEach((variant) => {
        const priceValue =
          variant.priceCents && variant.priceCents > 0
            ? (variant.priceCents / 100).toFixed(2)
            : "";
        variantState[variant.id] = {
          strengthValue: variant.strengthValue.toString(),
          strengthUnit: variant.strengthUnit,
          sku: variant.sku,
          price: priceValue,
          pricingOnRequest: !variant.priceCents || variant.priceCents === 0,
          isActive: variant.isActive
        };
      });
      setVariantForms(variantState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (field: string, value: string | boolean) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (variantId: string, field: string, value: string | boolean) => {
    setVariantForms((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], [field]: value }
    }));
  };

  const saveProduct = async () => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before saving.");
      return;
    }

    if (!productForm.name.trim() || !productForm.sku.trim()) {
      setError("Name and SKU are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        slug: productForm.slug.trim() || null,
        description: productForm.description.trim() || null,
        category: productForm.category || null,
        form: productForm.form.trim() || null,
        concentration: productForm.concentration.trim() || null,
        casNumber: productForm.casNumber.trim() || null,
        molecularFormula: productForm.molecularFormula.trim() || null,
        visibility: productForm.visibility || null,
        isActive: productForm.isActive,
        stockStatus: productForm.stockStatus || null,
        currentStock:
          productForm.currentStock === ""
            ? null
            : Number(productForm.currentStock),
        expectedRestockDate: productForm.expectedRestockDate || null
      };

      const response = await fetch(`${apiBaseUrl}/admin/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      await fetchProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const saveVariant = async (variantId: string) => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before saving.");
      return;
    }

    const form = variantForms[variantId];
    if (!form) return;

    const strengthValue = parseFloat(form.strengthValue);
    if (Number.isNaN(strengthValue)) {
      setError("Enter a valid strength value.");
      return;
    }

    const payload: Record<string, unknown> = {
      strengthValue,
      strengthUnit: form.strengthUnit,
      sku: form.sku,
      isActive: form.isActive
    };

    if (form.pricingOnRequest) {
      payload.setPricingOnRequest = true;
    } else {
      const priceValue = parseFloat(form.price);
      if (!Number.isNaN(priceValue)) {
        payload.priceCents = Math.round(priceValue * 100);
      }
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/variants/${variantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to update variant");
      }

      await fetchProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update variant");
    } finally {
      setSaving(false);
    }
  };

  const addVariant = async () => {
    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before adding variants.");
      return;
    }

    if (!newVariant.strengthValue || !newVariant.sku) {
      setError("Strength value and SKU are required.");
      return;
    }

    const strengthValue = parseFloat(newVariant.strengthValue);
    if (Number.isNaN(strengthValue)) {
      setError("Enter a valid strength value.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        strengthValue,
        strengthUnit: newVariant.strengthUnit,
        sku: newVariant.sku,
        isActive: newVariant.isActive
      };

      if (newVariant.pricingOnRequest) {
        payload.setPricingOnRequest = true;
      } else {
        const priceValue = parseFloat(newVariant.price);
        if (!Number.isNaN(priceValue)) {
          payload.priceCents = Math.round(priceValue * 100);
        }
      }

      const response = await fetch(`${apiBaseUrl}/admin/products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to add variant");
      }

      setNewVariant({
        strengthValue: "",
        strengthUnit: "MG",
        sku: "",
        price: "",
        pricingOnRequest: true,
        isActive: true
      });

      await fetchProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add variant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-slate-600">Product not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-600">Manage product details and variants.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/products">Back to Products</Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/products/${productId}/batches`}>Manage Batches</Link>
          </Button>
        </div>
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
        <h2 className="text-xl font-semibold text-slate-900">Product Details</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => handleProductChange("name", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">SKU</label>
            <input
              type="text"
              value={productForm.sku}
              onChange={(event) => handleProductChange("sku", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input
              type="text"
              value={productForm.slug}
              onChange={(event) => handleProductChange("slug", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={productForm.category}
              onChange={(event) => handleProductChange("category", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            >
              <option value="">No category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Visibility</label>
            <select
              value={productForm.visibility}
              onChange={(event) => handleProductChange("visibility", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            >
              {visibilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Stock Status</label>
            <select
              value={productForm.stockStatus}
              onChange={(event) => handleProductChange("stockStatus", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            >
              {stockStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Form</label>
            <input
              type="text"
              value={productForm.form}
              onChange={(event) => handleProductChange("form", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Concentration</label>
            <input
              type="text"
              value={productForm.concentration}
              onChange={(event) => handleProductChange("concentration", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Stock</label>
            <input
              type="number"
              min="0"
              value={productForm.currentStock}
              onChange={(event) => handleProductChange("currentStock", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Expected Restock Date
            </label>
            <input
              type="date"
              value={productForm.expectedRestockDate}
              onChange={(event) =>
                handleProductChange("expectedRestockDate", event.target.value)
              }
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">CAS Number</label>
            <input
              type="text"
              value={productForm.casNumber}
              onChange={(event) => handleProductChange("casNumber", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Molecular Formula</label>
            <input
              type="text"
              value={productForm.molecularFormula}
              onChange={(event) => handleProductChange("molecularFormula", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={productForm.description}
            onChange={(event) => handleProductChange("description", event.target.value)}
            className="min-h-[140px] w-full rounded-md border border-slate-200 px-3 py-2"
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={productForm.isActive}
            onChange={(event) => handleProductChange("isActive", event.target.checked)}
          />
          Active product
        </label>

        <div className="mt-6">
          <Button onClick={saveProduct} disabled={saving}>
            Save Product
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Variants</h2>
          <p className="text-sm text-slate-500">{product.variants.length} variant(s)</p>
        </div>

        {product.variants.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No variants yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {product.variants.map((variant) => {
              const formState = variantForms[variant.id];
              if (!formState) return null;

              return (
                <div
                  key={variant.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-5">
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">
                        Strength
                      </label>
                      <input
                        type="number"
                        value={formState.strengthValue}
                        onChange={(event) =>
                          handleVariantChange(variant.id, "strengthValue", event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">
                        Unit
                      </label>
                      <select
                        value={formState.strengthUnit}
                        onChange={(event) =>
                          handleVariantChange(variant.id, "strengthUnit", event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                      >
                        {strengthUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formState.sku}
                        onChange={(event) =>
                          handleVariantChange(variant.id, "sku", event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formState.price}
                        onChange={(event) =>
                          handleVariantChange(variant.id, "price", event.target.value)
                        }
                        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                        disabled={formState.pricingOnRequest}
                      />
                      <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={formState.pricingOnRequest}
                          onChange={(event) =>
                            handleVariantChange(
                              variant.id,
                              "pricingOnRequest",
                              event.target.checked
                            )
                          }
                        />
                        Pricing on request
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-slate-500">
                        Status
                      </label>
                      <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={formState.isActive}
                          onChange={(event) =>
                            handleVariantChange(variant.id, "isActive", event.target.checked)
                          }
                        />
                        Active
                      </label>
                      <div className="mt-2 text-xs text-slate-500">
                        COA: {variant.batches.some((batch) => batch.hasCoa) ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={() => saveVariant(variant.id)} disabled={saving}>
                      Save Variant
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800">Add Variant</h3>
          <div className="mt-3 grid gap-4 lg:grid-cols-5">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Strength
              </label>
              <input
                type="number"
                value={newVariant.strengthValue}
                onChange={(event) =>
                  setNewVariant((prev) => ({ ...prev, strengthValue: event.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Unit
              </label>
              <select
                value={newVariant.strengthUnit}
                onChange={(event) =>
                  setNewVariant((prev) => ({ ...prev, strengthUnit: event.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
              >
                {strengthUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                SKU
              </label>
              <input
                type="text"
                value={newVariant.sku}
                onChange={(event) =>
                  setNewVariant((prev) => ({ ...prev, sku: event.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newVariant.price}
                onChange={(event) =>
                  setNewVariant((prev) => ({ ...prev, price: event.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2"
                disabled={newVariant.pricingOnRequest}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={newVariant.pricingOnRequest}
                  onChange={(event) =>
                    setNewVariant((prev) => ({
                      ...prev,
                      pricingOnRequest: event.target.checked
                    }))
                  }
                />
                Pricing on request
              </label>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                Status
              </label>
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={newVariant.isActive}
                  onChange={(event) =>
                    setNewVariant((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                Active
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={addVariant} disabled={saving}>
              Add Variant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

