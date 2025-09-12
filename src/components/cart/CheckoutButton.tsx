// components/cart/checkout-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { createOrder } from "@/actions/order";

export default function CheckoutButton() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!items.length || busy) return;
    setBusy(true);
    try {
      const payload = {
        restaurant: items[0].restaurant,
        items: items.map((i) => ({ menu_item: i.id, quantity: i.qty })),
      };
      const res = await createOrder(payload);
      clear();
      router.push(`/orders/`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy || items.length === 0}
      className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
    >
      {busy ? "Processing…" : "Checkout"}
    </button>
  );
}
