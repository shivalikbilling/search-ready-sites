import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SortableList } from "@/components/SortableList";
import { useSettings, saveSettings, resetSettings, PaperQuality } from "@/lib/settings";
import { inputCls } from "@/components/form-bits";
import { Plus, RotateCcw, Save, Layers, FileStack } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Inkline" },
      { name: "description", content: "Manage paper GSM presets and paper quality options. Drag to reorder." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const stored = useSettings();
  const [gsm, setGsm] = useState<number[]>([]);
  const [papers, setPapers] = useState<PaperQuality[]>([]);
  const [newGsm, setNewGsm] = useState("");
  const [newPaper, setNewPaper] = useState("");
  const [newColor, setNewColor] = useState("#f1c27d");
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setGsm(stored.gsm);
    setPapers(stored.papers);
  }, [stored]);

  const dirty =
    JSON.stringify(gsm) !== JSON.stringify(stored.gsm) ||
    JSON.stringify(papers) !== JSON.stringify(stored.papers);

  function addGsm() {
    const n = parseInt(newGsm, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    if (gsm.includes(n)) return;
    setGsm([...gsm, n]);
    setNewGsm("");
  }

  function addPaper() {
    const name = newPaper.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (papers.some((p) => p.id === id)) return;
    setPapers([...papers, { id, name, color: newColor }]);
    setNewPaper("");
  }

  function commit() {
    saveSettings({ gsm, papers });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <PageShell
      title="Shop Settings"
      lead="Drag to reorder. Add or remove paper GSM presets and quality options used across order & quotation forms."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* GSM */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <header className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Paper GSM</h2>
              <p className="text-xs text-muted-foreground">Numeric weight presets shown in form selectors.</p>
            </div>
          </header>

          <div className="mb-4 flex gap-2">
            <input
              type="number"
              min={1}
              placeholder="e.g. 120"
              className={inputCls}
              value={newGsm}
              onChange={(e) => setNewGsm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGsm())}
            />
            <button
              type="button"
              onClick={addGsm}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <SortableList
            items={gsm}
            onChange={setGsm}
            getKey={(g) => String(g)}
            onRemove={(i) => setGsm(gsm.filter((_, idx) => idx !== i))}
            renderItem={(g) => (
              <div className="flex items-baseline gap-2">
                <span className="font-display text-base font-semibold tabular-nums">{g}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">gsm</span>
              </div>
            )}
          />
        </section>

        {/* Papers */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <header className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <FileStack className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Paper Quality</h2>
              <p className="text-xs text-muted-foreground">Named paper stocks customers can pick from.</p>
            </div>
          </header>

          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              placeholder="e.g. Glossy Coated"
              className={inputCls}
              value={newPaper}
              onChange={(e) => setNewPaper(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPaper())}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-md border border-input bg-background"
              aria-label="Swatch color"
            />
            <button
              type="button"
              onClick={addPaper}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <SortableList
            items={papers}
            onChange={setPapers}
            getKey={(p) => p.id}
            onRemove={(i) => setPapers(papers.filter((_, idx) => idx !== i))}
            renderItem={(p, i) => (
              <div className="flex items-center gap-3">
                <span
                  className="h-6 w-6 shrink-0 rounded-md border border-border"
                  style={{ background: p.color || "#e5e7eb" }}
                />
                <input
                  className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none focus:underline"
                  value={p.name}
                  onChange={(e) => {
                    const next = [...papers];
                    next[i] = { ...p, name: e.target.value };
                    setPapers(next);
                  }}
                />
                <input
                  type="color"
                  value={p.color || "#e5e7eb"}
                  onChange={(e) => {
                    const next = [...papers];
                    next[i] = { ...p, color: e.target.value };
                    setPapers(next);
                  }}
                  className="h-7 w-7 cursor-pointer rounded border border-input bg-background"
                  aria-label="Swatch"
                />
              </div>
            )}
          />
        </section>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 pl-5 shadow-lg backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {dirty ? (
            <span className="text-foreground">You have unsaved changes.</span>
          ) : savedFlash ? (
            <span className="text-emerald-600">Saved ✓</span>
          ) : (
            "All changes saved."
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset GSM and Paper Quality to defaults?")) resetSettings();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-secondary"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={commit}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save changes
          </button>
        </div>
      </div>
    </PageShell>
  );
}
