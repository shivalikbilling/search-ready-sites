import { JobType, PrintType, ColorMode } from "@/lib/store";

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-ring/30 transition focus:border-ring focus:ring-2";

export const JOB_TYPES: JobType[] = ["Leaflet/Pamphlet", "Brochure", "Poster", "Books"];
export const PRINT_TYPES: PrintType[] = ["S/S", "F/B"];
export const COLOR_MODES: ColorMode[] = ["Single", "Double", "Multi"];
export const LAMINATIONS = ["Gloss", "Matt", "BOPP", "Matt+UV"];
export const BINDINGS = ["Center Pin", "Perfect", "Perfect without stitching"];
export const PAPERS = ["Art Paper", "Maphilto"];
