// src/components/AddMenuItemForm.tsx
"use client";
import { useTransition, useState } from "react";
import { createMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";

export default function AddMenuItemForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;         
    const form = new FormData(e.currentTarget);
    form.set("restaurantId", String(restaurantId));
    setError(null);
    start(async () => {
      const res = await createMenuItem(form);
      if (res.ok) {
       formEl.reset();                          // reset here
        router.refresh();     
      } else setError(typeof res.error === "string" ? res.error : "Failed to add item");
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
      <input name="name" placeholder="Name" className="rounded border px-3 py-2 md:col-span-2" required />
      <input name="price" type="number" step="0.01" placeholder="Price" className="rounded border px-3 py-2" required />
      <input name="category" placeholder="Category" className="rounded border px-3 py-2" />
      <button disabled={pending} className="rounded bg-black text-white py-2">
        {pending ? "Adding…" : "Add"}
      </button>
      <input name="description" placeholder="Description (optional)" className="rounded border px-3 py-2 md:col-span-5" />
      {error && <div className="md:col-span-5 text-sm text-red-600">{error}</div>}
    </form>
  );
}