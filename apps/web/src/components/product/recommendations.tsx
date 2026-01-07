"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./product-card";
import { TrendingUp, Users } from "lucide-react";

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

interface RecommendationsProps {
  productId?: string;
  userId?: string;
  type: "product" | "user" | "trending" | "similar";
  title?: string;
  limit?: number;
  onAddToCart?: (productId: string) => void;
  onViewCoa?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
}

export function Recommendations({
  productId,
  userId,
  type,
  title,
  limit = 4,
  onAddToCart,
  onViewCoa,
  onToggleWishlist,
}: RecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [productId, userId, type]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      let url = "";

      switch (type) {
        case "product":
          if (!productId) return;
          url = `${apiBaseUrl}/catalog/products/${productId}/recommendations?limit=${limit}`;
          break;
        case "user":
          if (!userId) return;
          url = `${apiBaseUrl}/catalog/recommendations/user/${userId}?limit=${limit}`;
          break;
        case "trending":
          url = `${apiBaseUrl}/catalog/recommendations/trending?limit=${limit}`;
          break;
        case "similar":
          if (!productId) return;
          url = `${apiBaseUrl}/catalog/products/${productId}/similar?limit=${limit}`;
          break;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "product":
        return "Researchers Also Purchased";
      case "user":
        return "Recommended For You";
      case "trending":
        return "Trending Research Materials";
      case "similar":
        return "Similar Products";
      default:
        return "Recommended Products";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "trending":
        return <TrendingUp className="w-6 h-6" />;
      case "product":
      case "user":
        return <Users className="w-6 h-6" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        {getIcon()}
        <h2 className="text-2xl font-bold text-gray-900">{title || getDefaultTitle()}</h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            onAddToCart={onAddToCart}
            onViewCoa={onViewCoa}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}
