import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { addOrder, ColorMode, JobType, PrintType } from "@/lib/store";
import { BINDINGS, COLOR_MODES, Field, JOB_TYPES, LAMINATIONS, PAPERS, PRINT_TYPES, inputCls } from "./form-bits";
import { CheckCircle2 } from "lucide-react";

export function OrderForm({ mode }: { mode: "order" | "quotation" }) {
  const nav = useNavigate();
  const [jobType, setJobType] = useState<JobType>("Leaflet/Pamphlet");
  const [jobName, setJobName] = useState("");
  const [qty, setQty] = useState(1000);

  // simple variants
  const [size, setSize] = useState("8.5x11");
  const [gsm, setGsm] = useState(90);
  const [paper, setPaper] = useState("Art Paper");
  const [printType, setPrintType] = useState<PrintType>("S/S");
  const [fileUrl, setFileUrl] = useState("");

  // book/brochure
  const [innerColor, setInnerColor] = useState<ColorMode>("Single");
  const [innerPages, setInnerPages] = useState(24);
  const [innerGsm, setInnerGsm] = useState(80);
  const [innerSize, setInnerSize] = useState("8.5x11");
  const [innerFile, setInnerFile] = useState("");
  const [coverColor, setCoverColor] = useState<ColorMode>("Multi");
  const [coverGsm, setCoverGsm] = useState(250);
  const [lamination, setLamination] = useState("Matt");
  const [coverFile, setCoverFile] = useState("");
  const [binding, setBinding] = useState("Perfect");

  const [done, setDone] = useState<number | null>(null);

  const isPoster = jobType === "Poster";
  const isLeaflet = jobType === "Leaflet/Pamphlet";
  const isBook = jobType === "Books" || jobType === "Brochure";
  const fileOptional = mode === "quotation";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const base = {
      kind: mode,
      jobType,
      jobName: jobName || `${jobType} order`,
      qty,
    } as const;

    let payload: Parameters<typeof addOrder>[0];
    if (isBook) {
      payload = {
        ...base,
        inner: { color: innerColor, pages: innerPages, gsm: innerGsm, size: innerSize, fileUrl: innerFile },
        cover: { color: coverColor, gsm: coverGsm, lamination, fileUrl: coverFile },
        binding,
      };
    } else {
      payload = {
        ...base,
        size,
        gsm: isPoster ? 58 : gsm,
        paperQuality: paper,
        printType: isPoster ? "S/S" : printType,
        fileUrl,
      };
    }
    const created = addOrder(payload);
    setDone(created.id);
  }

  if (done !== null) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 className="mt-4 font-display text-2xl font-bold">
          {mode === "order" ? "Order placed" : "Quotation requested"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          Reference <span className="font-mono text-foreground">#{done}</span> — we'll be in touch shortly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => nav({ to: "/orders" })} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            View My Orders
          </button>
          <button onClick={() => setDone(null)} className="rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold">
            New {mode === "order" ? "order" : "quotation"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-xl font-semibold">Job Selection</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Job Type">
            <select className={inputCls} value={jobType} onChange={(e) => setJobType(e.target.value as JobType)}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Job / Project Name">
            <input className={inputCls} value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="e.g. Spring Catalogue" />
          </Field>
        </div>
      </section>

      {(isLeaflet || isPoster) && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 font-display text-xl font-semibold">{isPoster ? "Poster Specs" : "Leaflet / Pamphlet Specs"}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {isPoster ? "Posters print Single Side only." : "Choose paper, print type and quantity."}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Size"><input className={inputCls} value={size} onChange={(e) => setSize(e.target.value)} /></Field>
            <Field label="GSM">
              <input type="number" className={inputCls} value={isPoster ? 58 : gsm} disabled={isPoster} onChange={(e) => setGsm(+e.target.value)} />
            </Field>
            <Field label="Paper Quality">
              <select className={inputCls} value={paper} onChange={(e) => setPaper(e.target.value)}>{PAPERS.map((p) => <option key={p}>{p}</option>)}</select>
            </Field>
            <Field label="Print Type">
              <select className={inputCls} value={isPoster ? "S/S" : printType} disabled={isPoster} onChange={(e) => setPrintType(e.target.value as PrintType)}>
                {PRINT_TYPES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Quantity">
              <input type="number" className={inputCls} value={qty} onChange={(e) => setQty(+e.target.value)} />
            </Field>
            <Field label={`File / Drive URL${fileOptional ? " (optional)" : ""}`}>
              <input className={inputCls} value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://drive.google.com/…" />
            </Field>
          </div>
        </section>
      )}

      {isBook && (
        <>
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-semibold">Print Quantity</h2>
            <div className="max-w-sm">
              <Field label="Print QTY">
                <input type="number" className={inputCls} value={qty} onChange={(e) => setQty(+e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-semibold">Inner Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Color">
                <select className={inputCls} value={innerColor} onChange={(e) => setInnerColor(e.target.value as ColorMode)}>
                  {COLOR_MODES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Pages"><input type="number" className={inputCls} value={innerPages} onChange={(e) => setInnerPages(+e.target.value)} /></Field>
              <Field label="Paper GSM"><input type="number" className={inputCls} value={innerGsm} onChange={(e) => setInnerGsm(+e.target.value)} /></Field>
              <Field label="Size"><input className={inputCls} value={innerSize} onChange={(e) => setInnerSize(e.target.value)} /></Field>
              <Field label={`Inner File URL${fileOptional ? " (optional)" : ""}`}>
                <input className={inputCls} value={innerFile} onChange={(e) => setInnerFile(e.target.value)} placeholder="Drive / share URL" />
              </Field>
            </div>
            {innerColor === "Multi" && (
              <p className="mt-3 rounded-md bg-accent/15 px-3 py-2 text-xs text-foreground">
                Multi-color selected — specify per-page color split in notes when uploading the file.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-semibold">Cover Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Color">
                <select className={inputCls} value={coverColor} onChange={(e) => setCoverColor(e.target.value as ColorMode)}>
                  {COLOR_MODES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Paper GSM"><input type="number" className={inputCls} value={coverGsm} onChange={(e) => setCoverGsm(+e.target.value)} /></Field>
              <Field label="Lamination">
                <select className={inputCls} value={lamination} onChange={(e) => setLamination(e.target.value)}>
                  {LAMINATIONS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label={`Cover File URL${fileOptional ? " (optional)" : ""}`}>
                <input className={inputCls} value={coverFile} onChange={(e) => setCoverFile(e.target.value)} placeholder="Drive / share URL" />
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-semibold">Binding</h2>
            <div className="max-w-sm">
              <Field label="Binding Type">
                <select className={inputCls} value={binding} onChange={(e) => setBinding(e.target.value)}>
                  {BINDINGS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>
          </section>
        </>
      )}

      <div className="flex justify-end">
        <button type="submit" className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-105">
          {mode === "order" ? "Place Order" : "Request Quotation"}
        </button>
      </div>
    </form>
  );
}
