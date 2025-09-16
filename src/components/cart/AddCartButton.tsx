"use client";

import { useCart } from "@/components/cart/cart-provider";
import { MenuItemType } from "@/lib/definitions";
export default function AddToCartButton({ item }: { item: MenuItemType }) {
  const { add } = useCart();



  return (
    <button
      onClick={() => add({ ...item, qty: 1 })}
      className="px-3 py-2 bg-black text-white rounded hover:bg-gray-500 transition"
    >
      Add to Cart
    </button>
  );
}
