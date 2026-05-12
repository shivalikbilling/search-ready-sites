import { useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useOrders, respondToQuote, appendQuoteMessage, setQuoteStatus, OrderBase } from "@/lib/store";
import { ArrowLeft, Check, X, Send } from "lucide-react";

export const Route = createFileRoute("/quotations/$quoteId")({
  head: () => ({ meta: [{ title: "Quotation Ticket — Inkline" }] }),
  component: QuoteTicket,
});

const badge: Record<NonNullable<OrderBase["quoteStatus"]>, string> = {
  Awaiting: "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  Quoted: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  Accepted: "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  Declined: "bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
};

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-ring/30 transition focus:border-ring focus:ring-2";

function QuoteTicket() {
  const { quoteId } = useParams({ from: "/quotations/$quoteId" });
  const order = useOrders().find((o) => String(o.id) === quoteId && o.kind === "quotation");

  const [unit, setUnit] = useState(0);
  const [lead, setLead] = useState(7);
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [reply, setReply] = useState("");

  if (!order) {
    return (
      <PageShell title="Ticket not found">
        <Link to="/quotations" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to quotations
        </Link>
      </PageShell>
    );
  }

  const st = order.quoteStatus ?? "Awaiting";
  const total = unit * order.qty;

  function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!unit) return;
    respondToQuote(order!.id, { unitPrice: unit, totalPrice: unit * order!.qty, leadTimeDays: lead, validUntil: validUntil || undefined, notes });
    setUnit(0); setNotes("");
  }

  function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    appendQuoteMessage(order!.id, "customer", reply.trim());
    setReply("");
  }

  return (
    <PageShell title={`Ticket #Q-${String(order.id).padStart(4, "0")}`} lead={`${order.jobName} · ${order.jobType} · opened ${order.date}`}>
      <Link to="/quotations" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All quotations
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge[st]}`}>{st}</span>
        {st === "Quoted" && (
          <>
            <button onClick={() => setQuoteStatus(order.id, "Accepted")} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110">
              <Check className="h-3.5 w-3.5" /> Accept quote
            </button>
            <button onClick={() => setQuoteStatus(order.id, "Declined")} className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
              <X className="h-3.5 w-3.5" /> Decline
            </button>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold">Conversation</h2>
          <div className="space-y-3">
            <Bubble from="customer" at={order.date}>
              Requested a quotation for <strong>{order.qty.toLocaleString()}</strong> × {order.jobType}
              {order.size && ` (${order.size}${order.gsm ? `, ${order.gsm} gsm` : ""}${order.paperQuality ? `, ${order.paperQuality}` : ""})`}.
            </Bubble>
            {order.quote?.thread.map((m, i) => (
              <Bubble key={i} from={m.from} at={new Date(m.at).toLocaleString()}>{m.text}</Bubble>
            ))}
            {!order.quote && <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Awaiting response from the print shop.</p>}
          </div>

          {st !== "Declined" && (
            <form onSubmit={sendReply} className="mt-6 flex gap-2">
              <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to this ticket…" className={inputCls} />
              <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Send className="h-4 w-4" /> Send
              </button>
            </form>
          )}
        </section>

        <aside className="space-y-6">
          {order.quote ? (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-display text-lg font-semibold">Quote</h2>
              <Row k="Unit price" v={order.quote.unitPrice.toLocaleString()} />
              <Row k="Total" v={<span className="font-display text-xl">{order.quote.totalPrice.toLocaleString()}</span>} />
              <Row k="Lead time" v={`${order.quote.leadTimeDays} day(s)`} />
              <Row k="Valid until" v={order.quote.validUntil} />
              <Row k="Responded" v={new Date(order.quote.respondedAt).toLocaleString()} />
              {order.quote.notes && <p className="mt-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">{order.quote.notes}</p>}
            </section>
          ) : (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 font-display text-lg font-semibold">Post a Quote</h2>
              <form onSubmit={submitQuote} className="space-y-3">
                <label className="block"><span className="mb-1 block text-xs font-medium">Unit price</span>
                  <input type="number" min={0} value={unit || ""} onChange={(e) => setUnit(+e.target.value)} className={inputCls} required /></label>
                <p className="text-xs text-muted-foreground">Total: <strong className="text-foreground">{total.toLocaleString()}</strong> for {order.qty.toLocaleString()} units</p>
                <label className="block"><span className="mb-1 block text-xs font-medium">Lead time (days)</span>
                  <input type="number" min={1} value={lead} onChange={(e) => setLead(+e.target.value)} className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs font-medium">Valid until</span>
                  <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs font-medium">Notes</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} /></label>
                <button type="submit" className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Send Quote</button>
              </form>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-3 font-display text-lg font-semibold">Request Specs</h2>
            <Row k="Job type" v={order.jobType} />
            <Row k="Quantity" v={order.qty.toLocaleString()} />
            <Row k="Size" v={order.size} />
            <Row k="GSM" v={order.gsm} />
            <Row k="Paper" v={order.paperQuality} />
            <Row k="Print" v={order.printType} />
            <Row k="Binding" v={order.binding} />
            {order.inner && <Row k="Inner" v={`${order.inner.color}, ${order.inner.pages ?? "?"}p`} />}
            {order.cover && <Row k="Cover" v={`${order.cover.color}, ${order.cover.lamination ?? ""}`} />}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}

function Row({ k, v }: { k: string; v?: React.ReactNode }) {
  if (v === undefined || v === null || v === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

function Bubble({ from, at, children }: { from: "customer" | "shop"; at: string; children: React.ReactNode }) {
  const isShop = from === "shop";
  return (
    <div className={`flex ${isShop ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isShop ? "bg-secondary text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`}>
        <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">{isShop ? "Print shop" : "You"} · {at}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
