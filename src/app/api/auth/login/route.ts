import { NextResponse } from "next/server";

const DRF = process.env.DRF_URL!;
const DOMAIN = process.env.JWT_COOKIE_DOMAIN || "localhost";
const SECURE = String(process.env.JWT_SECURE_COOKIE) === "true";

export async function POST(req: Request) {
  const body = await req.json(); // { username, password }
  const res = await fetch(`${DRF}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const resp = NextResponse.json({ ok: true });
  // Set HTTP-only cookies
  resp.cookies.set("access", data.access, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: SECURE,
    domain: DOMAIN,
    maxAge: 60 * 15, // 15 min (adjust to match DRF)
  });
  resp.cookies.set("refresh", data.refresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: SECURE,
    domain: DOMAIN,
    maxAge: 60 * 60 * 24 * 7 * 2, // 2 weeks
  });
  return resp;
}
