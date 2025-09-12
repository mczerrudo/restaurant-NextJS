"use client";

import { createContext, useContext, useState } from "react";
import { MenuItemType } from "@/lib/definitions";

type Item = MenuItemType & { qty: number };

type CartCtxType = {
  items: Item[];
  add: (item: Item) => void;
  remove: (id: number) => void;
  setQty: (id: number | string, qty: number) => void;
  clear: () => void;
};

const CartCtx = createContext<CartCtxType | null>(null);

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);

  const add = (item: Item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, item];
    });
  };

  // inside CartContext value
  const setQty = (id: number | string, qty: number) => {
    setItems((curr) =>
      curr.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it))
    );
  };

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  return (
    <CartCtx.Provider value={{ items, add, remove, clear, setQty }}>
      {children}
    </CartCtx.Provider>
  );
}
