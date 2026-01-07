"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { CoaViewer } from "@/components/product/coa-viewer";
import { Beaker } from "lucide-react";

interface Product {
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
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoaBatchId, setSelectedCoaBatchId] = useState<string | null>(null);

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

      // Transform data to include batch info for COA
      // TODO: Update this when batch integration is complete
      const transformedProducts = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: parseFloat(product.price || "0"),
        purityPercent: product.purityPercent ? parseFloat(product.purityPercent) : undefined,
        category: product.category || "RESEARCH_PEPTIDES",
        imageUrl: product.imageUrl,
        hasCoa: product.hasCoa || false,
        isActive: product.isActive !== false,
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

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log("Add to cart:", productId);
    alert(`Product ${productId} added to cart (cart functionality coming soon)`);
  };

  const handleViewCoa = (productId: string) => {
    // For now, we'll use the product ID as batch ID
    // TODO: Implement proper batch selection
    setSelectedCoaBatchId(productId);
  };

  const handleToggleWishlist = (productId: string) => {
    // TODO: Implement wishlist functionality
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
              ⚠️ RESEARCH USE ONLY - All products are intended for laboratory research applications only.
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
          onViewCoa={handleViewCoa}
          onToggleWishlist={handleToggleWishlist}
          showFilters={true}
        />
      </div>

      {/* COA Viewer Modal */}
      {selectedCoaBatchId && (
        <CoaViewer
          batchId={selectedCoaBatchId}
          isOpen={true}
          onClose={() => setSelectedCoaBatchId(null)}
        />
      )}
    </div>
  );
}

// Mock data for development
function getMockProducts(): Product[] {
  return [
    {
      id: "1",
      name: "BPC-157 Research Peptide",
      sku: "BPC-157-5MG",
      description: "Body Protection Compound for tissue repair research applications",
      price: 45.99,
      purityPercent: 98.5,
      category: "RESEARCH_PEPTIDES",
      hasCoa: true,
      isActive: true,
    },
    {
      id: "2",
      name: "TB-500 Analytical Reference",
      sku: "TB500-2MG",
      description: "Thymosin Beta-4 derivative for cellular migration studies",
      price: 52.99,
      purityPercent: 99.2,
      category: "ANALYTICAL_REFERENCE_MATERIALS",
      hasCoa: true,
      isActive: true,
    },
    {
      id: "3",
      name: "GHK-Cu Research Material",
      sku: "GHKCU-10MG",
      description: "Copper peptide complex for collagen synthesis research",
      price: 38.99,
      purityPercent: 97.8,
      category: "RESEARCH_PEPTIDES",
      hasCoa: false,
      isActive: true,
    },
    {
      id: "4",
      name: "Epithalon Reference Standard",
      sku: "EPIT-5MG",
      description: "Tetrapeptide for telomerase activation studies",
      price: 62.99,
      purityPercent: 99.5,
      category: "ANALYTICAL_REFERENCE_MATERIALS",
      hasCoa: true,
      isActive: true,
    },
    {
      id: "5",
      name: "Bacteriostatic Water",
      sku: "BAC-WATER-30ML",
      description: "Laboratory-grade bacteriostatic water for reconstitution",
      price: 12.99,
      category: "LABORATORY_ADJUNCTS",
      hasCoa: false,
      isActive: true,
    },
    {
      id: "6",
      name: "MOTS-c Research Peptide",
      sku: "MOTSC-5MG",
      description: "Mitochondrial-derived peptide for metabolic research",
      price: 48.99,
      purityPercent: 98.1,
      category: "RESEARCH_PEPTIDES",
      hasCoa: true,
      isActive: true,
    },
  ];
}
