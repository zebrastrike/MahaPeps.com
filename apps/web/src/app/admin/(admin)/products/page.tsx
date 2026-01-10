"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAdminHeaders, getApiBaseUrl, hasAdminHeader } from "@/lib/admin";

interface ProductVariant {
  id: string;
  strengthValue: number;
  strengthUnit: string;
  sku: string;
  priceCents: number | null;
  isActive: boolean;
  hasCoa: boolean;
  purchasable: boolean;
}

interface Product {
  id: string;
  name: string;
  slug?: string | null;
  sku: string;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  variants: ProductVariant[];
}

interface ProductResponse {
  items: Product[];
  total: number;
}

const formatStrength = (value: number, unit: string) => {
  const formattedUnit = unit.toLowerCase();
  return `${value}${formattedUnit}`;
};

const formatPrice = (priceCents: number | null) => {
  if (!priceCents || priceCents === 0) {
    return "Pricing on request";
  }

  return `$${(priceCents / 100).toFixed(2)}`;
};

export default function AdminProductsPage() {
  const apiBaseUrl = getApiBaseUrl();
  const adminHeaders = getAdminHeaders();
  const missingAdminHeader = !hasAdminHeader();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const rows = useMemo(() => {
    return products.flatMap((product) => {
      if (!product.variants || product.variants.length === 0) {
        return [{ product, variant: null }];
      }
      return product.variants.map((variant) => ({ product, variant }));
    });
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (statusFilter === "active") params.set("isActive", "true");
      if (statusFilter === "inactive") params.set("isActive", "false");

      const response = await fetch(
        `${apiBaseUrl}/admin/products?${params.toString()}`,
        {
          headers: {
            ...adminHeaders
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = (await response.json()) as ProductResponse;
      setProducts(data.items || []);
      setTotal(data.total || 0);
      setSelectedVariantIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const toggleVariant = (variantId: string) => {
    setSelectedVariantIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  const selectAllVariants = () => {
    const allVariantIds = rows
      .map((row) => row.variant?.id)
      .filter((id): id is string => Boolean(id));

    if (selectedVariantIds.length === allVariantIds.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(allVariantIds);
    }
  };

  const applyBulkUpdate = async (payload: Record<string, unknown>) => {
    if (selectedVariantIds.length === 0) {
      setError("Select at least one variant to update.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/products/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminHeaders
        },
        body: JSON.stringify({
          variantIds: selectedVariantIds,
          ...payload
        })
      });

      if (!response.ok) {
        throw new Error("Bulk update failed");
      }

      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (isActive: boolean) => {
    await applyBulkUpdate({ variantActive: isActive });
  };

  const handleSetPrice = async () => {
    const parsed = parseFloat(bulkPrice);
    if (Number.isNaN(parsed)) {
      setError("Enter a valid price.");
      return;
    }

    const priceCents = Math.round(parsed * 100);
    await applyBulkUpdate({ priceCents });
  };

  const handlePricingOnRequest = async () => {
    await applyBulkUpdate({ setPricingOnRequest: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600">
            Manage catalog products, variants, pricing, and COA readiness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchProducts}>
            Refresh
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">New Product</Link>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="block text-xs font-semibold uppercase text-slate-500">
            Search
          </label>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, SKU, or slug"
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
          <Button variant="outline" className="mt-3 w-full" onClick={fetchProducts}>
            Apply
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <label className="block text-xs font-semibold uppercase text-slate-500">
            Status Filter
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All products</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
          <Button variant="outline" className="mt-3 w-full" onClick={fetchProducts}>
            Apply
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">
            Bulk Actions
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {selectedVariantIds.length} variant(s) selected
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSetActive(true)}
              disabled={submitting}
            >
              Set Active
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSetActive(false)}
              disabled={submitting}
            >
              Set Inactive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePricingOnRequest}
              disabled={submitting}
            >
              Pricing on Request
            </Button>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={bulkPrice}
              onChange={(event) => setBulkPrice(event.target.value)}
              placeholder="Price"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            />
            <Button size="sm" onClick={handleSetPrice} disabled={submitting}>
              Set
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="text-sm text-slate-600">
            {total} product(s) in catalog
          </div>
          <Button size="sm" variant="outline" onClick={selectAllVariants}>
            {selectedVariantIds.length === rows.filter((row) => row.variant).length
              ? "Clear Selection"
              : "Select All Variants"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Variant
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  COA
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                rows.map(({ product, variant }) => (
                  <tr key={variant ? variant.id : product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {variant ? (
                        <input
                          type="checkbox"
                          checked={selectedVariantIds.includes(variant.id)}
                          onChange={() => toggleVariant(variant.id)}
                          className="h-4 w-4"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500">SKU: {product.sku}</div>
                      {product.category && (
                        <div className="text-xs text-slate-400">
                          {product.category.replace(/_/g, " ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {variant ? (
                        <div>
                          <div className="font-medium">
                            {formatStrength(variant.strengthValue, variant.strengthUnit)}
                          </div>
                          <div className="text-xs text-slate-500">{variant.sku}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No variants</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {variant ? formatPrice(variant.priceCents) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {variant ? (variant.hasCoa ? "Available" : "Missing") : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          product.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                      {variant && (
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs font-semibold ${
                            variant.isActive
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {variant.isActive ? "Variant active" : "Variant inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/products/${product.id}`}>Edit</Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/products/${product.id}/batches`}>Batches</Link>
                        </Button>
                      </div>
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

