"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  productId: string;
  initialInWishlist?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  size = "md",
  showLabel = false,
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call when wishlist endpoints are ready
      // const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      // const endpoint = inWishlist ? 'remove' : 'add';
      // await fetch(`${apiBaseUrl}/users/wishlist/${endpoint}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId }),
      // });

      // For now, just toggle locally
      setInWishlist(!inWishlist);

      // Show feedback
      const action = inWishlist ? "removed from" : "added to";
      console.log(`Product ${productId} ${action} wishlist`);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const paddingClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${paddingClasses[size]} bg-white rounded-full shadow-md hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2`}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
        } transition-colors`}
      />
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">
          {inWishlist ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
