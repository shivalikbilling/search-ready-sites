import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SortableList } from "@/components/SortableList";
import {
  useSettings,
  saveSettings,
  resetSettings,
  PaperQuality,
  CustomJob,
  CustomField,
  CustomFieldType,
  newCustomJob,
  newCustomField,
} from "@/lib/settings";
import { inputCls } from "@/components/form-bits";
import {
  Plus,
  RotateCcw,
  Save,
  Layers,
  FileStack,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Inkline" },
      { name: "description", content: "Manage GSM presets, paper quality and custom job templates." },
    ],
  }),
  component: SettingsPage,
});

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "textarea", label: "Long text" },
  { value: "url", label: "URL" },
  { value: "boolean", label: "Yes / No" },
];

function SettingsPage() {
  const stored = useSettings();
  const [gsm, setGsm] = useState<number[]>([]);
  const [papers, setPapers] = useState<PaperQuality[]>([]);
  const [jobs, setJobs] = useState<CustomJob[]>([]);
  const [newGsm, setNewGsm] = useState("");
  const [newPaper, setNewPaper] = useState("");
  const [newColor, setNewColor] = useState("#f1c27d");
  const [savedFlash, setSavedFlash] = useState(false);
  const [openJob, setOpenJob] = useState<string | null>(null);

  useEffect(() => {
    setGsm(stored.gsm);
    setPapers(stored.papers);
    setJobs(stored.customJobs);
  }, [stored]);

  const dirty =
    JSON.stringify(gsm) !== JSON.stringify(stored.gsm) ||
    JSON.stringify(papers) !== JSON.stringify(stored.papers) ||
    JSON.stringify(jobs) !== JSON.stringify(stored.customJobs);

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

  function addJob() {
    const j = newCustomJob();
    setJobs([...jobs, j]);
    setOpenJob(j.id);
  }

  function updateJob(id: string, patch: Partial<CustomJob>) {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }

  function commit() {
    saveSettings({ gsm, papers, customJobs: jobs });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  return (
    <PageShell
      title="Shop Settings"
      lead="Drag to reorder. Manage GSM presets, paper qualities and design fully custom job templates."
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

      {/* Custom Jobs */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Custom Job Templates</h2>
              <p className="text-xs text-muted-foreground">
                Design your own job types with any fields you need. They appear in the order form under "Custom".
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addJob}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> New template
          </button>
        </header>

        <SortableList
          items={jobs}
          onChange={setJobs}
          getKey={(j) => j.id}
          onRemove={(i) => {
            const j = jobs[i];
            if (confirm(`Delete template "${j.name}"?`)) setJobs(jobs.filter((_, idx) => idx !== i));
          }}
          renderItem={(j) => {
            const isOpen = openJob === j.id;
            return (
              <div className="w-full">
                <div className="flex items-center gap-3">
                  <input
                    className="w-12 bg-transparent text-center text-xl outline-none"
                    value={j.icon || ""}
                    onChange={(e) => updateJob(j.id, { icon: e.target.value.slice(0, 2) })}
                    aria-label="Icon"
                  />
                  <input
                    className="flex-1 min-w-0 bg-transparent text-sm font-semibold outline-none focus:underline"
                    value={j.name}
                    onChange={(e) => updateJob(j.id, { name: e.target.value })}
                  />
                  <span className="hidden sm:inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {j.fields.length} field{j.fields.length === 1 ? "" : "s"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenJob(isOpen ? null : j.id)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
                    aria-label="Toggle"
                  >
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-4 rounded-lg bg-muted/40 p-4">
                    <textarea
                      placeholder="Short description shown to customers"
                      className={inputCls}
                      rows={2}
                      value={j.description || ""}
                      onChange={(e) => updateJob(j.id, { description: e.target.value })}
                    />

                    <FieldEditor
                      fields={j.fields}
                      onChange={(fields) => updateJob(j.id, { fields })}
                    />
                  </div>
                )}
              </div>
            );
          }}
        />
      </section>

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
              if (confirm("Reset everything to defaults?")) resetSettings();
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

function FieldEditor({
  fields,
  onChange,
}: {
  fields: CustomField[];
  onChange: (next: CustomField[]) => void;
}) {
  function update(id: string, patch: Partial<CustomField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fields</h4>
        <button
          type="button"
          onClick={() => onChange([...fields, newCustomField()])}
          className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" /> Add field
        </button>
      </div>

      <SortableList
        items={fields}
        onChange={onChange}
        getKey={(f) => f.id}
        onRemove={(i) => onChange(fields.filter((_, idx) => idx !== i))}
        renderItem={(f) => (
          <div className="grid w-full gap-2 sm:grid-cols-[1.4fr_1fr_auto]">
            <input
              className={inputCls}
              value={f.label}
              placeholder="Field label"
              onChange={(e) => update(f.id, { label: e.target.value })}
            />
            <select
              className={inputCls}
              value={f.type}
              onChange={(e) => update(f.id, { type: e.target.value as CustomFieldType })}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={!!f.required}
                onChange={(e) => update(f.id, { required: e.target.checked })}
              />
              Required
            </label>

            {f.type === "select" && (
              <input
                className={`${inputCls} sm:col-span-3`}
                placeholder="Options, comma separated"
                value={(f.options || []).join(", ")}
                onChange={(e) =>
                  update(f.id, {
                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            )}
            {f.type !== "boolean" && f.type !== "select" && (
              <input
                className={`${inputCls} sm:col-span-2`}
                placeholder="Placeholder (optional)"
                value={f.placeholder || ""}
                onChange={(e) => update(f.id, { placeholder: e.target.value })}
              />
            )}
            {f.type === "number" && (
              <input
                className={inputCls}
                placeholder="Unit (optional)"
                value={f.unit || ""}
                onChange={(e) => update(f.id, { unit: e.target.value })}
              />
            )}
          </div>
        )}
      />

      {fields.length === 0 && (
        <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No fields yet — click "Add field" to start.
        </p>
      )}
    </div>
  );
}

// silence unused-import warnings on Trash2
void Trash2;
