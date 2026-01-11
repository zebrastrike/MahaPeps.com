"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAdminHeaders, getApiBaseUrl, hasAdminHeader } from "@/lib/admin";
import { ForbiddenTermScanner } from "@/components/admin/forbidden-term-scanner";

const categories = [
  "RESEARCH_PEPTIDES",
  "ANALYTICAL_REFERENCE_MATERIALS",
  "LABORATORY_ADJUNCTS",
  "RESEARCH_COMBINATIONS",
  "MATERIALS_SUPPLIES",
  "MERCHANDISE"
];
const visibilityOptions = ["B2C_ONLY", "B2B_ONLY", "BOTH"];
const stockStatusOptions = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "DISCONTINUED",
  "BACKORDER"
];

export default function NewProductPage() {
  const router = useRouter();
  const apiBaseUrl = getApiBaseUrl();
  const adminHeaders = getAdminHeaders();
  const missingAdminHeader = !hasAdminHeader();

  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    sku: "",
    category: "",
    description: "",
    form: "",
    concentration: "",
    casNumber: "",
    molecularFormula: "",
    visibility: "B2C_ONLY",
    stockStatus: "OUT_OF_STOCK",
    currentStock: "",
    expectedRestockDate: "",
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameViolations, setNameViolations] = useState(false);
  const [descriptionViolations, setDescriptionViolations] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (missingAdminHeader) {
      setError("Set NEXT_PUBLIC_ADMIN_TOKEN before creating products.");
      return;
    }

    if (!productForm.name.trim() || !productForm.sku.trim()) {
      setError("Name and SKU are required.");
      return;
    }

    // CRITICAL COMPLIANCE CHECK: Block submission if forbidden terms detected
    if (nameViolations || descriptionViolations) {
      setError("⛔ COMPLIANCE VIOLATION: Cannot create product with forbidden medical claims. Please remove all highlighted terms before proceeding.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        slug: productForm.slug.trim() || undefined,
        category: productForm.category || undefined,
        description: productForm.description.trim() || undefined,
        form: productForm.form.trim() || undefined,
        concentration: productForm.concentration.trim() || undefined,
        casNumber: productForm.casNumber.trim() || undefined,
        molecularFormula: productForm.molecularFormula.trim() || undefined,
        visibility: productForm.visibility || undefined,
        stockStatus: productForm.stockStatus || undefined,
        currentStock:
          productForm.currentStock === ""
            ? undefined
            : Number(productForm.currentStock),
        expectedRestockDate: productForm.expectedRestockDate || undefined,
        isActive: productForm.isActive
      };

      const response = await fetch(`${apiBaseUrl}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const data = await response.json();
      router.push(`/admin/products/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Product</h1>
        <p className="text-sm text-slate-600">
          Add a compliant research catalog entry. Avoid medical claims.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              required
            />
            <ForbiddenTermScanner
              text={productForm.name}
              fieldName="Product Name"
              onViolationsChange={setNameViolations}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">SKU</label>
            <input
              type="text"
              value={productForm.sku}
              onChange={(event) => handleChange("sku", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Slug (optional)</label>
            <input
              type="text"
              value={productForm.slug}
              onChange={(event) => handleChange("slug", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={productForm.category}
              onChange={(event) => handleChange("category", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Visibility</label>
            <select
              value={productForm.visibility}
              onChange={(event) => handleChange("visibility", event.target.value)}
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
              onChange={(event) => handleChange("stockStatus", event.target.value)}
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
              onChange={(event) => handleChange("form", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Concentration</label>
            <input
              type="text"
              value={productForm.concentration}
              onChange={(event) => handleChange("concentration", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Stock</label>
            <input
              type="number"
              min="0"
              value={productForm.currentStock}
              onChange={(event) => handleChange("currentStock", event.target.value)}
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
              onChange={(event) => handleChange("expectedRestockDate", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">CAS Number</label>
            <input
              type="text"
              value={productForm.casNumber}
              onChange={(event) => handleChange("casNumber", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Molecular Formula</label>
            <input
              type="text"
              value={productForm.molecularFormula}
              onChange={(event) => handleChange("molecularFormula", event.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={productForm.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="min-h-[140px] w-full rounded-md border border-slate-200 px-3 py-2"
          />
          <p className="text-xs text-slate-500">
            Keep language compliance-safe and research focused.
          </p>
          <ForbiddenTermScanner
            text={productForm.description}
            fieldName="Product Description"
            onViolationsChange={setDescriptionViolations}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={productForm.isActive}
            onChange={(event) => handleChange("isActive", event.target.checked)}
          />
          Active product
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            Create Product
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

