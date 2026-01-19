"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { ShoppingCart, FileText, Heart, Info } from "lucide-react";

interface ProductVariantOption {
  id: string;
  strengthValue: number;
  strengthUnit: string;
  sku: string;
  priceCents: number | null;
  isActive: boolean;
  hasCoa?: boolean;
}

interface ProductCardProps {
  id: string;
  slug?: string | null;
  name: string;
  sku: string;
  description?: string;
  purityPercent?: number;
  category: string;
  priceCents?: number | null;
  imageUrl?: string;
  hasCoa?: boolean;
  isActive?: boolean;
  variants?: ProductVariantOption[];
  defaultVariantId?: string | null;
  onAddToCart?: (productId: string, variantId?: string) => void;
  onViewCoa?: (productId: string, variantId?: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

const formatStrength = (value: number, unit: string) => `${value}${unit.toLowerCase()}`;

const formatPrice = (priceCents: number | null | undefined) => {
  if (!priceCents || priceCents === 0) {
    return "Pricing on request";
  }

  return `$${(priceCents / 100).toFixed(2)}`;
};

export function ProductCard({
  id,
  slug,
  name,
  sku,
  description,
  purityPercent,
  category,
  priceCents,
  imageUrl,
  hasCoa = false,
  isActive = true,
  variants = [],
  defaultVariantId,
  onAddToCart,
  onViewCoa,
  onToggleWishlist,
}: ProductCardProps) {
  const initialVariantId =
    (defaultVariantId && variants.some((variant) => variant.id === defaultVariantId)
      ? defaultVariantId
      : variants[0]?.id) ||
    "";
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) || variants[0];

  const displayImage = imageError || !imageUrl
    ? "/products/placeholder.png"
    : imageUrl;

  const variantHasCoa = selectedVariant?.hasCoa ?? hasCoa;
  const variantSku = selectedVariant?.sku || sku;
  const priceLabel = formatPrice(selectedVariant?.priceCents ?? priceCents);
  const canPurchase =
    isActive &&
    (selectedVariant ? selectedVariant.isActive && (selectedVariant.priceCents ?? 0) > 0 : true);

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(id, selectedVariant?.id);
  };

  const handleViewCoa = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewCoa) onViewCoa(id, selectedVariant?.id);
  };

  const handleToggleWishlist = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
    if (onToggleWishlist) onToggleWishlist(id);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white border rounded-lg overflow-hidden transition-all duration-300 ${
        isHovered ? "shadow-xl border-blue-300 -translate-y-1" : "shadow-sm border-gray-200"
      } ${!isActive ? "opacity-60" : ""}`}
    >
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
      >
        <Heart
          className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
        />
      </button>

      {/* Product Image */}
      <Link href={`/products/${slug || id}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={displayImage}
            alt={name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {purityPercent && (
              <div className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
                {purityPercent.toFixed(2)}% Purity
              </div>
            )}

            {variantHasCoa && (
              <div className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-1">
                <FileText className="w-3 h-3" />
                COA
              </div>
            )}

            {!isActive && (
              <div className="px-3 py-1 bg-gray-600 text-white text-sm font-semibold rounded-full shadow-lg">
                Inactive
              </div>
            )}
          </div>

          {/* Quick View Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex gap-2">
                {variantHasCoa && onViewCoa && (
                  <button
                    onClick={handleViewCoa}
                    className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <FileText className="w-4 h-4" />
                    View COA
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${slug || id}`} className="block">
          <div className="mb-2">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{category}</div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <p className="text-xs text-gray-600 mb-2">SKU: {variantSku}</p>
          </div>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
          )}
        </Link>

        {variants.length > 1 && (
          <div className="mb-3">
            <label className="text-xs text-gray-500">Strength</label>
            <select
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="mt-1 w-full rounded-md border border-blue-500 bg-blue-600 px-2 py-2 text-sm text-white placeholder-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 [&>option]:bg-blue-600 [&>option]:text-white"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {formatStrength(variant.strengthValue, variant.strengthUnit)}
                </option>
              ))}
            </select>
          </div>
        )}

        {variants.length === 1 && selectedVariant && (
          <div className="mb-3 text-xs text-gray-500">
            Strength: {formatStrength(selectedVariant.strengthValue, selectedVariant.strengthUnit)}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {priceLabel}
            </div>
            <div className="text-xs text-gray-500">Per unit</div>
          </div>

          {/* Info tooltip */}
          <div className="relative group/info">
            <Info className="w-5 h-5 text-gray-400 hover:text-blue-600 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none">
              Research use only. Not for human consumption.
            </div>
          </div>
        </div>

        {/* Research Compliance Badge */}
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <strong>Research Use Only</strong> - Not for human consumption
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!canPurchase}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            canPurchase
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>

        <Link
          href={`/products/${slug || id}`}
          className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
