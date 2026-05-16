import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import logo from "@/assets/shivalik-logo.png";
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, Printer } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Shivalik Enterprises" },
      { name: "description", content: "Sign in to Shivalik Enterprises — Your One Stop Printing Solution." },
      { property: "og:title", content: "Sign in — Shivalik Enterprises" },
      { property: "og:description", content: "Your One Stop Printing Solution." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setSubmitting(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
      return;
    }
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/15" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Brand pane */}
        <aside className="relative hidden flex-col justify-between p-12 lg:flex">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground shadow">
              <Printer className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              Shivalik<span className="text-accent"> Enterprises</span>
            </span>
          </Link>

          <div className="max-w-md">
            <div className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-accent" /> Press · Pack · Deliver
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Your One Stop
              <br />
              <span className="text-accent">Printing Solution.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Books, brochures, posters, packaging — managed from order to dispatch in a single,
              search-ready workspace.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { k: "Live jobs", v: "12" },
                { k: "On press", v: "4" },
                { k: "Dispatched", v: "38" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-border/60 bg-card/70 p-3 backdrop-blur">
                  <div className="font-display text-2xl font-bold">{s.v}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Shivalik Enterprises · Crafted print, delivered.
          </p>
        </aside>

        {/* Login pane */}
        <main className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile brand header */}
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <img
                src={logo}
                alt="Shivalik Enterprises logo"
                className="h-14 w-auto object-contain"
              />
              <p className="mt-2 text-sm text-muted-foreground">Your One Stop Printing Solution</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/90 p-7 shadow-xl backdrop-blur sm:p-9">
              <div className="mb-6 hidden lg:flex lg:items-center lg:gap-3">
                <img src={logo} alt="Shivalik Enterprises" className="h-10 w-auto object-contain" />
              </div>

              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sign in to manage orders, quotations and dispatches.
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@shivalik.com"
                      className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-10 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-105 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {submitting ? "Signing in…" : "Sign in"}
                </button>

                <p className="pt-1 text-center text-xs text-muted-foreground">
                  Access is by invitation only. Contact your administrator to request an account.
                </p>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
              © {new Date().getFullYear()} Shivalik Enterprises
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
