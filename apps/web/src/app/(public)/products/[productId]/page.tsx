"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BatchSelector } from "@/components/product/batch-selector";
import { CoaViewer } from "@/components/product/coa-viewer";
import { ProductCard } from "@/components/product/product-card";
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

interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  form?: string;
  concentration?: string;
  casNumber?: string;
  molecularFormula?: string;
  isActive: boolean;
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

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showCoaViewer, setShowCoaViewer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const response = await fetch(`${apiBaseUrl}/catalog/products/${productId}`);

      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      // Load mock data for development
      setProduct(getMockProduct(productId));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedBatch) {
      alert("Please select a batch first");
      return;
    }

    console.log("Add to cart:", {
      productId,
      batchId: selectedBatch.id,
      quantity,
    });

    alert(`Added ${quantity} unit(s) to cart (cart functionality coming soon)`);
  };

  const handleViewCoa = () => {
    if (selectedBatch?.hasCoa) {
      setShowCoaViewer(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <a href="/products" className="hover:text-blue-600">
            Products
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Image */}
            <div className="bg-white border rounded-lg p-8">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Beaker className="w-32 h-32 text-gray-300" />
              </div>

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {product.category.replace(/_/g, " ")}
                </span>
                {product.isActive && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    In Stock
                  </span>
                )}
                {selectedBatch?.hasCoa && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    COA Available
                  </span>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="bg-white border rounded-lg p-6">
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
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">Research Use Only</h3>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    <li>• This product is intended for laboratory research use only</li>
                    <li>• Not for human consumption or therapeutic applications</li>
                    <li>• Must be handled by qualified research personnel</li>
                    <li>• Proper safety protocols and disposal methods required</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Section */}
          <div className="space-y-6">
            {/* Main Purchase Card */}
            <div className="bg-white border rounded-lg p-6 sticky top-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-600 mb-4">SKU: {product.sku}</p>

              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${product.price.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Per unit</p>
              </div>

              {/* Batch Selector */}
              <div className="mb-6">
                <BatchSelector
                  productId={productId}
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Purity Display */}
              {selectedBatch && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Selected Batch Purity</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {parseFloat(selectedBatch.purityPercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.isActive || !selectedBatch}
                className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Research Cart
              </button>

              {/* Wishlist Button */}
              <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Add to Wishlist
              </button>

              {/* COA Button */}
              {selectedBatch?.hasCoa && (
                <button
                  onClick={handleViewCoa}
                  className="w-full mt-3 px-6 py-3 bg-green-50 border border-green-300 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View Certificate of Analysis
                </button>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-blue-900">
                  <p className="font-semibold mb-1">Need Help?</p>
                  <p className="text-blue-700">
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Researchers Also Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TODO: Replace with actual related products */}
            {getMockRelatedProducts().map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} {...relatedProduct} />
            ))}
          </div>
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

// Mock data functions
function getMockProduct(id: string): ProductDetail {
  return {
    id,
    name: "BPC-157 Research Peptide",
    sku: "BPC-157-5MG",
    description:
      "Body Protection Compound (BPC-157) is a synthetic peptide derived from a protective gastric protein. This research material is supplied for in vitro laboratory investigations studying tissue repair mechanisms, cellular proliferation pathways, and angiogenesis signaling. The compound has been characterized in multiple peer-reviewed studies examining its effects on fibroblast migration and collagen synthesis in controlled laboratory environments. Each batch undergoes rigorous analytical testing including HPLC, mass spectrometry, and purity verification by accredited third-party laboratories.",
    price: 45.99,
    category: "RESEARCH_PEPTIDES",
    form: "Lyophilized powder",
    concentration: "5mg per vial",
    casNumber: "137525-51-0",
    molecularFormula: "C₆₂H₉₈N₁₆O₂₂",
    isActive: true,
  };
}

function getMockRelatedProducts() {
  return [
    {
      id: "2",
      name: "TB-500",
      sku: "TB500-2MG",
      description: "Thymosin Beta-4 derivative for research",
      price: 52.99,
      purityPercent: 99.2,
      category: "RESEARCH_PEPTIDES",
      hasCoa: true,
      isActive: true,
    },
    {
      id: "3",
      name: "GHK-Cu",
      sku: "GHKCU-10MG",
      description: "Copper peptide complex for research",
      price: 38.99,
      purityPercent: 97.8,
      category: "RESEARCH_PEPTIDES",
      hasCoa: false,
      isActive: true,
    },
    {
      id: "5",
      name: "Bacteriostatic Water",
      sku: "BAC-WATER-30ML",
      description: "Laboratory-grade reconstitution solution",
      price: 12.99,
      category: "LABORATORY_ADJUNCTS",
      hasCoa: false,
      isActive: true,
    },
    {
      id: "6",
      name: "MOTS-c",
      sku: "MOTSC-5MG",
      description: "Mitochondrial peptide for metabolic research",
      price: 48.99,
      purityPercent: 98.1,
      category: "RESEARCH_PEPTIDES",
      hasCoa: true,
      isActive: true,
    },
  ];
}
