// modules/user.ts
import "server-only";
import { drfFetch } from "@/lib/drf";

/** =======================
 * Users
 * ======================= */

// (Loader) – list users (optional)
export async function listUsers(q = "") {
  const url = `/user/${q ? `?search=${encodeURIComponent(q)}` : ""}`;
  const res = await drfFetch(url, { method: "GET" });
  return res.json();
}

// (Loader) – get one user (optional)
export async function getUser(id: number) {
  const res = await drfFetch(`/user/${id}/`, { method: "GET" });
  return res.json();
}

// (Mutation) – register a user via <form action={register}>
export async function register(_: any, form: FormData) {
  "use server";
  const payload = {
    username: String(form.get("username") || ""),
    email: String(form.get("email") || ""),
    first_name: String(form.get("first_name") || ""),
    last_name: String(form.get("last_name") || ""),
    password: String(form.get("password") || ""),
    password2: String(form.get("password2") || ""),
    // add extra fields like is_owner if your serializer supports it:
    ...(form.has("is_owner") ? { is_owner: form.get("is_owner") === "on" || form.get("is_owner") === "true" } : {}),
  };

  await drfFetch("/user/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // No tag to revalidate here unless you cache user lists/me.
  return { ok: true };
}

// (Mutation, programmatic) – register with object (not via <form>)
export async function registerWithPayload(payload: Record<string, any>) {
  "use server";
  await drfFetch("/user/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return { ok: true };
}
