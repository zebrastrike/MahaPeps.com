import { RoleShell } from "@/components/layout/role-shell";
import { OrderCard } from "@/components/dashboard/order-card";
import { fetchOrders } from "@/lib/orders";

export default async function OrdersPage() {
  const orders = await fetchOrders();

  return (
    <RoleShell title="Orders" description="Order statuses, documentation, and shipment details.">
      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </RoleShell>
  );
}
