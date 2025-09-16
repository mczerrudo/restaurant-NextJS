// src/lib/crypto.ts
import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, JWTPayload } from "jose";

const day = 60 * 60 * 24;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export type JwtClaims = {
  sub: string; // user id
  email?: string;
  is_restaurant_owner?: boolean;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signJwt(claims: JwtClaims, maxAgeSeconds = day) {
  return new SignJWT(claims as any)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export type CookieOptions = {
  maxAge?: number;
};

export function authCookieOptions(opts: CookieOptions = {}) {
  const maxAge = opts.maxAge ?? day;
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}