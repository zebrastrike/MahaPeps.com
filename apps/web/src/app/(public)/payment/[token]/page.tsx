"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DisclaimerBar } from "@/components/layout/disclaimer-bar";
import { CheckCircle, Mail, Package, Clock } from "lucide-react";

interface OrderData {
  paymentLink: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    expiresAt: string;
  };
  order: {
    id: string;
    orderNumber: string;
    status: string;
    firstName: string;
    lastName: string;
    email: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    createdAt: string;
  };
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [token]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/checkout/payment/${token}`);

      if (response.ok) {
        const orderData = await response.json();
        setData(orderData);
      } else if (response.status === 404) {
        setError("Order not found");
      } else {
        setError("Failed to load order information");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-clinical-white">Loading order information...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-8 text-center">
          <div className="text-red-400">{error || "Order not found"}</div>
          <Button asChild className="mt-4">
            <a href="/products">Continue Shopping</a>
          </Button>
        </div>
      </div>
    );
  }

  const order = data.order;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-clinical-white">
          Thank You for Your Order!
        </h1>
        <p className="mt-2 text-lg text-charcoal-300">
          Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      {/* Email Notification Banner */}
      <div className="mb-8 rounded-lg border border-accent-500/30 bg-gradient-to-r from-accent-900/30 to-teal-900/20 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-500/20">
            <Mail className="h-6 w-6 text-accent-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-clinical-white">
              Payment Instructions Sent
            </h2>
            <p className="mt-1 text-charcoal-300">
              We've sent detailed payment instructions to <strong className="text-clinical-white">{order.email}</strong>.
              Please check your inbox (and spam folder) for next steps.
            </p>
            <p className="mt-2 text-sm text-charcoal-400">
              Payment options include Zelle, CashApp, and Wire Transfer.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order Invoice */}
        <div className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
          <h2 className="mb-4 text-xl font-bold text-clinical-white flex items-center gap-2">
            <Package className="h-5 w-5 text-accent-400" />
            Order Invoice
          </h2>

          {/* Items */}
          <div className="space-y-3 border-b border-charcoal-700 pb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <span className="text-clinical-white">{item.productName}</span>
                  <span className="ml-2 text-sm text-charcoal-400">
                    × {item.quantity}
                  </span>
                </div>
                <span className="text-clinical-white">${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-charcoal-300">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-charcoal-700 pt-3 text-lg font-bold text-clinical-white">
              <span>Total Due</span>
              <span className="text-accent-400">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Info */}
          <div className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
            <h2 className="mb-4 text-xl font-bold text-clinical-white">
              Order Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-400">Order Number</span>
                <span className="font-mono text-clinical-white">
                  {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-400">Order Date</span>
                <span className="text-clinical-white">{orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-400">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  <Clock className="h-3 w-3" />
                  Awaiting Payment
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-400">Customer</span>
                <span className="text-clinical-white">
                  {order.firstName} {order.lastName}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="rounded-lg border border-charcoal-700 bg-charcoal-800 p-6">
              <h2 className="mb-4 text-xl font-bold text-clinical-white">
                Shipping Address
              </h2>
              <address className="text-sm not-italic text-charcoal-300">
                {order.firstName} {order.lastName}<br />
                {order.shippingAddress.line1}<br />
                {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </address>
            </div>
          )}

          {/* What's Next */}
          <div className="rounded-lg border border-teal-500/30 bg-teal-900/20 p-6">
            <h3 className="font-semibold text-clinical-white mb-3">What's Next?</h3>
            <ol className="space-y-2 text-sm text-charcoal-300">
              <li className="flex gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">1</span>
                <span>Check your email for payment instructions</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">2</span>
                <span>Complete payment via Zelle, CashApp, or Wire Transfer</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">3</span>
                <span>We'll verify and process your order within 24-48 hours</span>
              </li>
              <li className="flex gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-bold text-teal-400">4</span>
                <span>Receive shipping confirmation with tracking number</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <a href="/products">Continue Shopping</a>
        </Button>
        <Button asChild>
          <a href="/dashboard/orders">View My Orders</a>
        </Button>
      </div>

      <div className="mt-12">
        <DisclaimerBar variant="footer" />
      </div>
    </div>
  );
}
