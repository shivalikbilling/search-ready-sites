import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import {
  addDispatchItem,
  removeDispatchItem,
  updateDispatchItem,
  useDispatchItems,
  type DispatchItem,
} from "@/lib/dispatch";
import { useOrders } from "@/lib/store";
import { BookPlus, Boxes, CheckCircle2, Clock, Package, Pencil, Plus, Trash2, Truck, X } from "lucide-react";

export const Route = createFileRoute("/dispatch")({
  head: () => ({ meta: [{ title: "Dispatch Queue — Shivalik" }] }),
  component: DispatchPage,
});

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/30 transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2";

type Draft = {
  buyer: string;
  jobName: string;
  description: string;
  pages: string;
  qty: string;
  rate: string;
  remark: string;
};

const emptyDraft: Draft = {
  buyer: "",
  jobName: "",
  description: "",
  pages: "",
  qty: "",
  rate: "",
  remark: "",
};

function DispatchPage() {
  const items = useDispatchItems();
  const orders = useOrders().filter((o) => o.kind === "order");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "queued" | "dispatched">("queued");

  const queued = items.filter((i) => i.status === "queued");
  const dispatched = items.filter((i) => i.status === "dispatched");

  const visible = useMemo(() => {
    if (filter === "queued") return queued;
    if (filter === "dispatched") return dispatched;
    return items;
  }, [filter, items, queued, dispatched]);

  const totals = useMemo(
    () => ({
      qty: queued.reduce((s, i) => s + (Number(i.qty) || 0), 0),
      amt: queued.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0),
      buyers: new Set(queued.map((i) => (i.buyer || "").trim().toLowerCase()).filter(Boolean)).size,
    }),
    [queued]
  );

  function set<K extends keyof Draft>(k: K, v: string) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function pickOrder(id: string) {
    const o = orders.find((x) => String(x.id) === id);
    if (!o) return;
    const desc = [o.jobType, o.size, o.gsm && `${o.gsm}gsm`, o.paperQuality, o.binding && `${o.binding} bind`]
      .filter(Boolean)
      .join(" · ");
    setDraft((d) => ({
      ...d,
      jobName: o.jobName,
      description: desc,
      pages: o.inner?.pages ? String(o.inner.pages) : "",
      qty: String(Math.max(o.qty - o.receivedQty, 0) || o.qty),
    }));
  }

  function save() {
    if (!draft.jobName.trim() || !Number(draft.qty)) return;
    const payload = {
      buyer: draft.buyer.trim() || undefined,
      jobName: draft.jobName.trim(),
      description: draft.description.trim() || undefined,
      pages: draft.pages ? Number(draft.pages) : undefined,
      qty: Number(draft.qty),
      rate: Number(draft.rate) || 0,
      remark: draft.remark.trim() || undefined,
    };
    if (editingId) {
      updateDispatchItem(editingId, payload);
      setEditingId(null);
    } else {
      addDispatchItem(payload);
    }
    setDraft(emptyDraft);
  }

  function edit(item: DispatchItem) {
    setEditingId(item.id);
    setDraft({
      buyer: item.buyer ?? "",
      jobName: item.jobName,
      description: item.description ?? "",
      pages: item.pages ? String(item.pages) : "",
      qty: String(item.qty),
      rate: String(item.rate),
      remark: item.remark ?? "",
    });
    setFilter(item.status === "dispatched" ? "dispatched" : "queued");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  return (
    <PageShell
      title="Dispatch Queue"
      lead="Record every book that's ready to go out. When you create a challan, pick the books to bundle into one delivery."
    >
      {/* Stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard icon={<Clock className="h-4 w-4" />} label="Queued books" value={String(queued.length)} accent="bg-accent" />
        <StatCard icon={<Boxes className="h-4 w-4" />} label="Units waiting" value={totals.qty.toLocaleString()} accent="bg-primary" />
        <StatCard icon={<Package className="h-4 w-4" />} label="Buyers" value={String(totals.buyers)} accent="bg-emerald-500" />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Already dispatched"
          value={String(dispatched.length)}
          accent="bg-muted-foreground"
        />
      </div>

      {/* Add / edit form */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              <BookPlus className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">
                {editingId ? "Edit book entry" : "Record a book"}
              </h3>
              <p className="text-xs text-muted-foreground">Add one ready-to-dispatch book. Repeat for each title.</p>
            </div>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5" /> Cancel edit
            </button>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-12">
          <Field label="Buyer" className="lg:col-span-3">
            <input
              className={inputCls}
              value={draft.buyer}
              onChange={(e) => set("buyer", e.target.value)}
              placeholder="Acme Industries"
              list="dispatch-buyers"
            />
            <datalist id="dispatch-buyers">
              {Array.from(new Set(items.map((i) => i.buyer).filter(Boolean))).map((b) => (
                <option key={b} value={b as string} />
              ))}
            </datalist>
          </Field>
          <Field label="Pull from order" className="lg:col-span-3">
            <select className={inputCls} value="" onChange={(e) => pickOrder(e.target.value)}>
              <option value="">— Manual entry —</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  #{o.id} · {o.jobName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Book / Job name" required className="lg:col-span-6">
            <input
              className={inputCls}
              value={draft.jobName}
              onChange={(e) => set("jobName", e.target.value)}
              placeholder="e.g. English Reader – Class 8"
            />
          </Field>

          <Field label="Description" className="lg:col-span-6">
            <input
              className={inputCls}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Size · GSM · Paper · Binding"
            />
          </Field>
          <Field label="Pages" className="lg:col-span-2">
            <input
              type="number"
              className={inputCls}
              value={draft.pages}
              onChange={(e) => set("pages", e.target.value)}
            />
          </Field>
          <Field label="Quantity" required className="lg:col-span-2">
            <input
              type="number"
              className={inputCls + " tabular-nums"}
              value={draft.qty}
              onChange={(e) => set("qty", e.target.value)}
            />
          </Field>
          <Field label="Rate" className="lg:col-span-2">
            <input
              type="number"
              step="0.01"
              className={inputCls + " tabular-nums"}
              value={draft.rate}
              onChange={(e) => set("rate", e.target.value)}
            />
          </Field>

          <Field label="Remark for this book" className="lg:col-span-12">
            <input
              className={inputCls}
              value={draft.remark}
              onChange={(e) => set("remark", e.target.value)}
              placeholder="e.g. Pack in cartons of 50"
            />
          </Field>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!draft.jobName.trim() || !Number(draft.qty)}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> {editingId ? "Update book" : "Add to queue"}
          </button>
        </div>
      </div>

      {/* Filter + action */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-xs font-medium">
          {(["queued", "dispatched", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 capitalize transition ${
                filter === f ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f} ({f === "queued" ? queued.length : f === "dispatched" ? dispatched.length : items.length})
            </button>
          ))}
        </div>
        <Link
          to="/challans/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:brightness-105"
        >
          <Truck className="h-4 w-4" /> Create challan from queue
        </Link>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Remark</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.id} className="border-t border-border/60 hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    {i.status === "queued" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                        <Clock className="h-3 w-3" /> Queued
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> {i.challanNumber || "Dispatched"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.buyer || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.jobName}</div>
                    {i.description && <div className="text-xs text-muted-foreground">{i.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{i.qty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{i.rate ? `₹ ${i.rate}` : "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {i.rate ? `₹ ${(i.qty * i.rate).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{i.remark || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => edit(i)}
                        title="Edit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeDispatchItem(i.id)}
                        title="Remove"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <Boxes className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-muted-foreground">Nothing here yet — record a book above.</p>
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

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={`grid h-6 w-6 place-items-center rounded ${accent} text-white`}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {required && <span className="text-destructive">* </span>}
        {label}
      </span>
      {children}
    </label>
  );
}
