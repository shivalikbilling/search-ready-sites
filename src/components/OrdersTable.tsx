import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { OrderBase } from "@/lib/store";
import { Search } from "lucide-react";

const statusStyle: Record<OrderBase["status"], string> = {
  Pending: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  Partial: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  Dispatched: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
};

export function OrdersTable({ rows, emptyMsg = "No records yet." }: { rows: OrderBase[]; emptyMsg?: string }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type !== "All" && r.jobType !== type) return false;
      if (!s) return true;
      return (
        r.jobName.toLowerCase().includes(s) ||
        String(r.id).includes(s) ||
        r.jobType.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s)
      );
    });
  }, [rows, q, type]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by job name, ID, type, status…"
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-ring/30 transition focus:border-ring focus:ring-2"
          />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option>All</option>
          <option>Leaflet/Pamphlet</option>
          <option>Brochure</option>
          <option>Poster</option>
          <option>Books</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Job Type</th>
              <th className="px-4 py-3">Job Name</th>
              <th className="px-4 py-3 text-right">Order Qty</th>
              <th className="px-4 py-3 text-right">Received Qty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/40">
                <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                <td className="px-4 py-3 font-medium">#{r.id}</td>
                <td className="px-4 py-3">{r.jobType}</td>
                <td className="px-4 py-3 font-medium">{r.jobName}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.qty.toLocaleString()}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <Link to="/orders/$orderId" params={{ orderId: String(r.id) }} className="text-primary underline-offset-2 hover:underline">
                    {r.receivedQty.toLocaleString()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to="/orders/$orderId" params={{ orderId: String(r.id) }} className="text-sm font-medium text-primary hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">{emptyMsg}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
