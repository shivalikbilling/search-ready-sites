import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { OrdersTable } from "@/components/OrdersTable";
import { useOrders } from "@/lib/store";

export const Route = createFileRoute("/pendings")({
  head: () => ({
    meta: [
      { title: "Pending Orders — Inkline" },
      { name: "description", content: "Auto-filtered view of incomplete orders — pending or partially dispatched." },
    ],
  }),
  component: Pendings,
});

function Pendings() {
  const orders = useOrders().filter((o) => o.kind === "order" && o.status !== "Dispatched");
  return (
    <PageShell title="View Pendings" lead="Filtered to incomplete orders — anything not yet fully dispatched shows up here.">
      <OrdersTable rows={orders} emptyMsg="All caught up — no pending orders." />
    </PageShell>
  );
}
