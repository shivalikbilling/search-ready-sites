import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useOrders } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [{ title: "Order Details — Inkline" }],
  }),
  component: OrderDetail,
});

function Row({ k, v }: { k: string; v?: React.ReactNode }) {
  if (v === undefined || v === null || v === "") return null;
  return (
    <div className="flex justify-between gap-6 border-b border-border/60 py-2.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

function OrderDetail() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const order = useOrders().find((o) => String(o.id) === orderId);

  if (!order) {
    return (
      <PageShell title="Order not found">
        <Link to="/orders" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </PageShell>
    );
  }

  const pending = Math.max(order.qty - order.receivedQty, 0);

  return (
    <PageShell title={`Order #${order.id} — ${order.jobName}`} lead={`${order.jobType} · placed ${order.date}`}>
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order Qty</p>
          <p className="mt-2 font-display text-3xl font-bold">{order.qty.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dispatched Qty</p>
          <p className="mt-2 font-display text-3xl font-bold">{order.receivedQty.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Qty</p>
          <p className="mt-2 font-display text-3xl font-bold">{pending.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-semibold">Job Details</h2>
          <Row k="Job Type" v={order.jobType} />
          <Row k="Size" v={order.size} />
          <Row k="GSM" v={order.gsm} />
          <Row k="Paper Quality" v={order.paperQuality} />
          <Row k="Print Type" v={order.printType} />
          <Row k="Binding" v={order.binding} />
          <Row k="Status" v={order.status} />
        </section>

        {(order.inner || order.cover) && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-lg font-semibold">Book Specs</h2>
            {order.inner && (
              <>
                <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">Inner</p>
                <Row k="Color" v={order.inner.color} />
                <Row k="Pages" v={order.inner.pages} />
                <Row k="GSM" v={order.inner.gsm} />
                <Row k="Size" v={order.inner.size} />
              </>
            )}
            {order.cover && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase text-muted-foreground">Cover</p>
                <Row k="Color" v={order.cover.color} />
                <Row k="GSM" v={order.cover.gsm} />
                <Row k="Lamination" v={order.cover.lamination} />
              </>
            )}
          </section>
        )}
      </div>

      <section className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold">Dispatch Challan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Challan #</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2">Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {order.receivedQty > 0 ? (
                <tr className="border-t border-border/60">
                  <td className="px-3 py-2">{order.date}</td>
                  <td className="px-3 py-2 font-mono">CH-{order.id.toString().padStart(4, "0")}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{order.receivedQty.toLocaleString()}</td>
                  <td className="px-3 py-2 text-muted-foreground">In-house delivery</td>
                </tr>
              ) : (
                <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No dispatches yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
