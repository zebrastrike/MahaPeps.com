"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, FileText, Heart, Info } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  purityPercent?: number;
  category: string;
  imageUrl?: string;
  hasCoa?: boolean;
  isActive?: boolean;
  onAddToCart?: (productId: string) => void;
  onViewCoa?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function ProductCard({
  id,
  name,
  sku,
  description,
  price,
  purityPercent,
  category,
  imageUrl,
  hasCoa = false,
  isActive = true,
  onAddToCart,
  onViewCoa,
  onToggleWishlist,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(id);
  };

  const handleViewCoa = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onViewCoa) onViewCoa(id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
    if (onToggleWishlist) onToggleWishlist(id);
  };

  const displayImage = imageError || !imageUrl
    ? "/images/placeholder-product.png"
    : imageUrl;

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
      <Link href={`/products/${id}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={displayImage}
            alt={name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ${
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

            {hasCoa && (
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
                {hasCoa && onViewCoa && (
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
      <Link href={`/products/${id}`} className="block p-4">
        <div className="mb-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{category}</div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-gray-600 mb-2">SKU: {sku}</p>
        </div>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${price.toFixed(2)}
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
      </Link>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!isActive}
          className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
            isActive
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>

        <Link
          href={`/products/${id}`}
          className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
