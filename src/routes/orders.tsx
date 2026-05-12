import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { OrdersTable } from "@/components/OrdersTable";
import { useOrders } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Inkline" },
      { name: "description", content: "Search and review all your print orders, quantities and dispatch status." },
    ],
  }),
  component: MyOrders,
});

function MyOrders() {
  const all = useOrders();
  const orders = all.filter((o) => o.kind === "order");
  return (
    <PageShell title="My Orders" lead="Search across every order. Click a received quantity to view dispatch challan details.">
      <OrdersTable rows={orders} />
    </PageShell>
  );
}
