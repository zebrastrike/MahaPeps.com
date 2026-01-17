"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { useCart } from "@/contexts/cart-context";
import { Beaker } from "lucide-react";

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/catalog/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      const transformedProducts = (data || []).map((product: any) => ({
        ...product,
        category: product.category || "RESEARCH_PEPTIDES",
        description: product.description || undefined,
        purityPercent: product.purityPercent ? parseFloat(product.purityPercent) : undefined,
        variants: (product.variants || []).map((variant: any) => ({
          ...variant,
          strengthValue: parseFloat(variant.strengthValue)
        }))
      }));

      setProducts(transformedProducts);
    } catch (error) {
      setError("Unable to load products right now.");
      setProducts([]);
    } finally{
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, variantId?: string) => {
    if (!variantId) {
      alert("Please select a product variant first");
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
          variantId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        await refreshCart();
        alert("Added to cart!");
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading research materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <Beaker className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Research Materials Catalog</h1>
              <p className="text-blue-100 text-lg">
                Premium peptides and analytical reference materials for laboratory research
              </p>
            </div>
          </div>

          {/* Compliance Banner */}
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
            <p className="text-sm font-semibold">
              RESEARCH USE ONLY - All products are intended for laboratory research applications only.
              Not for human consumption or therapeutic use.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </div>
        )}
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          showFilters={true}
        />
      </div>
    </div>
  );
}
