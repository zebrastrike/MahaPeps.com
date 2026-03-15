"use client";

import { useState } from "react";
import { ProductCard } from "./product-card";
import { Grid, List, SlidersHorizontal } from "lucide-react";

interface ProductVariant {
  id: string;
  strengthValue: number;
  strengthUnit: string;
  sku: string;
  priceCents: number | null;
  isActive: boolean;
  hasCoa?: boolean;
}

interface Product {
  id: string;
  slug?: string | null;
  name: string;
  sku: string;
  description?: string;
  purityPercent?: number;
  category: string;
  imageUrl?: string;
  hasCoa?: boolean;
  isActive?: boolean;
  variants?: ProductVariant[];
  defaultVariantId?: string | null;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart?: (productId: string, variantId?: string) => void;
  onViewCoa?: (productId: string, variantId?: string) => void;
  onToggleWishlist?: (productId: string) => void;
  showFilters?: boolean;
}

type ViewMode = "grid" | "list";
type SortOption = "name" | "price-low" | "price-high" | "purity";

const getProductPriceCents = (product: Product) => {
  const variants = product.variants || [];
  const preferredVariant =
    variants.find((variant) => variant.id === product.defaultVariantId) ||
    variants.find((variant) => variant.priceCents && variant.priceCents > 0) ||
    variants[0];

  const priceCents = preferredVariant?.priceCents ?? null;
  if (!priceCents || priceCents <= 0) return null;
  return priceCents;
};

export function ProductGrid({
  products,
  onAddToCart,
  onViewCoa,
  onToggleWishlist,
  showFilters = true,
}: ProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showOnlyWithCoa, setShowOnlyWithCoa] = useState(false);

  // Get unique categories
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // Filter products
  let filteredProducts = [...products];

  if (filterCategory !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category === filterCategory);
  }

  if (showOnlyWithCoa) {
    filteredProducts = filteredProducts.filter((product) => {
      if (product.variants && product.variants.length > 0) {
        return product.variants.some((variant) => variant.hasCoa);
      }
      return product.hasCoa;
    });
  }

  // Sort products
  filteredProducts.sort((a, b) => {
    const priceA = getProductPriceCents(a);
    const priceB = getProductPriceCents(b);

    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-low":
        return (priceA ?? Number.POSITIVE_INFINITY) - (priceB ?? Number.POSITIVE_INFINITY);
      case "price-high":
        return (priceB ?? Number.NEGATIVE_INFINITY) - (priceA ?? Number.NEGATIVE_INFINITY);
      case "purity":
        return (b.purityPercent || 0) - (a.purityPercent || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400 [&>option]:bg-white [&>option]:text-slate-800"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400 [&>option]:bg-white [&>option]:text-slate-800"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="purity">Purity (Highest)</option>
                </select>
              </div>

              {/* COA Filter */}
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 transition-colors hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={showOnlyWithCoa}
                    onChange={(e) => setShowOnlyWithCoa(e.target.checked)}
                    className="h-4 w-4 rounded text-accent-600 focus:ring-2 focus:ring-accent-500"
                  />
                  <span className="text-sm font-medium text-gray-700">COA Available</span>
                </label>
              </div>
            </div>

            {/* Right Side - View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-xl p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-accent-100 text-accent-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-xl p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-accent-100 text-accent-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
              <span className="font-semibold">{products.length}</span> products
            </div>
            {(filterCategory !== "all" || showOnlyWithCoa) && (
              <button
                onClick={() => {
                  setFilterCategory("all");
                  setShowOnlyWithCoa(false);
                }}
                className="font-medium text-accent-600 hover:text-accent-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <SlidersHorizontal className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more results
          </p>
          <button
            onClick={() => {
              setFilterCategory("all");
              setShowOnlyWithCoa(false);
            }}
            className="rounded-full bg-accent-500 px-5 py-2 text-white transition-colors hover:bg-accent-600"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
          }
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
              onViewCoa={onViewCoa}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
