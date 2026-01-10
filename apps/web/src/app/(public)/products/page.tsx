"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { Beaker } from "lucide-react";

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
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
      console.error("Error fetching products:", error);
      // Load mock data for development
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string, variantId?: string) => {
    console.log("Add to cart:", { productId, variantId });
    alert("Cart functionality is coming soon.");
  };

  const handleToggleWishlist = (productId: string) => {
    console.log("Toggle wishlist:", productId);
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
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          showFilters={true}
        />
      </div>
    </div>
  );
}

// Mock data for development
function getMockProducts(): Product[] {
  return [
    {
      id: "1",
      name: "BPC-157 Research Peptide",
      sku: "BPC-157",
      description: "Body Protection Compound for tissue repair research applications",
      purityPercent: 98.5,
      category: "RESEARCH_PEPTIDES",
      hasCoa: true,
      isActive: true,
      variants: [
        {
          id: "1-5mg",
          strengthValue: 5,
          strengthUnit: "MG",
          sku: "BPC-157-5MG",
          priceCents: 4599,
          isActive: true,
          hasCoa: true,
          purchasable: true
        }
      ]
    },
    {
      id: "2",
      name: "TB-500 Analytical Reference",
      sku: "TB500",
      description: "Thymosin Beta-4 derivative for cellular migration studies",
      purityPercent: 99.2,
      category: "ANALYTICAL_REFERENCE_MATERIALS",
      hasCoa: true,
      isActive: true,
      variants: [
        {
          id: "2-2mg",
          strengthValue: 2,
          strengthUnit: "MG",
          sku: "TB500-2MG",
          priceCents: 5299,
          isActive: true,
          hasCoa: true,
          purchasable: true
        }
      ]
    },
    {
      id: "3",
      name: "GHK-Cu Research Material",
      sku: "GHKCU",
      description: "Copper peptide complex for collagen synthesis research",
      purityPercent: 97.8,
      category: "RESEARCH_PEPTIDES",
      hasCoa: false,
      isActive: true,
      variants: [
        {
          id: "3-10mg",
          strengthValue: 10,
          strengthUnit: "MG",
          sku: "GHKCU-10MG",
          priceCents: 3899,
          isActive: true,
          hasCoa: false,
          purchasable: false
        }
      ]
    }
  ];
}
