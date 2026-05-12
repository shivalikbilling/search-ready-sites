import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, ClipboardList, FileText, Layers, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inkline — Print orders, quotations & tracking" },
      { name: "description", content: "Place print orders, request quotations, and track every job from press to dispatch in one ready-to-use workspace." },
      { property: "og:title", content: "Inkline — Print orders, quotations & tracking" },
      { property: "og:description", content: "Ready-to-use ordering & tracking for print shops." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: ClipboardList, title: "Place an Order", to: "/place-order", desc: "Configure leaflets, brochures, posters or books with paper, GSM and binding." },
  { icon: FileText, title: "Get a Quotation", to: "/quotation", desc: "Same flow, file upload optional — get pricing before you commit." },
  { icon: Layers, title: "My Orders", to: "/orders", desc: "Filter & search every job. Click received qty for dispatch challan details." },
  { icon: Search, title: "View Pendings", to: "/pendings", desc: "Auto-filtered list of jobs that are pending or partially dispatched." },
];

function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/15 via-transparent to-primary/10" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Ready-to-use print workspace
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Order, quote &amp; track
              <br />
              every <span className="text-accent">print job</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              A multi-page workspace built for press shops. Place orders with full paper specs,
              request quotations, and search through every dispatch — no spreadsheets required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/place-order" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-105">
                Place an Order <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/orders" className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-5 py-3 text-sm font-semibold transition hover:bg-secondary">
                View My Orders
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">Today's Press</p>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: "Active", v: "12" },
                  { k: "Pending", v: "4" },
                  { k: "Dispatched", v: "38" },
                ].map((s) => (
                  <div key={s.k} className="rounded-lg bg-secondary p-4">
                    <div className="font-display text-3xl font-bold">{s.v}</div>
                    <div className="text-xs text-muted-foreground">{s.k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2">
                {[
                  ["#1024", "7600 English", "Books"],
                  ["#1023", "Acme Catalogue", "Brochure"],
                  ["#1022", "Concert Poster", "Poster"],
                ].map(([id, name, type]) => (
                  <div key={id} className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2 text-sm">
                    <span className="font-mono text-muted-foreground">{id}</span>
                    <span className="font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">{type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-4 -top-4 -z-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight">Everything you need, on one shop floor.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Link key={f.title} to={f.to} className="group rounded-xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Inkline Press · Crafted print, delivered.
      </footer>
    </div>
  );
}
