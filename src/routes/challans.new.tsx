import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { useOrders } from "@/lib/store";
import {
  addChallan,
  DEFAULT_TOC,
  nextChallanNumber,
  newLine,
  type ChallanLine,
  type Party,
} from "@/lib/challans";
import { markDispatched, useDispatchItems, type DispatchItem } from "@/lib/dispatch";
import { ArrowLeft, BookPlus, Check, Copy, FileText, Inbox, Plus, Sparkles, Trash2, Truck } from "lucide-react";

export const Route = createFileRoute("/challans/new")({
  head: () => ({ meta: [{ title: "Create Challan — Shivalik" }] }),
  component: NewChallan,
});

const emptyParty = (): Party => ({ name: "", gstin: "", address: "", phone: "", email: "" });

function Field({
  label,
  required,
  children,
  hint,
  className = "",
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {required && <span className="text-destructive">* </span>}
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/30 transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2";

function PartyCard({
  title,
  icon,
  value,
  onChange,
  accent,
  rightSlot,
}: {
  title: string;
  icon: React.ReactNode;
  value: Party;
  onChange: (p: Party) => void;
  accent: string;
  rightSlot?: React.ReactNode;
}) {
  const set = (k: keyof Party) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent} text-white`}>{icon}</span>
          <h3 className="font-display text-base font-semibold">{title}</h3>
        </div>
        {rightSlot}
      </div>
      <div className="grid gap-3">
        <Field label="Name / Company" required>
          <input className={inputCls} value={value.name} onChange={set("name")} placeholder="Acme Industries Pvt. Ltd." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="GSTIN">
            <input className={inputCls} value={value.gstin ?? ""} onChange={set("gstin")} placeholder="07ABCDE1234F1Z5" />
          </Field>
          <Field label="Phone">
            <input className={inputCls} value={value.phone ?? ""} onChange={set("phone")} placeholder="+91 …" />
          </Field>
        </div>
        <Field label="Address">
          <textarea
            rows={2}
            className={inputCls + " resize-none"}
            value={value.address ?? ""}
            onChange={set("address")}
            placeholder="Street, City, State, PIN"
          />
        </Field>
      </div>
    </div>
  );
}

function NewChallan() {
  const navigate = useNavigate();
  const orders = useOrders().filter((o) => o.kind === "order");

  const [number] = useState(() => nextChallanNumber());
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState<Party>({
    name: "Shivalik Enterprises",
    gstin: "",
    address: "Your One Stop Printing Solution",
    phone: "",
    email: "",
  });
  const [buyer, setBuyer] = useState<Party>(emptyParty());
  const [shipTo, setShipTo] = useState<Party>(emptyParty());
  const [shipSame, setShipSame] = useState(true);

  const [ewayNo, setEwayNo] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [remark, setRemark] = useState("");
  const [toc, setToc] = useState(DEFAULT_TOC);
  const [lines, setLines] = useState<ChallanLine[]>([newLine()]);
  const [sourceItemIds, setSourceItemIds] = useState<string[]>([]);

  const dispatchItems = useDispatchItems();
  const queuedItems = useMemo(() => dispatchItems.filter((d) => d.status === "queued"), [dispatchItems]);

  function lineFromItem(item: DispatchItem): ChallanLine {
    return {
      id: "l-" + Math.random().toString(36).slice(2, 8),
      jobName: item.jobName,
      description: item.description,
      pages: item.pages,
      qty: item.qty,
      rate: item.rate,
      amount: +(((Number(item.qty) || 0) * (Number(item.rate) || 0)).toFixed(2)),
      remark: item.remark,
    };
  }

  function toggleQueueItem(item: DispatchItem) {
    if (sourceItemIds.includes(item.id)) {
      setSourceItemIds((cur) => cur.filter((x) => x !== item.id));
      setLines((cur) => {
        const filtered = cur.filter((l) => l.jobName !== item.jobName || l.qty !== item.qty);
        return filtered.length ? filtered : [newLine()];
      });
      return;
    }
    setSourceItemIds((cur) => [...cur, item.id]);
    setLines((cur) => {
      const next = cur.filter((l) => l.jobName.trim() || l.qty > 0);
      return [...next, lineFromItem(item)];
    });
    if (item.buyer && !buyer.name) {
      setBuyer((b) => ({ ...b, name: item.buyer! }));
    }
  }

  function selectAllForBuyer(buyerName: string) {
    const matches = queuedItems.filter(
      (i) => (i.buyer || "").trim().toLowerCase() === buyerName.trim().toLowerCase() && !sourceItemIds.includes(i.id)
    );
    if (matches.length === 0) return;
    setSourceItemIds((cur) => [...cur, ...matches.map((m) => m.id)]);
    setLines((cur) => {
      const cleaned = cur.filter((l) => l.jobName.trim() || l.qty > 0);
      return [...cleaned, ...matches.map(lineFromItem)];
    });
    if (buyerName && !buyer.name) setBuyer((b) => ({ ...b, name: buyerName }));
  }

  const subtotal = useMemo(() => lines.reduce((s, l) => s + (Number(l.amount) || 0), 0), [lines]);

  function updateLine(id: string, patch: Partial<ChallanLine>) {
    setLines((cur) =>
      cur.map((l) => {
        if (l.id !== id) return l;
        const merged = { ...l, ...patch };
        if (patch.qty !== undefined || patch.rate !== undefined) {
          merged.amount = +(((Number(merged.qty) || 0) * (Number(merged.rate) || 0)).toFixed(2));
        }
        return merged;
      })
    );
  }

  function pickOrder(lineId: string, orderId: string) {
    if (!orderId) {
      updateLine(lineId, { orderId: undefined });
      return;
    }
    const o = orders.find((x) => String(x.id) === orderId);
    if (!o) return;
    const pages = o.inner?.pages;
    const desc = [o.jobType, o.size, o.gsm && `${o.gsm}gsm`, o.paperQuality, o.binding && `${o.binding} bind`]
      .filter(Boolean)
      .join(" · ");
    updateLine(lineId, {
      orderId: o.id,
      jobName: o.jobName,
      description: desc,
      pages,
      qty: Math.max(o.qty - o.receivedQty, 0) || o.qty,
    });
  }

  function addLine() {
    setLines((cur) => [...cur, newLine()]);
  }
  function dupLine(id: string) {
    setLines((cur) => {
      const i = cur.findIndex((l) => l.id === id);
      if (i < 0) return cur;
      const copy = { ...cur[i], id: "l-" + Math.random().toString(36).slice(2, 8) };
      const next = [...cur];
      next.splice(i + 1, 0, copy);
      return next;
    });
  }
  function delLine(id: string) {
    setLines((cur) => (cur.length === 1 ? cur : cur.filter((l) => l.id !== id)));
  }

  const canSave = buyer.name.trim().length > 0 && lines.some((l) => l.jobName.trim() && l.qty > 0);

  function save() {
    if (!canSave) return;
    const c = addChallan({
      number,
      date,
      title,
      company,
      buyer,
      shipTo: shipSame ? buyer : shipTo,
      ewayNo,
      vehicleNo,
      placeOfSupply,
      remark,
      toc,
      lines: lines.filter((l) => l.jobName.trim()),
      subtotal,
    });
    if (sourceItemIds.length) markDispatched(sourceItemIds, c.id, c.number);
    navigate({ to: "/challans" });
    return c;
  }

  return (
    <PageShell title="Create Challan" lead="Compose a delivery challan with multiple books, buyer & ship-to, and per-job remarks.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/challans" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All challans
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Auto-numbered as <span className="font-mono font-semibold">{number}</span>
        </div>
      </div>

      {/* Meta strip */}
      <div className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-4">
        <Field label="Challan Number" required>
          <input className={inputCls + " font-mono font-semibold"} value={number} readOnly />
        </Field>
        <Field label="Date" required>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Title" hint="Internal label (optional)">
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="May dispatch – Acme" />
        </Field>
        <Field label="Place of Supply">
          <input className={inputCls} value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} placeholder="Delhi" />
        </Field>
      </div>

      {/* Parties */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <PartyCard title="Company" icon={<FileText className="h-4 w-4" />} value={company} onChange={setCompany} accent="bg-primary" />
        <PartyCard title="Buyer" icon={<BookPlus className="h-4 w-4" />} value={buyer} onChange={setBuyer} accent="bg-accent" />
        <PartyCard
          title="Ship To"
          icon={<Truck className="h-4 w-4" />}
          value={shipSame ? buyer : shipTo}
          onChange={setShipTo}
          accent="bg-emerald-500"
          rightSlot={
            <button
              type="button"
              onClick={() => setShipSame((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                shipSame ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-border bg-background text-muted-foreground"
              }`}
            >
              {shipSame && <Check className="h-3 w-3" />} Same as buyer
            </button>
          }
        />
      </div>

      {/* Dispatch queue picker */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 to-transparent shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Inbox className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">Pull from Dispatch Queue</h3>
              <p className="text-xs text-muted-foreground">
                Tick the books going out in this vehicle — they'll be added as lines and marked dispatched on save.
              </p>
            </div>
          </div>
          <Link to="/dispatch" className="text-xs font-semibold text-accent hover:underline">
            Manage queue →
          </Link>
        </div>

        {queuedItems.length === 0 ? (
          <div className="p-8 text-center">
            <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No books in the queue.{" "}
              <Link to="/dispatch" className="font-semibold text-accent hover:underline">
                Record books first
              </Link>
              , then come back to bundle them.
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto">
            {Object.entries(
              queuedItems.reduce<Record<string, DispatchItem[]>>((acc, it) => {
                const k = it.buyer?.trim() || "— No buyer —";
                (acc[k] ||= []).push(it);
                return acc;
              }, {})
            ).map(([buyerName, items]) => (
              <div key={buyerName} className="border-b border-border/40 last:border-0">
                <div className="flex items-center justify-between bg-muted/40 px-5 py-2 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-muted-foreground">{buyerName}</span>
                  <button
                    type="button"
                    onClick={() => selectAllForBuyer(buyerName === "— No buyer —" ? "" : buyerName)}
                    className="font-semibold text-accent hover:underline"
                  >
                    Select all ({items.length})
                  </button>
                </div>
                <ul className="divide-y divide-border/40">
                  {items.map((i) => {
                    const checked = sourceItemIds.includes(i.id);
                    return (
                      <li key={i.id}>
                        <label
                          className={`flex cursor-pointer items-center gap-3 px-5 py-2.5 text-sm transition ${
                            checked ? "bg-accent/10" : "hover:bg-secondary/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleQueueItem(i)}
                            className="h-4 w-4 rounded border-input accent-accent"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{i.jobName}</div>
                            {i.description && (
                              <div className="truncate text-xs text-muted-foreground">{i.description}</div>
                            )}
                          </div>
                          <div className="shrink-0 text-right tabular-nums">
                            <div className="text-sm font-semibold">{i.qty.toLocaleString()}</div>
                            {i.rate > 0 && <div className="text-[11px] text-muted-foreground">₹ {i.rate}/u</div>}
                          </div>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {sourceItemIds.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/60 bg-accent/10 px-5 py-3 text-xs">
            <span className="font-semibold text-accent">
              {sourceItemIds.length} book{sourceItemIds.length === 1 ? "" : "s"} pulled into this challan
            </span>
            <button
              type="button"
              onClick={() => {
                setSourceItemIds([]);
                setLines([newLine()]);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Lines */}
      <div className="mb-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 p-5">
          <div>
            <h3 className="font-display text-base font-semibold">Jobs in this challan</h3>
            <p className="text-xs text-muted-foreground">Add as many books or jobs as you like — each with its own remark.</p>
          </div>
          <button
            type="button"
            onClick={addLine}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add job
          </button>
        </div>

        <div className="divide-y divide-border/60">
          {lines.map((l, i) => (
            <div key={l.id} className="grid gap-3 p-5 lg:grid-cols-12">
              <div className="flex items-start gap-3 lg:col-span-12">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-xs font-bold tabular-nums">
                  {i + 1}
                </span>
                <div className="grid flex-1 gap-3 lg:grid-cols-12">
                  <Field label="Link to Order" className="lg:col-span-3">
                    <select
                      className={inputCls}
                      value={l.orderId ? String(l.orderId) : ""}
                      onChange={(e) => pickOrder(l.id, e.target.value)}
                    >
                      <option value="">— Manual entry —</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          #{o.id} · {o.jobName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Job / Book name" required className="lg:col-span-5">
                    <input
                      className={inputCls}
                      value={l.jobName}
                      onChange={(e) => updateLine(l.id, { jobName: e.target.value })}
                      placeholder="e.g. 7600 English – Class 8"
                    />
                  </Field>
                  <Field label="Pages" className="lg:col-span-2">
                    <input
                      type="number"
                      className={inputCls}
                      value={l.pages ?? ""}
                      onChange={(e) => updateLine(l.id, { pages: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </Field>
                  <Field label="Quantity" required className="lg:col-span-2">
                    <input
                      type="number"
                      className={inputCls + " tabular-nums"}
                      value={l.qty || ""}
                      onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) })}
                    />
                  </Field>

                  <Field label="Description" className="lg:col-span-6">
                    <input
                      className={inputCls}
                      value={l.description ?? ""}
                      onChange={(e) => updateLine(l.id, { description: e.target.value })}
                      placeholder="Size · GSM · Paper · Binding"
                    />
                  </Field>
                  <Field label="Rate" className="lg:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls + " tabular-nums"}
                      value={l.rate || ""}
                      onChange={(e) => updateLine(l.id, { rate: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Amount" className="lg:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      className={inputCls + " tabular-nums font-semibold"}
                      value={l.amount || ""}
                      onChange={(e) => updateLine(l.id, { amount: Number(e.target.value) })}
                    />
                  </Field>
                  <div className="flex items-end gap-2 lg:col-span-2">
                    <button
                      type="button"
                      onClick={() => dupLine(l.id)}
                      title="Duplicate"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-secondary"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => delLine(l.id)}
                      disabled={lines.length === 1}
                      title="Remove"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <Field label="Remark for this job" className="lg:col-span-12">
                    <input
                      className={inputCls}
                      value={l.remark ?? ""}
                      onChange={(e) => updateLine(l.id, { remark: e.target.value })}
                      placeholder="e.g. Pack in cartons of 50, hand to Mr. Singh"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/60 bg-muted/30 p-5">
          <span className="text-sm text-muted-foreground">
            {lines.length} job{lines.length === 1 ? "" : "s"} ·{" "}
            {lines.reduce((s, l) => s + (Number(l.qty) || 0), 0).toLocaleString()} units
          </span>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subtotal</div>
            <div className="font-display text-2xl font-bold tabular-nums">₹ {subtotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Logistics + Remark */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Field label="E-way Bill No.">
          <input className={inputCls} value={ewayNo} onChange={(e) => setEwayNo(e.target.value)} />
        </Field>
        <Field label="Vehicle No.">
          <input className={inputCls} value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="DL 1A 2345" />
        </Field>
        <Field label="Challan Remark" hint={`${remark.length}/300`}>
          <input
            className={inputCls}
            value={remark}
            maxLength={300}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Overall delivery note"
          />
        </Field>
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Field label="Terms & Conditions">
          <textarea
            rows={6}
            className={inputCls + " font-mono text-xs leading-relaxed"}
            value={toc}
            onChange={(e) => setToc(e.target.value)}
          />
        </Field>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/90 p-4 shadow-lg backdrop-blur">
        <div className="text-sm">
          <span className="text-muted-foreground">Buyer:</span>{" "}
          <span className="font-semibold">{buyer.name || "—"}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-muted-foreground">Total:</span>{" "}
          <span className="font-semibold tabular-nums">₹ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/challans"
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition hover:bg-secondary"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" /> Save Challan
          </button>
        </div>
      </div>
    </PageShell>
  );
}
