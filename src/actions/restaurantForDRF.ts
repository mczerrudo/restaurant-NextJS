// modules/restaurants.ts
"use server";
import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { drfFetch } from "@/lib/drf";
import { use } from "react";

/** GETs */
export async function listRestaurants(search = "") {
  const url = `/restaurants/${search ? `?name__icontains=${encodeURIComponent(search)}` : ""}`;
  const res = await drfFetch(url, { method: "GET" }, { cache: "no-cache" });
  return res.json();
}
export async function getRestaurant(id: number) {
  const res = await drfFetch(`/restaurants/${id}/`, { method: "GET" },{revalidate:60});
  return res.json();
}

/** Mutations (callable from client via <form action>) */
export async function createRestaurant(_: any, form: FormData) {
  const payload = {
    name: String(form.get("name") || ""),
    address: String(form.get("address") || ""),
  };
  const res = await drfFetch("/restaurants/", { method: "POST", body: JSON.stringify(payload) },{cache:"no-store"});
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, message: data.detail || "Failed to create restaurant" };
  }
  revalidatePath("/restaurants");
  revalidatePath("/owner");

  return { ok: true };
}

export async function updateRestaurant(id: number, data: any) {
  const res = await drfFetch(`/restaurants/${id}/`, { method: "PATCH", body: JSON.stringify(data) },{cache:"no-store"});
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    return { ok: false, message: d.detail || "Failed to update restaurant" };
  }
  revalidatePath(`/restaurants/${id}`);
  revalidatePath("/restaurants");
  revalidatePath("/owner");
  return { ok: true };
}

// ✅ wrapper so you can use <form action={updateRestaurantAction}>
export async function updateRestaurantAction(_: any, form: FormData) {
  const id = Number(form.get("id"));
  const data = {
    name: String(form.get("name") || ""),
    address: String(form.get("address") || ""),
  };
  return updateRestaurant(id, data);
}

export async function deleteRestaurant(id: number) {
  const res = await drfFetch(`/restaurants/${id}/`, { method: "DELETE" }, { cache: "no-store" });
  if (!res.ok && res.status !== 204) {
    const d = await res.json().catch(() => ({}));
    return { ok: false, message: d.detail || "Failed to delete restaurant" };
  }
  revalidatePath("/restaurants");
  revalidatePath("/owner");
  return { ok: true };
}

// ✅ wrapper so you can use <form action={deleteRestaurantAction}>
export async function deleteRestaurantAction(_: any, form: FormData) {
  const id = Number(form.get("id"));
  return deleteRestaurant(id);
  
}


