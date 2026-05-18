import { useEffect, useState } from "react";

export interface DispatchItem {
  id: string;
  createdAt: string;
  buyer?: string;
  jobName: string;
  description?: string;
  pages?: number;
  qty: number;
  rate: number;
  remark?: string;
  status: "queued" | "dispatched";
  challanId?: number;
  challanNumber?: string;
}

const KEY = "printshop.dispatch.v1";

function read(): DispatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list: DispatchItem[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("dispatch:changed"));
}

export function useDispatchItems() {
  const [list, setList] = useState<DispatchItem[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("dispatch:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("dispatch:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}

export function addDispatchItem(item: Omit<DispatchItem, "id" | "createdAt" | "status">) {
  const list = read();
  const next: DispatchItem = {
    ...item,
    id: "d-" + Math.random().toString(36).slice(2, 9),
    createdAt: new Date().toISOString(),
    status: "queued",
  };
  write([next, ...list]);
  return next;
}

export function updateDispatchItem(id: string, patch: Partial<DispatchItem>) {
  write(read().map((d) => (d.id === id ? { ...d, ...patch } : d)));
}

export function removeDispatchItem(id: string) {
  write(read().filter((d) => d.id !== id));
}

export function markDispatched(ids: string[], challanId: number, challanNumber: string) {
  write(
    read().map((d) =>
      ids.includes(d.id) ? { ...d, status: "dispatched", challanId, challanNumber } : d
    )
  );
}
