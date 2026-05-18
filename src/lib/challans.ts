import { useEffect, useState } from "react";

export interface ChallanLine {
  id: string;
  orderId?: number;
  jobName: string;
  description?: string;
  pages?: number;
  qty: number;
  rate: number;
  amount: number;
  remark?: string;
}

export interface Party {
  name: string;
  gstin?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Challan {
  id: number;
  number: string;
  date: string;
  title?: string;
  company: Party;
  buyer: Party;
  shipTo: Party;
  ewayNo?: string;
  vehicleNo?: string;
  placeOfSupply?: string;
  remark?: string;
  toc?: string;
  lines: ChallanLine[];
  subtotal: number;
  createdAt: string;
}

const KEY = "printshop.challans.v1";

const DEFAULT_TOC = `Return and Refund Policy
- Defective materials will be taken back at the time of delivery.
- Materials will not be taken back once they have been used.
Dispute Resolution
- Any disputes arising out of or in connection with these Terms and Conditions shall be resolved through arbitration in accordance with the laws of Delhi, India.`;

function read(): Challan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list: Challan[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("challans:changed"));
}

export function useChallans() {
  const [list, setList] = useState<Challan[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("challans:changed", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("challans:changed", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return list;
}

export function nextChallanNumber(): string {
  const list = read();
  const maxN = list.reduce((m, c) => {
    const n = parseInt(c.number.replace(/[^\d]/g, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 5328);
  return `CH-${maxN + 1}`;
}

export function addChallan(c: Omit<Challan, "id" | "createdAt">) {
  const list = read();
  const id = (list.reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
  const item: Challan = { ...c, id, createdAt: new Date().toISOString() };
  write([item, ...list]);
  return item;
}

export function newLine(): ChallanLine {
  return {
    id: "l-" + Math.random().toString(36).slice(2, 8),
    jobName: "",
    qty: 0,
    rate: 0,
    amount: 0,
  };
}

export { DEFAULT_TOC };
