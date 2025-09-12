"use client";

import { useCart } from "@/components/cart/cart-provider";
import { Check } from "lucide-react";
import CheckoutButton from "@/components/cart/CheckoutButton";

function peso(n: number | string) {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return `₱${v.toFixed(2)}`;
}

export default function CartPage() {
  const { items, remove, clear, setQty } = useCart();

  const total = items.reduce((sum, it) => sum + Number(it.price) * it.qty, 0);

  const inc = (id: number | string) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    setQty(id, it.qty + 1);
  };

  const dec = (id: number | string) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    const next = Math.max(1, it.qty - 1);
    setQty(id, next);
  };

  const onQtyInput = (id: number | string, value: string) => {
    if (!setQty) return;
    const n = parseInt(value.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(n)) return;
    setQty(id, Math.min(999, Math.max(1, n)));
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between border rounded p-4 bg-white"
              >
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-600">
                    {peso(it.price)} each
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Qty controls */}
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => dec(it.id)}
                      className="h-9 w-9 rounded border text-lg leading-none hover:bg-gray-50 disabled:opacity-50"
                      disabled={it.qty <= 1}
                    >
                      –
                    </button>

                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={999}
                      value={it.qty}
                      onChange={(e) => onQtyInput(it.id, e.target.value)}
                      className="w-16 h-9 rounded border px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="Set quantity"
                    />

                    <button
                      aria-label="Increase quantity"
                      onClick={() => inc(it.id)}
                      className="h-9 w-9 rounded border text-lg leading-none hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>

                  <div className="font-semibold w-24 text-right">
                    {peso(Number(it.price) * it.qty)}
                  </div>

                  <button
                    onClick={() => remove(it.id)}
                    className="px-3 py-1 rounded border hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-lg font-semibold">Total: {peso(total)}</div>
            <div className="flex gap-2">
              <button
                onClick={clear}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Clear cart
              </button>
             <CheckoutButton />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
