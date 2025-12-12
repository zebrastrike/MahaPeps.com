import { ArrowRight, CalendarClock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderSummary } from "@/lib/orders";

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

function getStatusVariant(status: OrderSummary["status"]) {
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

export function OrderCard({ order }: { order: OrderSummary }) {
  const status = getStatusVariant(order.status);

  return (
    <Card className="h-full border-muted">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">{order.orderNumber}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" aria-hidden />
            <span>Created {formatDate(order.createdAt)}</span>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4 pt-0">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Total: <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
          </p>
          {order.nextMilestone ? <p>Next: {order.nextMilestone}</p> : null}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/dashboard/orders/${order.id}`} className="inline-flex items-center gap-2">
            View
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
