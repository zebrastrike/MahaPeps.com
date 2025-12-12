import { ArrowRight, Package2, Truck } from "lucide-react";
import Link from "next/link";

import { RoleShell } from "@/components/layout/role-shell";
import { OrderCard } from "@/components/dashboard/order-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchDashboardOverview } from "@/lib/orders";

export default async function ClientDashboardPage() {
  const overview = await fetchDashboardOverview();

  return (
    <RoleShell title="Client dashboard" description="Track research orders, shipments, and account preferences.">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-muted/40">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" aria-hidden /> Next shipment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Order {overview.nextShipment.orderId} via {overview.nextShipment.carrier}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-foreground">ETA: {overview.nextShipment.eta}</p>
              <p>Status: {overview.nextShipment.status}</p>
              <ul className="list-disc space-y-1 pl-5">
                {overview.nextShipment.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-muted/20">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package2 className="h-4 w-4" aria-hidden /> Orders
              </CardTitle>
              <p className="text-sm text-muted-foreground">Recent submissions and statuses.</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-foreground">{overview.recentOrders.length} active records</p>
              <p>Access invoices and proof of delivery.</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/orders" className="inline-flex items-center gap-2">
                  Go to orders
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-muted/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Quick links</CardTitle>
              <p className="text-sm text-muted-foreground">Shortcuts across the portal.</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {overview.quickLinks.map((link) => (
                <div key={link.href} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{link.label}</p>
                    <p>{link.description}</p>
                  </div>
                  <Button asChild variant="ghost" size="icon">
                    <Link href={link.href} aria-label={`Navigate to ${link.label}`}>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent orders</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/orders" className="inline-flex items-center gap-2">
                View all
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {overview.recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
