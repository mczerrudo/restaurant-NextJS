"use server";
import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { drfFetch } from "@/lib/drf";

type OrderItemIn = { menu_item: number | string; quantity: number };
type OrderCreatePayload = { restaurant: number; items: OrderItemIn[] };

type ListParams = {
  ordering?: "created_at" | "-created_at";
  restaurant?: string | number;
  status?: string;
};

export async function listOrders(params: ListParams = {}) {
  const qs = new URLSearchParams();
  if (params.ordering) qs.set("ordering", params.ordering);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.restaurant && params.restaurant !== "all") {
    qs.set("restaurant", String(params.restaurant));
  }

  const url = `/orders/${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await drfFetch(url, { method: "GET" }, { cache: "no-store" });
  return res.json(); // <-- expect an array, not {results:[]}
}

export async function getOrder(id: number) {
  const res = await drfFetch(
    `/orders/${id}/`,
    { method: "GET" },
    { cache: "no-store" }
  );
  return res.json(); // ✅ plain object
}

export async function createOrder(payload: OrderCreatePayload) {
  const res = await drfFetch(
    "/orders/",
    { method: "POST", body: JSON.stringify(payload) },
    { cache: "no-store" }
  );

  const data = await res.json().catch(() => null); // ✅ plain object

  if (res.ok) {
    // revalidate only on success
    revalidateTag("orders");
    revalidatePath("/orders/");

    return data; // ✅ serializable
  }

  // surface a serializable error (or return {ok:false,...})
  throw new Error(
    (data && (data.detail || JSON.stringify(data))) || "Failed to create order"
  );
}
