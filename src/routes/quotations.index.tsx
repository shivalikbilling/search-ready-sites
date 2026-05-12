import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useOrders, OrderBase } from "@/lib/store";
import { Search, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/quotations/")({
  head: () => ({
    meta: [
      { title: "Quotations — Inkline" },
      { name: "description", content: "Track every quotation request and view the shop's response like a support ticket." },
    ],
  }),
  component: QuotationsList,
});

const badge: Record<NonNullable<OrderBase["quoteStatus"]>, string> = {
  Awaiting: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  Quoted: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  Accepted: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  Declined: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
};

function QuotationsList() {
  const all = useOrders();
  const quotes = all.filter((o) => o.kind === "quotation");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return quotes.filter((r) => {
      if (status !== "All" && (r.quoteStatus ?? "Awaiting") !== status) return false;
      if (!s) return true;
      return r.jobName.toLowerCase().includes(s) || String(r.id).includes(s) || r.jobType.toLowerCase().includes(s);
    });
  }, [quotes, q, status]);

  return (
    <PageShell title="Quotation Tickets" lead="Every quotation request becomes a ticket. Open one to see the response and reply.">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ticket #, job name, type…"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-ring/30 transition focus:border-ring focus:ring-2"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All</option>
            <option>Awaiting</option>
            <option>Quoted</option>
            <option>Accepted</option>
            <option>Declined</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Quoted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = r.quoteStatus ?? "Awaiting";
                return (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono">#Q-{String(r.id).padStart(4, "0")}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3"><span className="font-medium">{r.jobName}</span><span className="block text-xs text-muted-foreground">{r.jobType}</span></td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.qty.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.quote ? r.quote.totalPrice.toLocaleString() : "—"}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge[st]}`}>{st}</span></td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/quotations/$quoteId" params={{ quoteId: String(r.id) }} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                        <MessageSquare className="h-3.5 w-3.5" /> Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No quotation tickets yet. <Link to="/quotation" className="text-primary hover:underline">Request one →</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
