import { useEffect, useState } from "react";

const KEY = "printshop.settings.v1";

export interface PaperQuality {
  id: string;
  name: string;
  color?: string; // swatch hex for visual id
}

export type CustomFieldType = "text" | "number" | "select" | "textarea" | "url" | "boolean";

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[];   // for select
  placeholder?: string;
  unit?: string;        // e.g. "mm", "kg"
  defaultValue?: string;
}

export interface CustomJob {
  id: string;
  name: string;
  icon?: string;        // emoji
  description?: string;
  fields: CustomField[];
}

export interface ShopSettings {
  gsm: number[];
  papers: PaperQuality[];
  customJobs: CustomJob[];
}

const DEFAULTS: ShopSettings = {
  gsm: [58, 70, 80, 90, 100, 130, 170, 250, 300],
  papers: [
    { id: "art", name: "Art Paper", color: "#fef3c7" },
    { id: "maphilto", name: "Maphilto", color: "#dbeafe" },
  ],
  customJobs: [
    {
      id: "business-card",
      name: "Business Card",
      icon: "💼",
      description: "Premium cards with custom finishes.",
      fields: [
        { id: "size", label: "Size", type: "select", options: ["3.5x2 in", "85x55 mm", "Square 2.5x2.5 in"], required: true, defaultValue: "3.5x2 in" },
        { id: "finish", label: "Finish", type: "select", options: ["Matte", "Gloss", "Soft Touch", "Spot UV"], required: true },
        { id: "corners", label: "Corners", type: "select", options: ["Square", "Rounded"], defaultValue: "Square" },
        { id: "qty", label: "Quantity", type: "number", required: true, defaultValue: "500", unit: "pcs" },
        { id: "notes", label: "Notes", type: "textarea", placeholder: "Foil color, edge painting, etc." },
        { id: "art", label: "Artwork URL", type: "url", placeholder: "https://drive.google.com/…" },
      ],
    },
  ],
};

function read(): ShopSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      gsm: parsed.gsm ?? DEFAULTS.gsm,
      papers: parsed.papers ?? DEFAULTS.papers,
      customJobs: parsed.customJobs ?? DEFAULTS.customJobs,
    };
  } catch {
    return DEFAULTS;
  }
}

function write(s: ShopSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("settings:changed"));
}

export function useSettings() {
  const [s, setS] = useState<ShopSettings>(DEFAULTS);
  useEffect(() => {
    setS(read());
    const h = () => setS(read());
    window.addEventListener("settings:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("settings:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return s;
}

export function saveSettings(s: ShopSettings) {
  write(s);
}

export function resetSettings() {
  write(DEFAULTS);
}

export function newCustomJob(): CustomJob {
  const id = "job-" + Math.random().toString(36).slice(2, 8);
  return {
    id,
    name: "Untitled Job",
    icon: "✨",
    description: "",
    fields: [
      { id: "f-" + Math.random().toString(36).slice(2, 6), label: "Quantity", type: "number", required: true },
    ],
  };
}

export function newCustomField(): CustomField {
  return {
    id: "f-" + Math.random().toString(36).slice(2, 6),
    label: "New field",
    type: "text",
  };
}
