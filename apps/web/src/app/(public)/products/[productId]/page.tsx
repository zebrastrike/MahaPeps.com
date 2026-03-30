"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BatchSelector } from "@/components/product/batch-selector";
import { CoaViewer } from "@/components/product/coa-viewer";
import { Recommendations } from "@/components/product/recommendations";
import { useCart } from "@/contexts/cart-context";
import {
  ShoppingCart,
  FileText,
  Heart,
  AlertTriangle,
  Info,
  CheckCircle,
  Beaker,
  Shield,
} from "lucide-react";

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

interface ProductDetail {
  id: string;
  name: string;
  slug?: string | null;
  sku: string;
  description: string;
  category: string;
  form?: string;
  concentration?: string;
  casNumber?: string;
  molecularFormula?: string;
  imageUrl?: string | null;
  isActive: boolean;
  stockStatus?: string;
  expectedRestockDate?: string | null;
  variants: ProductVariant[];
  defaultVariantId?: string | null;
}

interface Batch {
  id: string;
  batchCode: string;
  purityPercent: string;
  manufacturedAt: string;
  expiresAt: string;
  testingLab: string | null;
  isActive: boolean;
  hasCoa: boolean;
}

const formatStrength = (value: number, unit: string) => `${value}${unit.toLowerCase()}`;

const formatPrice = (priceCents: number | null | undefined) => {
  if (!priceCents || priceCents === 0) {
    return "Pricing on request";
  }

  return `$${(priceCents / 100).toFixed(2)}`;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { refreshCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showCoaViewer, setShowCoaViewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [notifyStatus, setNotifyStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    setSelectedBatch(null);
  }, [selectedVariantId]);

  const fetchProductDetails = async () => {
    try {
      setError(null);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/catalog/products/${productId}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setProduct(data);

      if (data?.variants?.length) {
        const defaultVariant =
          data.variants.find((variant: ProductVariant) => variant.id === data.defaultVariantId) ||
          data.variants[0];
        setSelectedVariantId(defaultVariant?.id ?? null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Unable to load product details right now.");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = product?.variants.find((variant) => variant.id === selectedVariantId);
  const priceLabel = formatPrice(selectedVariant?.priceCents);
  // COA enforcement disabled - allow purchase without batch selection
  const canPurchase = Boolean(
    product?.isActive && selectedVariant
  );
  const isOutOfStock = product?.stockStatus === "OUT_OF_STOCK";

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("Please select a strength first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add items to your cart");
      window.location.href = "/sign-in";
      return;
    }

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          quantity,
        }),
      });

      if (response.ok) {
        const cartData = await response.json();
        console.log("[AddToCart] POST response:", cartData);
        // Refresh cart count in navbar
        console.log("[AddToCart] Calling refreshCart...");
        await refreshCart();
        console.log("[AddToCart] refreshCart completed");
        alert(`Added ${quantity} item(s) to cart!`);
      } else if (response.status === 401) {
        alert("Please log in to add items to your cart");
        window.location.href = "/sign-in";
      } else {
        const data = await response.json();
        alert(data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add to cart");
    }
  };

  const handleViewCoa = () => {
    if (selectedBatch?.hasCoa) {
      setShowCoaViewer(true);
    }
  };

  const handleNotify = async () => {
    const email = prompt("Enter your email to be notified when this item is available.");
    if (!email) return;

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/stock-notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId, email })
      });

      if (!response.ok) {
        throw new Error("Unable to create notification request.");
      }

      setNotifyStatus("Notification request saved.");
    } catch (err) {
      setNotifyStatus("Unable to save notification request.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-accent-600"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Unavailable</h2>
          <p className="text-gray-600">
            {error || "The requested product could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <a href="/products" className="hover:text-accent-700">
            Products
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                <img
                    src="/products/maha-branded.jpg"
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
              </div>

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-semibold text-accent-700">
                  {product.category.replace(/_/g, " ")}
                </span>
                {product.isActive && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    In Stock
                  </span>
                )}
                {selectedBatch?.hasCoa && (
                  <span className="flex items-center gap-1 rounded-full bg-accent-100 px-3 py-1 text-sm font-semibold text-accent-700">
                    <FileText className="w-3 h-3" />
                    COA Available
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>

              {/* Technical Specifications */}
              {(product.casNumber || product.molecularFormula || product.form || product.concentration) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.casNumber && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">CAS Number</p>
                        <p className="font-semibold">{product.casNumber}</p>
                      </div>
                    )}
                    {product.molecularFormula && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Molecular Formula</p>
                        <p className="font-semibold font-mono">{product.molecularFormula}</p>
                      </div>
                    )}
                    {product.form && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Form</p>
                        <p className="font-semibold">{product.form}</p>
                      </div>
                    )}
                    {product.concentration && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Concentration</p>
                        <p className="font-semibold">{product.concentration}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Notice */}
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">Research Use Only</h3>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>- This product is intended for laboratory research use only</li>
                    <li>- Not for human consumption or therapeutic applications</li>
                    <li>- Must be handled by qualified research personnel</li>
                    <li>- Proper safety procedures and disposal methods required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Section */}
          <div className="space-y-6">
            {/* Main Purchase Card */}
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-600 mb-4">
                SKU: {selectedVariant?.sku || product.sku}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength
                  </label>
                  <select
                    value={selectedVariantId || ""}
                    onChange={(event) => setSelectedVariantId(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
                  >
                    {product.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {formatStrength(variant.strengthValue, variant.strengthUnit)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {priceLabel}
                </div>
                <p className="text-sm text-gray-600">Per unit</p>
              </div>

              {/* Batch Selector */}
              <div className="mb-6">
                <BatchSelector
                  productId={productId}
                  variantId={selectedVariantId || undefined}
                  selectedBatchId={selectedBatch?.id}
                  onBatchSelect={setSelectedBatch}
                  onViewCoa={handleViewCoa}
                />
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              {/* Purity Display */}
              {selectedBatch && (
                <div className="mb-6 rounded-xl border border-accent-200 bg-accent-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Selected Batch Purity</span>
                    <span className="text-2xl font-bold text-accent-700">
                      {parseFloat(selectedBatch.purityPercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!canPurchase}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-4 font-bold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Research Cart
              </button>

              {!canPurchase && isOutOfStock && (
                <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">Currently unavailable</p>
                  <p className="text-xs text-slate-500">
                    Request an availability update when this item returns.
                  </p>
                  <button
                    onClick={handleNotify}
                    className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Notify When Available
                  </button>
                  {notifyStatus && (
                    <p className="mt-2 text-xs text-slate-500">{notifyStatus}</p>
                  )}
                </div>
              )}

              {/* Wishlist Button */}
              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>

              {/* COA Button */}
              {selectedBatch?.hasCoa && (
                <button
                  onClick={handleViewCoa}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-green-300 bg-green-50 px-6 py-3 font-semibold text-green-700 transition-colors hover:bg-green-100"
                >
                  <FileText className="w-5 h-5" />
                  View Certificate of Analysis
                </button>
              )}
            </div>

            {/* Info Card */}
            <div className="rounded-2xl border border-accent-200 bg-accent-50 p-4 text-sm">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-700" />
                <div className="text-accent-900">
                  <p className="font-semibold mb-1">Need Help?</p>
                  <p className="text-accent-700">
                    Contact our research support team for product specifications,
                    bulk ordering, or technical questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <Recommendations
            type="similar"
            productId={productId}
            title="Researchers Also Viewed"
          />
        </div>
      </div>

      {/* COA Viewer Modal */}
      {showCoaViewer && selectedBatch && (
        <CoaViewer
          batchId={selectedBatch.id}
          isOpen={true}
          onClose={() => setShowCoaViewer(false)}
        />
      )}
    </div>
  );
}

