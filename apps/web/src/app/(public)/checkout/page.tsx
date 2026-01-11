"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DisclaimerBar } from "@/components/layout/disclaimer-bar";

interface CartSummary {
  items: Array<{
    productName: string;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  itemCount: number;
}

interface ShippingRate {
  rateId: string;
  provider: string;
  serviceName: string;
  estimatedDays: string;
  amount: string;
  currency: string;
}

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
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Compliance checkboxes
  const [compliance, setCompliance] = useState({
    researchPurposeOnly: false,
    responsibilityAccepted: false,
    noMedicalAdvice: false,
    ageConfirmation: false,
    termsAccepted: false,
  });

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

  // Shipping rates
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [fetchingRates, setFetchingRates] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setCart({
          items: data.items.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
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

  const handleGetShippingRates = async () => {
    if (
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      alert("Please complete the shipping address first");
      return;
    }

    setFetchingRates(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/shipping-rates", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toAddress: shippingAddress }),
      });

      if (response.ok) {
        const rates = await response.json();
        setShippingRates(rates);
        if (rates.length > 0) {
          setSelectedRate(rates[0]); // Auto-select first rate
        }
      } else {
        setError("Failed to fetch shipping rates");
      }
    } catch (err) {
      console.error("Failed to fetch shipping rates:", err);
      setError("Failed to fetch shipping rates");
    } finally {
      setFetchingRates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!Object.values(compliance).every((v) => v === true)) {
      setError("All compliance checkboxes must be accepted");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!selectedRate) {
      setError("Please select a shipping method");
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
          shippingAddress,
          billingAddress: sameAsShipping ? shippingAddress : billingAddress,
          selectedShippingRate: {
            provider: selectedRate.provider,
            serviceName: selectedRate.serviceName,
            amount: selectedRate.amount,
          },
          compliance,
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

  const allComplianceAccepted = Object.values(compliance).every((v) => v === true);

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
          <h1 className="text-2xl font-bold text-clinical-white">Cart is empty</h1>
          <p className="mt-2 text-charcoal-300">
            Add items to your cart before checking out
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-clinical-white">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Forms */}
          <div className="space-y-8">
            {/* Compliance Checkboxes */}
            <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">
                Compliance Acknowledgment
              </h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 text-sm text-charcoal-200">
                  <Checkbox
                    checked={compliance.researchPurposeOnly}
                    onCheckedChange={(checked) =>
                      setCompliance({ ...compliance, researchPurposeOnly: checked === true })
                    }
                  />
                  <span>
                    I acknowledge that all products are for research purposes only and not for human
                    or veterinary consumption.
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm text-charcoal-200">
                  <Checkbox
                    checked={compliance.responsibilityAccepted}
                    onCheckedChange={(checked) =>
                      setCompliance({ ...compliance, responsibilityAccepted: checked === true })
                    }
                  />
                  <span>
                    I accept full responsibility for proper handling, storage, and disposal of all
                    products in accordance with applicable laws.
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm text-charcoal-200">
                  <Checkbox
                    checked={compliance.noMedicalAdvice}
                    onCheckedChange={(checked) =>
                      setCompliance({ ...compliance, noMedicalAdvice: checked === true })
                    }
                  />
                  <span>
                    I understand that no information on this site constitutes medical or healthcare
                    advice.
                  </span>
                </label>

                <label className="flex items-start gap-3 text-sm text-charcoal-200">
                  <Checkbox
                    checked={compliance.ageConfirmation}
                    onCheckedChange={(checked) =>
                      setCompliance({ ...compliance, ageConfirmation: checked === true })
                    }
                  />
                  <span>I confirm that I am at least 18 years of age.</span>
                </label>

                <label className="flex items-start gap-3 text-sm text-charcoal-200">
                  <Checkbox
                    checked={compliance.termsAccepted}
                    onCheckedChange={(checked) =>
                      setCompliance({ ...compliance, termsAccepted: checked === true })
                    }
                  />
                  <span>
                    I have read and agree to the Terms of Service and Research Use Policy.
                  </span>
                </label>
              </div>

              {!allComplianceAccepted && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  ⚠️ All compliance checkboxes must be accepted to proceed
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

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={handleGetShippingRates}
                  disabled={fetchingRates}
                  variant="outline"
                >
                  {fetchingRates ? "Fetching rates..." : "Get Shipping Rates"}
                </Button>
              </div>
            </section>

            {/* Shipping Rates */}
            {shippingRates.length > 0 && (
              <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
                <h2 className="mb-4 text-xl font-bold text-clinical-white">Shipping Method</h2>
                <div className="space-y-3">
                  {shippingRates.map((rate) => (
                    <label
                      key={rate.rateId}
                      className={`flex cursor-pointer items-center justify-between rounded-md border p-4 transition-colors ${
                        selectedRate?.rateId === rate.rateId
                          ? "border-teal-500 bg-teal-900/20"
                          : "border-charcoal-600 hover:border-charcoal-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingRate"
                          checked={selectedRate?.rateId === rate.rateId}
                          onChange={() => setSelectedRate(rate)}
                          className="text-teal-500"
                        />
                        <div>
                          <div className="font-medium text-clinical-white">
                            {rate.provider} - {rate.serviceName}
                          </div>
                          <div className="text-sm text-charcoal-400">
                            Estimated: {rate.estimatedDays} days
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-clinical-white">
                        ${parseFloat(rate.amount).toFixed(2)}
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            )}

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
                  {/* Add similar fields for billing address */}
                </div>
              )}
            </section>

            <DisclaimerBar variant="checkout" />
          </div>

          {/* Right Column: Order Summary */}
          <aside className="h-fit space-y-4 rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
            <h2 className="text-xl font-bold text-clinical-white">Order Summary</h2>

            <div className="space-y-2 text-sm">
              {cart.items.map((item, index) => (
                <div key={index} className="flex justify-between text-charcoal-300">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>${item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-charcoal-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-charcoal-300">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>Shipping</span>
                <span>
                  {selectedRate ? `$${parseFloat(selectedRate.amount).toFixed(2)}` : "TBD"}
                </span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between border-t border-charcoal-700 pt-2 text-lg font-bold text-clinical-white">
                <span>Total</span>
                <span>
                  ${selectedRate
                    ? (cart.subtotal + parseFloat(selectedRate.amount)).toFixed(2)
                    : cart.subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!allComplianceAccepted || !selectedRate || submitting}
            >
              {submitting ? "Processing..." : "Complete Checkout"}
            </Button>

            {(!allComplianceAccepted || !selectedRate) && (
              <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                {!allComplianceAccepted && <p>✓ Accept all compliance terms</p>}
                {!selectedRate && <p>✓ Select a shipping method</p>}
              </div>
            )}
          </aside>
        </div>
      </form>
    </div>
  );
}
