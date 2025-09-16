import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";

// Supports either HS256 (shared secret) or RS256 (public key). Use one.
const alg = "HS256"; // change to "RS256" if using a keypair

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (alg === "HS256") {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });
      return payload;
    } else {
      const publicKey = await crypto.subtle.importKey(
        "spki",
        Buffer.from(process.env.JWT_PUBLIC_KEY!, "base64"),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const { payload } = await jwtVerify(token, publicKey as any, {
        algorithms: ["RS256"],
      });
      return payload;
    }
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: number;
  email?: string;
  isRestaurantOwner?: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get("access")?.value;
  if (!access) return null;
  const payload = await verifyJWT(access);
  if (!payload) return null;
  return {
    id: Number(payload.sub || payload["uid"]),
    email: typeof payload["email"] === "string" ? payload["email"] : undefined,
    isRestaurantOwner:
      Boolean(payload["is_restaurant_owner"]) ||
      Boolean(payload["isRestaurantOwner"]),
  };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
