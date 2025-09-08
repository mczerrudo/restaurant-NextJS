// lib/drf.ts
import { cookies, headers } from "next/headers";

export async function drfFetch(
  path: string,
  init: RequestInit = {},
  { cache = "force-cache", revalidate }: { cache?: RequestCache; revalidate?: number } = {}
) {
  const BASE = process.env.DRF_URL!;
  const url = path.startsWith("http") ? path : `${BASE}${path}`;

  // ⬇️ these are async in Next 15
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;

  const hdrs = new Headers(init.headers);
  hdrs.set("Accept", "application/json");
  if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", "application/json");
  if (access) hdrs.set("Authorization", `Bearer ${access}`);

  const res = await fetch(url, {
    ...init,
    headers: hdrs,
    cache,
    ...(typeof revalidate === "number" ? { next: { revalidate } } : {}),
  });

  // Example usage of headers() now needs await too
  const h = await headers();
  const reqOrigin = h.get("origin") || "";

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DRF error ${res.status}: ${text || res.statusText}`);
  }

  console.log("Drf Fetch", path, res);
  return res;
}
