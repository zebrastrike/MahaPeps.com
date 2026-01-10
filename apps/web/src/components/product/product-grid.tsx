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
  purchasable?: boolean;
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
        <div className="bg-white border rounded-lg p-4">
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
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="purity">Purity (Highest)</option>
                </select>
              </div>

              {/* COA Filter */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showOnlyWithCoa}
                    onChange={(e) => setShowOnlyWithCoa(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">COA Available</span>
                </label>
              </div>
            </div>

            {/* Right Side - View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-100 text-blue-600"
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
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-lg p-12 text-center">
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
