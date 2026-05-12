import { useEffect, useState } from "react";

export type JobType = "Leaflet/Pamphlet" | "Brochure" | "Poster" | "Books";
export type PrintType = "S/S" | "F/B";
export type ColorMode = "Single" | "Double" | "Multi";

export interface OrderBase {
  id: number;
  date: string;
  jobType: JobType;
  jobName: string;
  qty: number;
  receivedQty: number;
  status: "Pending" | "Dispatched" | "Partial";
  // optional fields
  size?: string;
  gsm?: number;
  paperQuality?: string;
  printType?: PrintType;
  fileUrl?: string;
  inner?: { color: ColorMode; pages?: number; gsm?: number; size?: string; fileUrl?: string };
  cover?: { color: ColorMode; gsm?: number; lamination?: string; fileUrl?: string };
  binding?: string;
  kind: "order" | "quotation";
}

const KEY = "printshop.orders.v1";

function seed(): OrderBase[] {
  return [
    { id: 1, date: "2026-05-12", jobType: "Books", jobName: "7600 English", qty: 15250, receivedQty: 15300, status: "Dispatched", kind: "order", size: "8.5x11", inner: { color: "Single", pages: 240 }, cover: { color: "Multi", lamination: "Matt+UV" }, binding: "Perfect" },
    { id: 2, date: "2026-05-12", jobType: "Brochure", jobName: "Acme Spring Catalogue", qty: 1150, receivedQty: 800, status: "Partial", kind: "order" },
    { id: 3, date: "2026-05-11", jobType: "Poster", jobName: "Concert Promo", qty: 1000, receivedQty: 0, status: "Pending", kind: "order", size: "8.5x11", gsm: 58, paperQuality: "Art Paper", printType: "S/S" },
    { id: 4, date: "2026-05-10", jobType: "Leaflet/Pamphlet", jobName: "Clinic Flyer", qty: 5000, receivedQty: 5000, status: "Dispatched", kind: "order", size: "8.5x11", gsm: 90, paperQuality: "Maphilto", printType: "F/B" },
  ];
}

function read(): OrderBase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(list: OrderBase[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("orders:changed"));
}

export function useOrders() {
  const [orders, setOrders] = useState<OrderBase[]>([]);
  useEffect(() => {
    setOrders(read());
    const h = () => setOrders(read());
    window.addEventListener("orders:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("orders:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return orders;
}

export function addOrder(o: Omit<OrderBase, "id" | "date" | "receivedQty" | "status"> & Partial<Pick<OrderBase, "receivedQty" | "status">>) {
  const list = read();
  const id = (list.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
  const item: OrderBase = {
    id,
    date: new Date().toISOString().slice(0, 10),
    receivedQty: 0,
    status: "Pending",
    ...o,
  };
  write([item, ...list]);
  return item;
}
