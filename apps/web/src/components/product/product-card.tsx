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
  if (!priceCents || priceCents === 0) return "Pricing on request";
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
    (defaultVariantId && variants.some((v) => v.id === defaultVariantId)
      ? defaultVariantId
      : variants[0]?.id) || "";

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);
  const [isHovered, setIsHovered]     = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError]   = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const displayImage    = imageError || !imageUrl ? "/products/placeholder.png" : imageUrl;
  const variantHasCoa   = selectedVariant?.hasCoa ?? hasCoa;
  const variantSku      = selectedVariant?.sku || sku;
  const priceLabel      = formatPrice(selectedVariant?.priceCents ?? priceCents);
  const canPurchase     = isActive && (selectedVariant ? selectedVariant.isActive && (selectedVariant.priceCents ?? 0) > 0 : true);

  const handleAddToCart     = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (onAddToCart) onAddToCart(id, selectedVariant?.id); };
  const handleViewCoa       = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); if (onViewCoa) onViewCoa(id, selectedVariant?.id); };
  const handleToggleWishlist = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIsInWishlist(!isInWishlist); if (onToggleWishlist) onToggleWishlist(id); };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden border bg-navy-800 transition-all duration-300 ${
        isHovered
          ? "border-gold-500/40 shadow-gold -translate-y-0.5"
          : "border-gold-500/10 shadow-dark"
      } ${!isActive ? "opacity-50" : ""}`}
    >
      {/* Made in America stamp */}
      <div className="absolute left-3 top-3 z-10">
        <span className="badge-american">&#9733; Made in USA</span>
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className="absolute right-3 top-3 z-10 p-1.5 text-warm-white/30 transition-colors hover:text-red-400"
      >
        <Heart className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      {/* Product Image */}
      <Link href={`/products/${slug || id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-navy-900/60">
          <img
            src={displayImage}
            alt={name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />

          {/* Purity / COA badges — bottom left */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5">
            {purityPercent && (
              <span className="badge-american">{purityPercent.toFixed(1)}% Purity</span>
            )}
            {variantHasCoa && (
              <span className="badge-american"><FileText className="h-2.5 w-2.5" /> COA</span>
            )}
            {!isActive && (
              <span className="font-label bg-navy-700/80 px-2 py-0.5 text-[0.55rem] tracking-wider text-warm-white/40">
                Inactive
              </span>
            )}
          </div>

          {/* COA Quick View */}
          {isHovered && variantHasCoa && onViewCoa && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-900/40">
              <button
                onClick={handleViewCoa}
                className="flex items-center gap-2 border border-gold-500/60 bg-navy-900/80 px-4 py-2 font-label text-[0.6rem] tracking-widest text-gold-400 transition-colors hover:bg-gold-500/10"
              >
                <FileText className="h-3 w-3" />
                View COA
              </button>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <Link href={`/products/${slug || id}`} className="block">
          <p className="font-label mb-1 text-[0.55rem] tracking-widest text-warm-white/30">{category}</p>
          <h3 className="font-editorial mb-1 text-xl text-warm-white transition-colors group-hover:text-gold-300">
            {name}
          </h3>
          <p className="font-label text-[0.5rem] tracking-wider text-warm-white/20 mb-3">SKU: {variantSku}</p>

          {description && (
            <p className="text-xs font-light leading-relaxed text-warm-white/40 line-clamp-2 mb-3">
              {description}
            </p>
          )}
        </Link>

        {/* Variant selector */}
        {variants.length > 1 && (
          <div className="mb-4">
            <label className="font-label text-[0.55rem] tracking-widest text-warm-white/30">Strength</label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="mt-1.5 w-full border border-gold-500/20 bg-navy-900 px-3 py-2 text-xs text-warm-white/70 focus:border-gold-500/50 focus:outline-none [&>option]:bg-navy-900"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {formatStrength(v.strengthValue, v.strengthUnit)}
                </option>
              ))}
            </select>
          </div>
        )}

        {variants.length === 1 && selectedVariant && (
          <p className="font-label mb-4 text-[0.55rem] tracking-widest text-warm-white/30">
            Strength: {formatStrength(selectedVariant.strengthValue, selectedVariant.strengthUnit)}
          </p>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="font-editorial text-2xl text-gold-400">{priceLabel}</span>
            <p className="font-label text-[0.5rem] tracking-wider text-warm-white/25">Per unit</p>
          </div>
          <div className="relative group/info">
            <Info className="h-4 w-4 cursor-help text-warm-white/20 hover:text-gold-500/50" />
            <div className="absolute bottom-full right-0 mb-2 w-44 border border-gold-500/15 bg-navy-900 p-2.5 text-[0.6rem] leading-relaxed text-warm-white/50 opacity-0 shadow-dark-lg transition-opacity group-hover/info:opacity-100 pointer-events-none">
              Research use only. Not for human consumption.
            </div>
          </div>
        </div>

        {/* Research compliance notice */}
        <p className="font-label mb-4 text-[0.5rem] tracking-wider text-warm-white/20">
          Research Use Only — Not for human consumption
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-5 pb-5">
        <button
          onClick={handleAddToCart}
          disabled={!canPurchase}
          className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 font-label text-[0.6rem] tracking-widest transition-all ${
            canPurchase
              ? "border border-gold-500/60 text-gold-400 hover:bg-gold-500/10 hover:border-gold-400"
              : "border border-warm-white/10 text-warm-white/25 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Add to Cart
        </button>

        <Link
          href={`/products/${slug || id}`}
          className="border border-warm-white/10 px-4 py-2.5 font-label text-[0.6rem] tracking-widest text-warm-white/35 transition-colors hover:border-warm-white/25 hover:text-warm-white/60"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
