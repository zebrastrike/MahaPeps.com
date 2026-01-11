"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DisclaimerBar } from "@/components/layout/disclaimer-bar";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  metadata?: {
    variantId?: string;
    strengthValue?: string;
    strengthUnit?: string;
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else if (response.status === 401) {
        setError("Please log in to view your cart");
      } else {
        setError("Failed to load cart");
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("Remove this item from cart?")) {
      return;
    }

    setRemovingItemId(itemId);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        alert("Failed to remove item");
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item");
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart
      } else {
        alert("Failed to update quantity");
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-clinical-white">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <div className="text-red-900">{error}</div>
          <div className="mt-4">
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-12 text-center">
          <div className="text-6xl">🛒</div>
          <h1 className="mt-4 text-2xl font-bold text-clinical-white">
            Your cart is empty
          </h1>
          <p className="mt-2 text-charcoal-300">
            Browse our research peptide catalog to get started
          </p>
          <div className="mt-6">
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
        <DisclaimerBar variant="footer" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-clinical-white">Shopping Cart</h1>
        <p className="mt-2 text-charcoal-300">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} in cart
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6"
            >
              <div className="flex gap-4">
                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-lg font-semibold text-clinical-white hover:text-teal-400"
                  >
                    {item.productName}
                  </Link>

                  {item.metadata?.strengthValue && (
                    <div className="mt-1 text-sm text-charcoal-300">
                      Strength: {item.metadata.strengthValue}
                      {item.metadata.strengthUnit}
                    </div>
                  )}

                  <div className="mt-2 text-sm text-charcoal-400">
                    ${item.unitPrice.toFixed(2)} each
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-charcoal-600 text-clinical-white hover:bg-charcoal-700"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-clinical-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-charcoal-600 text-clinical-white hover:bg-charcoal-700"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right">
                  <div className="text-lg font-bold text-clinical-white">
                    ${item.lineTotal.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={removingItemId === item.id}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    {removingItemId === item.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Link href="/products">
              <Button variant="outline">← Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="h-fit space-y-4 rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
          <h2 className="text-xl font-bold text-clinical-white">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-charcoal-300">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Tax</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="border-t border-charcoal-700 pt-3">
              <div className="flex justify-between text-lg font-bold text-clinical-white">
                <span>Estimated Total</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => router.push("/checkout")}
          >
            Proceed to Checkout
          </Button>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold">⚠️ Research Use Only</p>
            <p className="mt-1">
              All products are for laboratory research purposes only. Not for human or veterinary use.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <DisclaimerBar variant="product" />
      </div>
    </div>
  );
}
