// modules/auth.ts
"use server";
import "server-only";
import { cookies } from "next/headers";
import {getUser} from "@/actions/user";
import { jwtDecode } from "jwt-decode";
import { get } from "http";
import { drfFetch } from "@/lib/drf";

const DRF = process.env.DRF_URL!;


function getUserIdFromToken(token: string): number | null {
  try {
    const decoded: { user_id?: number } = jwtDecode(token);
    return decoded.user_id ?? null;
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}



export async function login(username: string, password: string) {


  const res = await fetch(`${DRF}/api/token/`, {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => ({})))?.detail || "Invalid credentials";
    return { ok: false, message: msg };
  }
  const data = await res.json(); // { access, refresh? }
  const jar = await cookies();
  jar.set("access", data.access, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 3600 });
  if (data.refresh) {
    jar.set("refresh", data.refresh, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  }
    // Prefetch user data
  const user = await getUser(getUserIdFromToken(data.access)!);
    if (!user) {
        jar.delete("access");
        jar.delete("refresh");
        return { ok: false, message: "Failed to fetch user data" };
    }
  jar.set("user", JSON.stringify(user), { httpOnly: false, secure: true, sameSite: "lax", path: "/", maxAge: 3600 });

  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  jar.delete("access");
  jar.delete("refresh");
  jar.delete("user");

  return { ok: true };
}

export async function getMyRestaurants() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const user = userCookie ? JSON.parse(userCookie) : null;
  const res = await drfFetch(`/restaurants/?owner_name=${user?.username}`, { method: "GET" }, { cache: "no-cache" });
  return res.json();
}

