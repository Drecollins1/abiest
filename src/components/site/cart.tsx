"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  priceKobo: number; // display only; the server re-prices at checkout
  image: string;
  quantity: number;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotalKobo: number;
  ready: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "abiest-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalKobo = lines.reduce((n, l) => n + l.quantity * l.priceKobo, 0);
    return {
      lines,
      count,
      subtotalKobo,
      ready,
      add: (line, qty = 1) =>
        setLines((prev) => {
          const hit = prev.find((l) => l.variantId === line.variantId);
          if (hit) return prev.map((l) => (l.variantId === line.variantId ? { ...l, quantity: Math.min(99, l.quantity + qty) } : l));
          return [...prev, { ...line, quantity: qty }];
        }),
      setQty: (variantId, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(99, qty) } : l)),
        ),
      remove: (variantId) => setLines((prev) => prev.filter((l) => l.variantId !== variantId)),
      clear: () => setLines([]),
    };
  }, [lines, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
