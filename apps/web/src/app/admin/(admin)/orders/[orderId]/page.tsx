"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrderDetail {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  createdAt: string;
  user: {
    email: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product: {
      name: string;
      sku: string;
    };
  }>;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  complianceAcknowledgment?: {
    researchPurposeOnly: boolean;
    responsibilityAccepted: boolean;
    noMedicalAdvice: boolean;
    ageConfirmation: boolean;
    termsAccepted: boolean;
    ipAddress: string;
    createdAt: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method?: string;
    transactionReference?: string;
    verifiedAt?: string;
  }>;
  shipments: Array<{
    id: string;
    trackingNumber: string;
    carrier: string;
    service: string;
    labelUrl?: string;
    shippedAt: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment verification form state
  const [paymentMethod, setPaymentMethod] = useState<string>("ZELLE");
  const [transactionReference, setTransactionReference] = useState<string>("");
  const [paymentProof, setPaymentProof] = useState<string>("");

  // Shipment form state
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [carrier, setCarrier] = useState<string>("USPS");
  const [service, setService] = useState<string>("PRIORITY");

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/admin/payments/orders/${orderId}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: paymentMethod,
          transactionReference,
          notes: paymentProof,
        }),
      });

      if (response.ok) {
        alert("Order marked as paid successfully!");
        fetchOrder(); // Refresh order data
        // Reset form
        setTransactionReference("");
        setPaymentProof("");
      } else {
        alert("Failed to mark order as paid");
      }
    } catch (error) {
      console.error("Error marking order as paid:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

      const response = await fetch(`/api/admin/orders/${orderId}/create-shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          carrier,
          service,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Shipment created! Tracking: ${data.trackingNumber}`);
        fetchOrder(); // Refresh order data
        setShowShipmentForm(false);
      } else {
        const error = await response.json();
        alert(`Failed to create shipment: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-slate-600">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-900">Order Not Found</h2>
        <p className="mt-2 text-sm text-red-700">The order could not be loaded.</p>
        <Link href="/admin/orders" className="mt-4 inline-block">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-slate-100 text-slate-700",
      PENDING_PAYMENT: "bg-amber-100 text-amber-700",
      PAID: "bg-emerald-100 text-emerald-700",
      FULFILLING: "bg-blue-100 text-blue-700",
      SHIPPED: "bg-teal-100 text-teal-700",
      COMPLETED: "bg-green-100 text-green-700",
      CANCELED: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`inline-block rounded-full px-4 py-2 text-sm font-medium ${
          styles[status] || "bg-slate-100 text-slate-700"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="mb-2">
              ← Back to Orders
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
          <p className="mt-1 text-sm text-slate-600">Order ID: {order.id}</p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div>
                    <div className="font-medium text-slate-900">{item.product.name}</div>
                    <div className="text-sm text-slate-600">
                      SKU: {item.product.sku} • Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-slate-900">
                      ${item.lineTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600">
                      ${item.unitPrice.toFixed(2)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax</span>
                <span className="text-slate-900">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="text-slate-900">${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-semibold">
                <span className="text-slate-900">Total</span>
                <span className="text-teal-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Address</h2>
            <address className="not-italic text-slate-700">
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.line2 && (
                <>
                  {order.shippingAddress.line2}
                  <br />
                </>
              )}
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </address>
          </div>

          {/* Compliance Acknowledgment */}
          {order.complianceAcknowledgment && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Compliance Acknowledgment
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      order.complianceAcknowledgment.researchPurposeOnly
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.complianceAcknowledgment.researchPurposeOnly ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-700">Research purposes only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      order.complianceAcknowledgment.responsibilityAccepted
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.complianceAcknowledgment.responsibilityAccepted ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-700">Responsibility accepted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      order.complianceAcknowledgment.noMedicalAdvice
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.complianceAcknowledgment.noMedicalAdvice ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-700">No medical advice</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      order.complianceAcknowledgment.ageConfirmation
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.complianceAcknowledgment.ageConfirmation ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-700">Age 21+ confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs ${
                      order.complianceAcknowledgment.termsAccepted
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.complianceAcknowledgment.termsAccepted ? "✓" : "✗"}
                  </span>
                  <span className="text-slate-700">Terms accepted</span>
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  IP: {order.complianceAcknowledgment.ipAddress} •{" "}
                  {new Date(order.complianceAcknowledgment.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Shipments */}
          {order.shipments.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipments</h2>
              <div className="space-y-3">
                {order.shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">
                          {shipment.carrier} {shipment.service}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Tracking: {shipment.trackingNumber}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Shipped: {new Date(shipment.shippedAt).toLocaleString()}
                        </div>
                      </div>
                      {shipment.labelUrl && (
                        <a
                          href={shipment.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-teal-600 hover:underline"
                        >
                          View Label
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Customer</h2>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-slate-600">Email</div>
                <div className="font-medium text-slate-900">{order.user.email}</div>
              </div>
              {order.user.phone && (
                <div>
                  <div className="text-slate-600">Phone</div>
                  <div className="font-medium text-slate-900">{order.user.phone}</div>
                </div>
              )}
              <div>
                <div className="text-slate-600">Order Date</div>
                <div className="font-medium text-slate-900">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Verification Form */}
          {order.status === "PENDING_PAYMENT" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-amber-900">Mark as Paid</h2>
              <form onSubmit={handleMarkAsPaid} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="ZELLE">Zelle</option>
                    <option value="CASHAPP">CashApp</option>
                    <option value="WIRE_TRANSFER">Wire Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Transaction Reference
                  </label>
                  <input
                    type="text"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="Confirmation number or transaction ID"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Payment Proof URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentProof}
                    onChange={(e) => setPaymentProof(e.target.value)}
                    placeholder="URL to screenshot or receipt"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Processing..." : "Confirm Payment Received"}
                </Button>
              </form>
            </div>
          )}

          {/* Create Shipment */}
          {order.status === "PAID" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-emerald-900">
                Create Shipment
              </h2>

              {!showShipmentForm ? (
                <Button onClick={() => setShowShipmentForm(true)} className="w-full">
                  Generate Shipping Label
                </Button>
              ) : (
                <form onSubmit={handleCreateShipment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Carrier</label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="USPS">USPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Service</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="PRIORITY">Priority (2-3 days)</option>
                      <option value="EXPRESS">Express (Next Day)</option>
                      <option value="GROUND">Ground (5-7 days)</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowShipmentForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? "Creating..." : "Create Label"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Payment History */}
          {order.payments.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment History</h2>
              <div className="space-y-3">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        ${payment.amount.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs ${
                          payment.status === "CAPTURED"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    {payment.method && (
                      <div className="mt-1 text-xs text-slate-600">
                        Method: {payment.method}
                      </div>
                    )}
                    {payment.transactionReference && (
                      <div className="mt-1 text-xs text-slate-600">
                        Ref: {payment.transactionReference}
                      </div>
                    )}
                    {payment.verifiedAt && (
                      <div className="mt-1 text-xs text-slate-500">
                        Verified: {new Date(payment.verifiedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
