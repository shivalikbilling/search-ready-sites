import { SiteHeader } from "./SiteHeader";

export function PageShell({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {lead && <p className="mt-2 text-muted-foreground">{lead}</p>}
        </div>
        {children}
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Inkline Press · Crafted print, delivered.
      </footer>
    </div>
  );
}
