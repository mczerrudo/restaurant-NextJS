"use server";
import "server-only";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { authCookieOptions, signJwt, verifyJwt } from "@/lib/crypto";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { redirect } from "next/navigation";
import { signUpSchema } from "@/lib/validators";

export async function signInAction(form: FormData): Promise<void> {
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  if (!email || !password) redirect("/login?error=missing");

  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  if (!u || !u.passwordHash) redirect("/login?error=invalid");

  const valid = await verifyPassword(password, u.passwordHash);
  if (!valid) redirect("/login?error=invalid");

  const token = await signJwt({
    sub: String(u.id),
    email: u.email,
    is_restaurant_owner: !!u.isRestaurantOwner,
  });

  const cookieStore = await cookies();
  cookieStore.set("access", token, authCookieOptions());
  cookieStore.set("user", JSON.stringify(u), authCookieOptions());

  redirect("/"); // success
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access");
  cookieStore.delete("user")
  return { ok: true };
}


export async function signUpAction(
  form:
    | FormData
    | {
        email: string;
        password: string;
        confirmPassword: string;
        fullName?: string;
        isRestaurantOwner?: boolean;
      }
) {
  const data =
    form instanceof FormData
      ? {
          email: String(form.get("email") || "")
            .toLowerCase()
            .trim(),
          password: String(form.get("password") || ""),
          confirmPassword: String(form.get("confirmPassword") || ""),
          fullName: (form.get("fullName") as string) || undefined,
          isRestaurantOwner:
            String(form.get("isRestaurantOwner") || "false") === "true",
        }
      : {
          ...form,
          email: String(form.email || "")
            .toLowerCase()
            .trim(),
          isRestaurantOwner: !!form.isRestaurantOwner,
        };

  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  // check if email exists
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing) return { ok: false, error: "Email already in use" };

  const hash = await hashPassword(parsed.data.password);
  try {
    const inserted = await db
      .insert(users)
      .values({
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        isRestaurantOwner: parsed.data.isRestaurantOwner
          ? (1 as any)
          : (0 as any),
        passwordHash: hash,
      })
      .returning({ id: users.id });

    const uid = inserted[0]?.id;
    const token = await signJwt({
      sub: String(uid),
      email: parsed.data.email,
      is_restaurant_owner: parsed.data.isRestaurantOwner,
    });
    redirect("/login");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
