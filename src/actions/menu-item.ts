// modules/menu-items.ts
import "server-only";
import { revalidateTag } from "next/cache";
import { drfFetch } from "@/lib/drf";

/** ------------- GET (loaders) ------------- **/

export async function listMenuItems(restaurantId: number, search = "") {
  const qs = new URLSearchParams({
    restaurant: String(restaurantId),
    ...(search ? { search } : {}),
  });
  const res = await drfFetch(`/menu_item/?${qs.toString()}`, { method: "GET" }, { cache: "force-cache" });
  // Tag cache at call site (RSC fetch wrapper) or keep no-store; choose per page needs
  return res.json(); // { results: [...] } or [...]
}

export async function getMenuItem(id: number) {
  const res = await drfFetch(`/menu_item/${id}/`, { method: "GET" });
  return res.json();
}

/** ------------- Mutations (Server Actions) ------------- **/

export async function createMenuItem(_: any, form: FormData) {
  "use server";
  const restaurant = Number(form.get("restaurant"));
  const payload = {
    restaurant,
    name: String(form.get("name") || ""),
    price: Number(form.get("price") || 0),
  };

  await drfFetch("/menu_item/", { method: "POST", body: JSON.stringify(payload) });
  revalidateTag(`menu:${restaurant}`);
  return { ok: true };
}

export async function updateMenuItem(id: number, data: Partial<{ name: string; price: number }>, restaurantId: number) {
  "use server";
  await drfFetch(`/menu_item/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
  revalidateTag(`menu:${restaurantId}`);
  return { ok: true };
}

export async function deleteMenuItem(id: number, restaurantId: number) {
  "use server";
  await drfFetch(`/menu_item/${id}/`, { method: "DELETE" });
  revalidateTag(`menu:${restaurantId}`);
  return { ok: true };
}
