// lib/session.ts
import { cookies } from "next/headers";

const DRF = process.env.DRF_URL!;

type User = {
  id: number;
  username: string;
  email: string;
  is_restaurant_owner: boolean;
};

// per-request cache
let cachedUser: User | null | undefined;

export async function getCurrentUser(): Promise<User | null | undefined> {
  if (cachedUser !== undefined) {
    return cachedUser;
  }

  const access = (await cookies()).get("access")?.value;
  if (!access) {
    cachedUser = null;
    return null;
  }

  const res = await fetch(`${DRF}/user/me/`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    cachedUser = null;
    return null;
  }

  cachedUser = await res.json();
  return cachedUser;
}
