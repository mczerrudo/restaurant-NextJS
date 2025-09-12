// modules/restaurants.ts
import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { drfFetch } from "@/lib/drf";
import { cookies } from "next/headers";

/** GETs */
export async function listRestaurants(search = "") {
  const url = `/restaurants/${search ? `?name__icontains=${encodeURIComponent(search)}` : ""}`;
  const res = await drfFetch(url, { method: "GET" }, { cache: "force-cache" });
  return res.json();
}
export async function getRestaurant(id: number) {
  const res = await drfFetch(`/restaurants/${id}/`, { method: "GET" });
  return res.json();
}

/** Mutations */
export async function createRestaurant(_: any, form: FormData) {
  "use server";
  const payload = {
    name: String(form.get("name") || ""),
    address: String(form.get("address") || ""),
  };
  await drfFetch("/restaurants/", { method: "POST", body: JSON.stringify(payload) });
  revalidateTag("restaurants");
  revalidatePath("/dashboard/restaurants");
  return { ok: true };
}

export async function updateRestaurant(id: number, data: any) {
  "use server";
  await drfFetch(`/restaurants/${id}/`, { method: "PATCH", body: JSON.stringify(data) });
  revalidateTag("restaurants");
  revalidateTag(`restaurant:${id}`);
  return { ok: true };
}

export async function deleteRestaurant(id: number) {
  "use server";
  await drfFetch(`/restaurants/${id}/`, { method: "DELETE" });
  revalidateTag("restaurants");
  return { ok: true };
}

export async function getMyRestaurants() {
   const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;
  const res = await drfFetch(`/restaurants/?owner_name=${user?.username}`, { method: "GET" });
  return res.json();
}
