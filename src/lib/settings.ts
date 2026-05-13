import { useEffect, useState } from "react";

const KEY = "printshop.settings.v1";

export interface PaperQuality {
  id: string;
  name: string;
  color?: string; // swatch hex for visual id
}

export interface ShopSettings {
  gsm: number[];                // ordered list of GSM presets
  papers: PaperQuality[];       // ordered list of paper qualities
}

const DEFAULTS: ShopSettings = {
  gsm: [58, 70, 80, 90, 100, 130, 170, 250, 300],
  papers: [
    { id: "art", name: "Art Paper", color: "#fef3c7" },
    { id: "maphilto", name: "Maphilto", color: "#dbeafe" },
  ],
};

function read(): ShopSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { gsm: parsed.gsm ?? DEFAULTS.gsm, papers: parsed.papers ?? DEFAULTS.papers };
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
