"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DisclaimerBar } from "@/components/layout/disclaimer-bar";

interface PaymentLinkData {
  paymentLink: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    expiresAt: string;
  };
  order: {
    id: string;
    status: string;
    accountType: string;
    items: Array<{
      productName: string;
      quantity: number;
      lineTotal: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<"ZELLE" | "CASHAPP" | "WIRE_TRANSFER">("ZELLE");
  const [transactionReference, setTransactionReference] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchPaymentLink();
  }, [token]);

  const fetchPaymentLink = async () => {
    try {
      const response = await fetch(`/api/checkout/payment/${token}`);

      if (response.ok) {
        const linkData = await response.json();
        setData(linkData);
      } else if (response.status === 404) {
        setError("Payment link not found");
      } else {
        setError("Failed to load payment information");
      }
    } catch (err) {
      console.error("Failed to fetch payment link:", err);
      setError("Failed to load payment information");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofFile) {
      alert("Please select a payment proof file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("proofFile", proofFile);
      formData.append("method", paymentMethod);
      if (transactionReference) {
        formData.append("transactionReference", transactionReference);
      }

      const response = await fetch(`/api/payments/${token}/proof`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to upload payment proof");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload payment proof. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-clinical-white">Loading payment information...</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <div className="text-red-900">{error}</div>
        </div>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-12 text-center">
          <div className="text-6xl">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-emerald-900">
            Payment Proof Submitted!
          </h1>
          <p className="mt-4 text-emerald-800">
            Your payment proof has been successfully uploaded. Our team will review and verify your
            payment within 24-48 hours.
          </p>
          <p className="mt-4 text-emerald-800">
            <strong>Order ID:</strong> {data?.order.id}
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            You'll receive a confirmation email once your payment is verified and your order is
            being prepared for shipment.
          </p>
        </div>
        <div className="mt-8">
          <DisclaimerBar variant="footer" />
        </div>
      </div>
    );
  }

  const isExpired = data && new Date(data.paymentLink.expiresAt) < new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-clinical-white">Payment</h1>
      <p className="mb-8 text-charcoal-300">Order #{data?.order.id}</p>

      {isExpired && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-4">
          <p className="font-bold text-red-900">⚠️ Payment Link Expired</p>
          <p className="mt-1 text-red-800">
            This payment link has expired. Please contact support for assistance.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Payment Instructions */}
        <div className="space-y-6">
          <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
            <h2 className="mb-4 text-xl font-bold text-clinical-white">
              Payment Instructions
            </h2>

            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">
                Total Amount Due: ${data?.order.total.toFixed(2)} USD
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Payment must be completed within 72 hours
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-md border border-teal-700 bg-teal-900/20 p-4">
                <h3 className="font-bold text-teal-400">Option 1: Zelle (Recommended)</h3>
                <div className="mt-2 space-y-1 text-sm text-charcoal-200">
                  <p>
                    <strong>Zelle Email:</strong>{" "}
                    <code className="rounded bg-charcoal-700 px-2 py-1">
                      payments@mahapeps.com
                    </code>
                  </p>
                  <p>
                    <strong>Amount:</strong> ${data?.order.total.toFixed(2)} USD
                  </p>
                  <p>
                    <strong>Payment Note:</strong> Order #{data?.order.id}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-teal-700 bg-teal-900/20 p-4">
                <h3 className="font-bold text-teal-400">Option 2: CashApp</h3>
                <div className="mt-2 space-y-1 text-sm text-charcoal-200">
                  <p>
                    <strong>CashApp Tag:</strong>{" "}
                    <code className="rounded bg-charcoal-700 px-2 py-1">$MahaPeps</code>
                  </p>
                  <p>
                    <strong>Amount:</strong> ${data?.order.total.toFixed(2)} USD
                  </p>
                  <p>
                    <strong>Payment Note:</strong> Order #{data?.order.id}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-teal-700 bg-teal-900/20 p-4">
                <h3 className="font-bold text-teal-400">Option 3: Wire Transfer</h3>
                <p className="mt-2 text-sm text-charcoal-200">
                  Contact support@mahapeps.com for wire transfer instructions
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-semibold">After completing payment:</p>
              <ol className="ml-4 mt-2 list-decimal space-y-1">
                <li>Take a screenshot of your payment confirmation</li>
                <li>Upload it using the form below</li>
                <li>We'll verify and process your order within 24-48 hours</li>
                <li>You'll receive a shipping confirmation with tracking</li>
              </ol>
            </div>
          </section>

          {/* Upload Form */}
          <section className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
            <h2 className="mb-4 text-xl font-bold text-clinical-white">
              Upload Payment Proof
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal-200">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "ZELLE" | "CASHAPP" | "WIRE_TRANSFER")
                  }
                  className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  disabled={isExpired ?? false}
                >
                  <option value="ZELLE">Zelle</option>
                  <option value="CASHAPP">CashApp</option>
                  <option value="WIRE_TRANSFER">Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal-200">
                  Transaction Reference (optional)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g., Confirmation number, last 4 digits"
                  className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white"
                  disabled={isExpired ?? false}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-charcoal-200">
                  Payment Proof (Screenshot/Receipt)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full rounded-md border border-charcoal-600 bg-charcoal-900 px-3 py-2 text-clinical-white file:mr-4 file:rounded file:border-0 file:bg-teal-600 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-teal-700"
                  disabled={isExpired ?? false}
                  required
                />
                <p className="mt-1 text-xs text-charcoal-400">
                  Accepted formats: JPG, PNG, PDF. Max size: 10MB
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={uploading || isExpired || !proofFile}
              >
                {uploading ? "Uploading..." : "Submit Payment Proof"}
              </Button>
            </form>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <aside className="h-fit space-y-4 rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
          <h2 className="text-xl font-bold text-clinical-white">Order Summary</h2>

          <div className="space-y-2 text-sm">
            {data?.order.items.map((item, index) => (
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
              <span>${data?.order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Shipping</span>
              <span>${data?.order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Tax</span>
              <span>${data?.order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-charcoal-700 pt-2 text-lg font-bold text-clinical-white">
              <span>Total</span>
              <span>${data?.order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold">⏰ Payment Deadline</p>
            <p className="mt-1">
              {data && new Date(data.paymentLink.expiresAt).toLocaleString()}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <DisclaimerBar variant="footer" />
      </div>
    </div>
  );
}
