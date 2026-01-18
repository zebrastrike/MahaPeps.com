"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DisclaimerBar } from "@/components/layout/disclaimer-bar";
import { useCart } from "@/contexts/cart-context";
import { Info, Plus, Minus, Trash2 } from "lucide-react";

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

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// Flat rate shipping tiers
const SHIPPING_TIERS = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "USPS Ground Advantage",
    estimatedDays: "5-7 business days",
    price: 15,
  },
  {
    id: "priority",
    name: "Priority Shipping",
    description: "USPS Priority Mail",
    estimatedDays: "2-3 business days",
    price: 25,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "USPS Priority Mail Express",
    estimatedDays: "1-2 business days",
    price: 45,
  },
];

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  // Customer information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Guest checkout vs logged in
  const [isGuest, setIsGuest] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");

  // Single compliance checkbox
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Address forms
  const [shippingAddress, setShippingAddress] = useState<Address>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Shipping tier selection (flat rate)
  const [selectedShippingTier, setSelectedShippingTier] = useState(SHIPPING_TIERS[0]);

  // Order insurance and processing options
  const [orderInsurance, setOrderInsurance] = useState(false);
  const [processingType, setProcessingType] = useState<'STANDARD' | 'EXPEDITED' | 'RUSH'>('STANDARD');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate insurance fee (2% of subtotal, min $2, max $50)
  const calculateInsurance = (subtotal: number) => {
    if (!orderInsurance) return 0;
    const fee = subtotal * 0.02;
    return Math.max(2, Math.min(50, fee));
  };

  // Processing fees
  const processingFees: Record<string, number> = {
    STANDARD: 0,
    EXPEDITED: 25,
    RUSH: 50,
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // Allow guest checkout
      setIsGuest(true);
      setLoading(false);
    } else {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setCart({
          items: data.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            metadata: item.metadata,
          })),
          subtotal: data.subtotal,
          itemCount: data.itemCount,
        });
      } else {
        setError("Failed to load cart. Please try again.");
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, newQuantity: number) => {
    setUpdatingItem(itemId);
    try {
      const token = localStorage.getItem("token");
      if (newQuantity <= 0) {
        // Remove item
        await fetch(`/api/cart/items/${itemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Update quantity
        await fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });
      }
      await fetchCart();
      await refreshCart();
    } catch (err) {
      console.error("Failed to update cart:", err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItem(itemId);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
      await refreshCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!firstName || !lastName) {
      setError("Please enter your first and last name");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (createAccount && (!password || password.length < 8)) {
      setError("Password must be at least 8 characters");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms of Service to continue");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          shippingAddress,
          billingAddress: sameAsShipping ? shippingAddress : billingAddress,
          shippingTier: selectedShippingTier.id,
          shippingCost: selectedShippingTier.price,
          termsAccepted,
          orderInsurance,
          processingType,
          isGuest,
          createAccount: isGuest ? createAccount : false,
          password: createAccount ? password : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment page
        router.push(`/payment/${data.paymentLink.token}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canCheckout = termsAccepted;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-clinical-white">Loading checkout...</div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-12 text-center">
          <h1 className="text-2xl font-bold text-clinical-white">Your cart is empty</h1>
          <p className="mt-2 text-charcoal-300 mb-6">
            Browse our catalog to add research materials to your cart
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="/products">Browse Products</a>
            </Button>
            {isGuest && (
              <Button variant="outline" asChild>
                <a href="/sign-in?redirect=/checkout">Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-clinical-white">Checkout</h1>

      {/* Payment Process Explanation */}
      <div className="mb-6 rounded-lg border border-accent-500/30 bg-gradient-to-r from-accent-900/20 to-charcoal-800/50 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-accent-400 mt-0.5" />
          <div className="text-sm text-charcoal-200">
            <p className="font-semibold text-clinical-white mb-1">How Payment Works</p>
            <p>
              After checkout, you&apos;ll receive a secure payment invoice via email with instructions for Zelle, CashApp, or wire transfer.
              Once payment is confirmed, order fulfillment begins immediately. <strong>Most orders ship the next business day.</strong>
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Forms */}
          <div className="space-y-8">
            {/* Guest Checkout Notice */}
            {isGuest && (
              <section className="rounded-lg border border-accent-500/30 bg-gradient-to-r from-accent-900/20 to-charcoal-800/50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 flex-shrink-0 text-accent-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-clinical-white mb-1">Checking out as guest</p>
                    <p className="text-charcoal-200">
                      Already have an account?{" "}
                      <a href="/sign-in?redirect=/checkout" className="text-accent-400 hover:text-accent-300 underline">
                        Sign in
                      </a>{" "}
                      for faster checkout and order tracking.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Customer Information */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">Contact Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-charcoal-300">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-charcoal-300">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    placeholder="Smith"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-charcoal-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    placeholder="your@email.com"
                  />
                  <p className="mt-1 text-xs text-charcoal-400">Payment invoice will be sent to this email</p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-charcoal-300">Phone Number (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Create Account Option (only for guests) */}
              {isGuest && (
                <div className="mt-6 pt-4 border-t border-charcoal-700">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked === true)}
                      className="mt-0.5"
                    />
                    <div className="text-sm">
                      <span className="text-clinical-white font-medium">Create an account</span>
                      <p className="text-charcoal-400 text-xs mt-0.5">
                        Track orders, save addresses, and checkout faster next time
                      </p>
                    </div>
                  </label>

                  {createAccount && (
                    <div className="mt-4">
                      <label className="mb-1 block text-sm text-charcoal-300">Create Password *</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                        placeholder="Minimum 8 characters"
                        minLength={8}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Shipping Address */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">Shipping Address</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-charcoal-300">Address Line 1</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.line1}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, line1: e.target.value })
                    }
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm text-charcoal-300">
                    Address Line 2 (optional)
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.line2}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, line2: e.target.value })
                    }
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-charcoal-300">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-charcoal-300">State</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-charcoal-300">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-charcoal-300">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  />
                </div>
              </div>

            </section>

            {/* Shipping Method - Flat Rate Tiers */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">Shipping Method</h2>
              <div className="space-y-3">
                {SHIPPING_TIERS.map((tier) => (
                  <label
                    key={tier.id}
                    className={`flex cursor-pointer items-center justify-between rounded-md border p-4 transition-colors ${
                      selectedShippingTier.id === tier.id
                        ? "border-teal-500 bg-teal-900/20"
                        : "border-charcoal-600 hover:border-charcoal-500"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingTier"
                        checked={selectedShippingTier.id === tier.id}
                        onChange={() => setSelectedShippingTier(tier)}
                        className="text-teal-500"
                      />
                      <div>
                        <div className="font-medium text-clinical-white">{tier.name}</div>
                        <div className="text-sm text-charcoal-400">{tier.description}</div>
                        <div className="text-xs text-charcoal-500">{tier.estimatedDays}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-clinical-white">
                      ${tier.price.toFixed(2)}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Processing Speed */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
                <h2 className="mb-4 text-xl font-bold text-clinical-white">Processing Speed</h2>
                <div className="space-y-3">
                  {/* STANDARD */}
                  <label
                    className={`flex cursor-pointer items-start justify-between rounded-md border p-4 transition-colors ${
                      processingType === 'STANDARD'
                        ? "border-accent-500 bg-accent-900/20"
                        : "border-charcoal-600 hover:border-charcoal-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="processingType"
                        checked={processingType === 'STANDARD'}
                        onChange={() => setProcessingType('STANDARD')}
                        className="mt-1 text-accent-500"
                      />
                      <div>
                        <div className="font-medium text-clinical-white">Standard Processing</div>
                        <div className="text-sm text-charcoal-400">2 business days - FREE</div>
                        <div className="text-xs text-charcoal-500 mt-1">
                          Orders paid before 10 AM MST may ship same day
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-clinical-white">FREE</div>
                  </label>

                  {/* EXPEDITED */}
                  <label
                    className={`flex cursor-pointer items-start justify-between rounded-md border p-4 transition-colors ${
                      processingType === 'EXPEDITED'
                        ? "border-accent-500 bg-accent-900/20"
                        : "border-charcoal-600 hover:border-charcoal-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="processingType"
                        checked={processingType === 'EXPEDITED'}
                        onChange={() => setProcessingType('EXPEDITED')}
                        className="mt-1 text-accent-500"
                      />
                      <div>
                        <div className="font-medium text-clinical-white">Expedited Processing</div>
                        <div className="text-sm text-charcoal-400">1 business day</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-clinical-white">+$25.00</div>
                  </label>

                  {/* RUSH */}
                  <label
                    className={`flex cursor-pointer items-start justify-between rounded-md border p-4 transition-colors ${
                      processingType === 'RUSH'
                        ? "border-accent-500 bg-accent-900/20"
                        : "border-charcoal-600 hover:border-charcoal-500"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="processingType"
                        checked={processingType === 'RUSH'}
                        onChange={() => setProcessingType('RUSH')}
                        className="mt-1 text-accent-500"
                      />
                      <div>
                        <div className="font-medium text-clinical-white">Rush Processing</div>
                        <div className="text-sm text-charcoal-400">Same day (if ordered before 10 AM MST)</div>
                        <div className="text-xs text-charcoal-500 mt-1">
                          Guaranteed same-day processing
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-clinical-white">+$50.00</div>
                  </label>
                </div>
              </section>

            {/* MAHA Shipping Protection */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">MAHA Shipping Protection</h2>

                <label className="flex cursor-pointer items-start gap-4 rounded-md border border-accent-500/30 bg-gradient-to-br from-charcoal-900/80 to-accent-900/10 p-4 hover:border-accent-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={orderInsurance}
                    onChange={(e) => setOrderInsurance(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-charcoal-600 bg-charcoal-900 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-clinical-white">🛡️ MAHA Protection Coverage</span>
                      <span className="font-bold text-accent-400">
                        +${calculateInsurance(cart.subtotal).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-200 mb-3">
                      MAHA Peptides guarantees your research materials arrive safely. If your order is lost,
                      stolen, or damaged during transit, we&apos;ll replace it or provide a full refund—no questions asked.
                    </p>
                    <ul className="text-xs text-charcoal-300 space-y-1 mb-2">
                      <li>✓ Full replacement guarantee for lost packages</li>
                      <li>✓ Temperature-controlled shipping damage coverage</li>
                      <li>✓ Theft and porch piracy protection</li>
                      <li>✓ Fast 24-48 hour claim processing</li>
                      <li>✓ Backed by MAHA Peptides quality commitment</li>
                    </ul>
                    <p className="text-xs text-charcoal-400 mt-2">
                      Protection Cost: 2% of order subtotal (minimum $2.00, maximum $50.00)
                    </p>
                </div>
              </label>
            </section>

            {/* Billing Address */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">Billing Address</h2>

              <label className="mb-4 flex items-center gap-2 text-sm text-charcoal-200">
                <Checkbox checked={sameAsShipping} onCheckedChange={(v) => setSameAsShipping(v === true)} />
                <span>Same as shipping address</span>
              </label>

              {!sameAsShipping && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-charcoal-300">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={billingAddress.line1}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, line1: e.target.value })
                      }
                      className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm text-charcoal-300">
                      Address Line 2 (optional)
                    </label>
                    <input
                      type="text"
                      value={billingAddress.line2}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, line2: e.target.value })
                      }
                      className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-charcoal-300">City</label>
                    <input
                      type="text"
                      required
                      value={billingAddress.city}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, city: e.target.value })
                      }
                      className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-charcoal-300">State</label>
                    <input
                      type="text"
                      required
                      value={billingAddress.state}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, state: e.target.value })
                      }
                      className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-charcoal-300">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={billingAddress.postalCode}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, postalCode: e.target.value })
                      }
                      className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-charcoal-300">Country</label>
                    <input
                      type="text"
                      required
                      value={billingAddress.country}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, country: e.target.value })
                      }
                      className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                    />
                  </div>
                </div>
              )}
            </section>

            <DisclaimerBar variant="checkout" />
          </div>

          {/* Right Column: Order Summary */}
          <aside className="h-fit space-y-4 rounded-lg border border-charcoal-700 bg-charcoal-800 p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-clinical-white">Order Summary</h2>

            {/* Cart Items with Controls */}
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="border-b border-charcoal-700 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <span className="text-sm text-clinical-white font-medium">
                        {item.productName}
                      </span>
                      {item.metadata?.strengthValue && (
                        <span className="text-xs text-charcoal-400 block">
                          {item.metadata.strengthValue}{item.metadata.strengthUnit}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-clinical-white">
                      ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItem === item.id}
                        className="p-1 rounded bg-charcoal-700 hover:bg-charcoal-600 disabled:opacity-50 transition-colors"
                      >
                        <Minus className="h-3 w-3 text-charcoal-300" />
                      </button>
                      <span className="text-sm text-charcoal-300 w-8 text-center">
                        {updatingItem === item.id ? "..." : item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItem === item.id}
                        className="p-1 rounded bg-charcoal-700 hover:bg-charcoal-600 disabled:opacity-50 transition-colors"
                      >
                        <Plus className="h-3 w-3 text-charcoal-300" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={updatingItem === item.id}
                      className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-charcoal-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-charcoal-300">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>Shipping ({selectedShippingTier.name})</span>
                <span>${selectedShippingTier.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>Processing</span>
                <span>${processingFees[processingType].toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>MAHA Protection</span>
                <span>${calculateInsurance(cart.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between border-t border-charcoal-700 pt-2 text-lg font-bold text-clinical-white">
                <span>Total</span>
                <span>
                  ${(cart.subtotal + selectedShippingTier.price + processingFees[processingType] + calculateInsurance(cart.subtotal)).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Terms Checkbox - Right above checkout button */}
            <label className="flex items-start gap-3 text-sm text-charcoal-200 cursor-pointer">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <span>
                I confirm I am 18+ and agree to the{" "}
                <a href="/terms" target="_blank" className="text-accent-400 hover:text-accent-300 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/research-policy" target="_blank" className="text-accent-400 hover:text-accent-300 underline">
                  Research Use Policy
                </a>
              </span>
            </label>

            <Button
              type="submit"
              className="w-full"
              disabled={!canCheckout || submitting}
            >
              {submitting ? "Processing..." : "Complete Checkout"}
            </Button>
          </aside>
        </div>
      </form>
    </div>
  );
}
