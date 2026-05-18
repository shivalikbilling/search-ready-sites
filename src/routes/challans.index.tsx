import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useChallans } from "@/lib/challans";
import { FileText, Plus } from "lucide-react";

export const Route = createFileRoute("/challans/")({
  head: () => ({ meta: [{ title: "Challans — Shivalik" }] }),
  component: ChallansList,
});

function ChallansList() {
  const list = useChallans();
  return (
    <PageShell title="Challans" lead="Every dispatch challan you've created.">
      <div className="mb-6 flex justify-end">
        <Link
          to="/challans/new"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Challan
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Number</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Jobs</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3">Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t border-border/60 hover:bg-secondary/40">
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{c.number}</td>
                  <td className="px-4 py-3 font-medium">{c.buyer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lines.length} job{c.lines.length === 1 ? "" : "s"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.lines.reduce((s, l) => s + (Number(l.qty) || 0), 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">₹ {c.subtotal.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.vehicleNo || "—"}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-muted-foreground">No challans yet.</p>
                    <Link to="/challans/new" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
                      Create your first challan →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
