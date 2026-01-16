"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CartItem {
  productName: string;
  quantity: number;
  lineTotal: number;
}

interface CartContextType {
  itemCount: number;
  subtotal: number;
  items: CartItem[];
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setItemCount(0);
      setSubtotal(0);
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItemCount(data.itemCount || 0);
        setSubtotal(data.subtotal || 0);
        setItems(data.items || []);
      } else {
        setItemCount(0);
        setSubtotal(0);
        setItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setItemCount(0);
      setSubtotal(0);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, subtotal, items, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
