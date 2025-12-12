import { ArrowLeft, BadgeCheck, MapPin, PackageSearch } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CoaDownloadButton } from "@/components/dashboard/coa-download-button";
import { RoleShell } from "@/components/layout/role-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchOrderDetail, OrderStatus } from "@/lib/orders";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "delivered":
      return { label: "Delivered", variant: "success" as const };
    case "shipped":
      return { label: "In transit", variant: "warning" as const };
    case "packed":
      return { label: "Packed", variant: "default" as const };
    default:
      return { label: "Processing", variant: "neutral" as const };
  }
}

export default async function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const order = await fetchOrderDetail(params.orderId);

  if (!order) {
    return notFound();
  }

  const status = getStatusBadge(order.status);

  return (
    <RoleShell
      title={`Order ${order.orderNumber}`}
      description="Itemized summary, batch references, and document downloads."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/orders" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to orders
            </Link>
          </Button>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Order details</CardTitle>
              <p className="text-sm text-muted-foreground">Created {formatDate(order.createdAt)}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-foreground">Total {formatCurrency(order.total)}</p>
              <p>Contact: {order.contactEmail}</p>
              {order.nextMilestone ? <p>Next: {order.nextMilestone}</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageSearch className="h-4 w-4" aria-hidden /> Shipment
              </CardTitle>
              <p className="text-sm text-muted-foreground">Tracking and arrival timing.</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {order.shipmentEta ? <p className="text-foreground">ETA: {order.shipmentEta}</p> : null}
              <p>Tracking: {order.trackingNumber ?? "Pending"}</p>
              <p>Carrier status: {order.nextMilestone ?? "Preparing"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" aria-hidden /> Delivery
              </CardTitle>
              <p className="text-sm text-muted-foreground">Destination and handling notes.</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-foreground">{order.deliveryAddress}</p>
              <p>Order ID: {order.id}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div
                key={`${item.sku}-${item.batchId}`}
                className="flex flex-col gap-2 rounded-lg border bg-background p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p>SKU: {item.sku}</p>
                  <p>
                    Qty {item.quantity} · Batch {item.batchId} · {formatCurrency(item.unitPrice)} each
                  </p>
                </div>
                <CoaDownloadButton href={item.coaUrl} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="h-4 w-4" aria-hidden /> Batch references
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {order.batches.map((batch) => (
              <div key={batch.id} className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{batch.id}</p>
                  <Badge variant={batch.status === "delivered" ? "success" : batch.status === "in-transit" ? "warning" : "default"}>
                    {batch.status}
                  </Badge>
                </div>
                <p className="mt-1">Lot: {batch.lotNumber}</p>
                <p>Packaging: {batch.packaging}</p>
                <p>Storage: {batch.storage}</p>
                <p className="text-foreground">{batch.notes}</p>
                <div className="mt-3">
                  <CoaDownloadButton href={batch.coaUrl} label="COA" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RoleShell>
  );
}
