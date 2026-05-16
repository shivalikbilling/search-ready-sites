import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Printer } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/place-order", label: "Place Order" },
  { to: "/quotation", label: "Get Quotation" },
  { to: "/quotations", label: "Quotations" },
  { to: "/orders", label: "My Orders" },
  { to: "/pendings", label: "Pendings" },
  { to: "/settings", label: "Settings" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Printer className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Shivalik<span className="text-accent">.</span></span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm font-semibold bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="max-w-[160px] truncate text-xs text-muted-foreground" title={user.email ?? ""}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-105"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 md:hidden">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="whitespace-nowrap rounded px-3 py-1 text-sm text-muted-foreground"
            activeProps={{ className: "whitespace-nowrap rounded px-3 py-1 text-sm font-semibold bg-secondary text-foreground" }}
            activeOptions={{ exact: l.to === "/" }}>
            {l.label}
          </Link>
        ))}
        {user ? (
          <button onClick={signOut} className="ml-auto whitespace-nowrap rounded px-3 py-1 text-sm font-medium text-muted-foreground">
            Sign out
          </button>
        ) : (
          <Link to="/login" className="ml-auto whitespace-nowrap rounded px-3 py-1 text-sm font-semibold text-accent">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
