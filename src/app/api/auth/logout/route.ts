import { NextResponse } from "next/server";
const DOMAIN = process.env.JWT_COOKIE_DOMAIN || "localhost";
const SECURE = String(process.env.JWT_SECURE_COOKIE) === "true";

export async function POST() {
  const resp = NextResponse.json({ ok: true });
  // Clear cookies
  for (const name of ["access", "refresh"]) {
    resp.cookies.set(name, "", {
      httpOnly: true, sameSite: "lax", path: "/", secure: SECURE, domain: DOMAIN, maxAge: 0,
    });
  }
  return resp;
}
