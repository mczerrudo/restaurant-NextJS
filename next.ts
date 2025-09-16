# Setup Guide (read me first)

```bash
# 1) Install deps
pnpm add drizzle-orm @libsql/client zod jose
pnpm add -D drizzle-kit dotenv

# (optional UI deps you already use)
pnpm add sonner lucide-react

# 2) Add env vars (e.g., .env.local)
TURSO_DATABASE_URL="libsql://<your-db>.turso.io"
TURSO_AUTH_TOKEN="<token>"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----" # if verifying RS256 tokens
JWT_SECRET="dev-secret" # if verifying HS256 tokens (choose one scheme)

# 3) Drizzle config & first migration
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

---

## drizzle.config.ts
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
```

---

## src/db/client.ts
```ts
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

---

## src/db/schema.ts
```ts
import {
  sqliteTable,
  text,
  integer,
  real,
  unique,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    isRestaurantOwner: integer("is_restaurant_owner", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  })
);

export const restaurants = sqliteTable(
  "restaurants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at").notNull().default(Math.floor(Date.now()/1000)),
  },
  (t) => ({
    ownerIdx: index("restaurants_owner_idx").on(t.ownerId),
    uniqNamePerOwner: unique().on(t.ownerId, t.name),
  })
);

export const menuItems = sqliteTable(
  "menu_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    price: real("price").notNull(),
    description: text("description"),
    category: text("category"),
    available: integer("available", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at").notNull().default(Math.floor(Date.now()/1000)),
  },
  (t) => ({
    uniqPerRestaurant: unique().on(t.restaurantId, t.name),
    restaurantIdx: index("menu_items_restaurant_idx").on(t.restaurantId),
  })
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("order_id").primaryKey(), // uuid string
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("pending"), // pending | confirmed | cancelled
    createdAt: integer("created_at").notNull().default(Math.floor(Date.now()/1000)),
  },
  (t) => ({
    restIdx: index("orders_restaurant_idx").on(t.restaurantId),
    userIdx: index("orders_user_idx").on(t.userId),
    createdIdx: index("orders_created_idx").on(t.createdAt),
  })
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),

    // FK to menu item for lineage (may be null if deleted)
    menuItemId: integer("menu_item_id").references(() => menuItems.id, { onDelete: "set null" }),

    quantity: integer("quantity").notNull().default(1),

    // Snapshot fields — immutable once created
    menuName: text("menu_name").notNull(),
    unitPrice: real("unit_price").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  })
);

// (Optional) drizzle relations if you plan to use db.query.* APIs
export const restaurantsRelations = relations(restaurants, ({ many, one }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
  }),
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
}));
```

---

## src/lib/auth.ts
```ts
import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";

// Supports either HS256 (shared secret) or RS256 (public key). Use one.
const alg = "HS256"; // change to "RS256" if using a keypair

async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (alg === "HS256") {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      return payload;
    } else {
      const publicKey = await crypto.subtle.importKey(
        "spki",
        Buffer.from(process.env.JWT_PUBLIC_KEY!, "base64"),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const { payload } = await jwtVerify(token, publicKey as any, { algorithms: ["RS256"] });
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
    isRestaurantOwner: Boolean(payload["is_restaurant_owner"]) || Boolean(payload["isRestaurantOwner"]),
  };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
```

---

## src/lib/validators.ts
```ts
import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const upsertMenuItemSchema = z.object({
  restaurantId: z.number().int().positive(),
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  category: z.string().optional(),
  available: z.boolean().default(true),
});

export const createOrderSchema = z.object({
  restaurant: z.number().int().positive(),
  items: z
    .array(
      z.object({
        menu_item: z.number().int().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
```

---

## src/actions/restaurants.ts
```ts
"use server";
import "server-only";
import { db } from "@/db/client";
import { restaurants } from "@/db/schema";
import { createRestaurantSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

export async function listRestaurantsByOwner(ownerId?: number) {
  const user = await requireUser();
  const id = ownerId ?? user.id;
  const rows = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, id))
    .orderBy(desc(restaurants.createdAt));
  return rows; // ✅ plain object/arrays only
}

export async function createRestaurant(form: FormData | { name: string; description?: string }) {
  const user = await requireUser();
  const payload = form instanceof FormData
    ? { name: String(form.get("name") || ""), description: String(form.get("description") || "") || undefined }
    : form;

  const parsed = createRestaurantSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  try {
    await db.insert(restaurants).values({
      ownerId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteRestaurant(id: number) {
  const user = await requireUser();
  try {
    await db.delete(restaurants).where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)));
    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

---

## src/actions/menu.ts
```ts
"use server";
import "server-only";
import { db } from "@/db/client";
import { menuItems, restaurants } from "@/db/schema";
import { upsertMenuItemSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

export async function listMenuItems(restaurantId: number) {
  // No auth restriction for listing (public)
  const rows = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(desc(menuItems.createdAt));
  return rows;
}

export async function createMenuItem(form: FormData | any) {
  const user = await requireUser();
  const data = form instanceof FormData ? {
    restaurantId: Number(form.get("restaurantId")),
    name: String(form.get("name") || ""),
    price: Number(form.get("price") || 0),
    description: (form.get("description") as string) || undefined,
    category: (form.get("category") as string) || undefined,
    available: String(form.get("available") || "true") === "true",
  } : form;

  const parsed = upsertMenuItemSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  // Ensure the current user owns the restaurant
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, parsed.data.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.insert(menuItems).values(parsed.data);
    revalidatePath(`/owner/restaurants/${parsed.data.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateMenuItem(id: number, patch: Partial<{ name: string; price: number; description?: string; category?: string; available: boolean }>) {
  const user = await requireUser();
  // enforce ownership by join against restaurants
  const [mi] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!mi) return { ok: false, error: "Not found" };
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, mi.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.update(menuItems).set(patch).where(eq(menuItems.id, id));
    revalidatePath(`/owner/restaurants/${mi.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteMenuItem(id: number) {
  const user = await requireUser();
  const [mi] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!mi) return { ok: false, error: "Not found" };
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, mi.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    revalidatePath(`/owner/restaurants/${mi.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

---

## src/actions/orders.ts
```ts
"use server";
import "server-only";
import { db } from "@/db/client";
import { orders, orderItems, menuItems, restaurants } from "@/db/schema";
import { createOrderSchema, updateOrderStatusSchema } from "@/lib/validators";
import { getSessionUser, requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function listOrders(params: { restaurant?: number; status?: string; ordering?: "created_at" | "-created_at" }) {
  const where: any[] = [];
  if (params.restaurant) where.push(eq(orders.restaurantId, params.restaurant));
  if (params.status) where.push(eq(orders.status, params.status));
  const orderBy = params.ordering === "created_at" ? orders.createdAt : desc(orders.createdAt);

  const rows = await db.select().from(orders)
    .where(where.length ? (and as any)(...where) : undefined)
    .orderBy(orderBy);
  return rows;
}

export async function getOrder(orderId: string) {
  const [row] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!row) return null;
  // you could join order items here if you prefer
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { ...row, items };
}

export async function createOrder(form: FormData | any) {
  const user = await requireUser();
  const data = form instanceof FormData ? {
    restaurant: Number(form.get("restaurant")),
    items: JSON.parse(String(form.get("items"))) as { menu_item: number; quantity: number }[],
  } : form;

  const parsed = createOrderSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  // Ensure all menu items belong to the same restaurant
  const menuIds = parsed.data.items.map((i) => i.menu_item);
  const menus = await db.select().from(menuItems).where((menuItems.id as any).in(menuIds));
  if (menus.length !== menuIds.length) return { ok: false, error: "Some menu items not found" };
  for (const m of menus) if (m.restaurantId !== parsed.data.restaurant) return { ok: false, error: "Menu items must belong to the specified restaurant" };

  // Create order + snapshots in a transaction
  const orderId = randomUUID();
  try {
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        userId: user.id,
        restaurantId: parsed.data.restaurant,
        status: "pending",
      });
      for (const it of parsed.data.items) {
        const m = menus.find((mm) => mm.id === it.menu_item)!;
        await tx.insert(orderItems).values({
          orderId,
          menuItemId: m.id,
          quantity: it.quantity,
          menuName: m.name, // snapshot
          unitPrice: m.price, // snapshot
        });
      }
    });
    revalidatePath("/orders");
    return { ok: true, order_id: orderId };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateOrderStatus(input: { orderId: string; status: "pending" | "confirmed" | "cancelled" }) {
  const user = await requireUser();
  // Only restaurant owner of this restaurant can update status
  const [ord] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!ord) return { ok: false, error: "Not found" };
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, ord.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));
    revalidatePath("/owner/orders");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

---

## Example page: app/owner/orders/page.tsx (server component + filters)
```tsx
// app/owner/orders/page.tsx
import { listOrders } from "@/actions/orders";

export default async function OwnerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams; // ✅ Next 15 async pattern
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v || "";
  };

  const rows = await listOrders({
    restaurant: get("restaurant") ? Number(get("restaurant")) : undefined,
    status: get("status") || undefined,
    ordering: (get("ordering") === "created_at" || get("ordering") === "-created_at")
      ? (get("ordering") as any)
      : "-created_at",
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>
      <pre className="text-sm bg-muted p-3 rounded">{JSON.stringify(rows, null, 2)}</pre>
      {/* Replace with your table + action buttons */}
    </div>
  );
}
```

---

## Example client widget that calls a Server Action (status buttons)
```tsx
"use client";
import { experimental_useOptimistic as useOptimistic, useTransition } from "react";
import { updateOrderStatus } from "@/actions/orders";

export function StatusButtons({ orderId, current }: { orderId: string; current: string }) {
  const [pending, start] = useTransition();

  const doSet = (status: "pending" | "confirmed" | "cancelled") => {
    start(async () => {
      const res = await updateOrderStatus({ orderId, status });
      // show toast via sonner if you want
      if (!res.ok) console.error(res.error);
    });
  };

  return (
    <div className="flex gap-2">
      <button disabled={pending} onClick={() => doSet("confirmed")} className="btn">Confirm</button>
      <button disabled={pending} onClick={() => doSet("cancelled")} className="btn">Cancel</button>
    </div>
  );
}
```

---

## Notes & pitfalls
- **Server Actions must return plain JSON-serializable data**. Don’t return `Response`, `Headers`, class instances, etc.
- Use `revalidatePath()` after any mutation so your RSC lists refresh.
- For **auth**, we’re reading your existing `access` cookie and verifying JWT. Swap to NextAuth if you prefer.
- If you need **Edge runtime**, switch the libsql client import to `@libsql/client/web` in route segments running at the edge.
- libSQL supports transactions; we wrapped `createOrder` in `db.transaction` to keep items in sync.


---

# AUTH (Email + Password, JWT cookie)

## 1) Update schema — add password hash on `users`
```ts
// src/db/schema.ts (append field on users)
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    isRestaurantOwner: integer("is_restaurant_owner", { mode: "boolean" })
      .notNull()
      .default(false),
    passwordHash: text("password_hash"), // <-- new
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  })
);
```
**Migration:** run `pnpm drizzle-kit generate && pnpm drizzle-kit push`.

> If you’re migrating real users from Django, passwords won’t carry over (hash formats differ). Easiest path for now: ask users to reset passwords, or seed fresh users.

---

## 2) Crypto helpers (hash, verify, sign JWT, set/clear cookie)
```ts
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
```

---

## 3) Server Actions: sign in / sign out
```ts
// src/actions/auth.ts
"use server";
import "server-only";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { authCookieOptions, signJwt, verifyJwt } from "@/lib/crypto";
import { verifyPassword, hashPassword } from "@/lib/crypto";

export async function signInAction(form: FormData | { email: string; password: string }) {
  const data = form instanceof FormData
    ? { email: String(form.get("email")), password: String(form.get("password")) }
    : form;

  if (!data.email || !data.password) return { ok: false, error: "Email and password are required" };

  const [u] = await db.select().from(users).where(eq(users.email, data.email.toLowerCase())).limit(1);
  if (!u || !u.passwordHash) return { ok: false, error: "Invalid credentials" };

  const valid = await verifyPassword(data.password, u.passwordHash);
  if (!valid) return { ok: false, error: "Invalid credentials" };

  const token = await signJwt({
    sub: String(u.id),
    email: u.email,
    is_restaurant_owner: !!u.isRestaurantOwner,
  });

  const cookieStore = await cookies();
  cookieStore.set("access", token, authCookieOptions());

  return { ok: true };
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("access");
  return { ok: true };
}

// (Optional) simple sign-up (dev only). Remove in prod or gate by admin.
export async function devSignUp(form: FormData | { email: string; password: string; fullName?: string; isRestaurantOwner?: boolean }) {
  const data = form instanceof FormData
    ? {
        email: String(form.get("email")),
        password: String(form.get("password")),
        fullName: String(form.get("fullName") || ""),
        isRestaurantOwner: String(form.get("isRestaurantOwner") || "false") === "true",
      }
    : form;
  if (!data.email || !data.password) return { ok: false, error: "Email & password required" };
  const hash = await hashPassword(data.password);
  try {
    await db.insert(users).values({
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      isRestaurantOwner: !!data.isRestaurantOwner,
      passwordHash: hash,
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

---

## 4) Login page + form (Client → Server Action)
```tsx
// app/login/page.tsx (Server Component)
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = (Array.isArray(sp.next) ? sp.next[0] : sp.next) || "/";
  return (
    <div className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <LoginForm next={next} />
    </div>
  );
}
```

```tsx
// src/components/LoginForm.tsx (Client Component)
"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInAction } from "@/actions/auth";

export default function LoginForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    start(async () => {
      const res = await signInAction(form);
      if (res.ok) router.replace(next);
      else alert(res.error || "Failed to sign in");
    });
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input name="email" type="email" className="w-full rounded border px-3 py-2" required />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Password</label>
        <input name="password" type="password" className="w-full rounded border px-3 py-2" required />
      </div>
      <button disabled={pending} className="w-full rounded bg-black text-white py-2">
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
```

---

## 5) Protect routes with Middleware
```ts
// middleware.ts (Edge runtime)
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

async function isAuthed(req: NextRequest) {
  const token = req.cookies.get("access")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const needAuth = url.pathname.startsWith("/owner");
  if (!needAuth) return NextResponse.next();

  const user = await isAuthed(req);
  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", url.pathname + url.search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*"],
};
```

---

## 6) TopBar logout hook-up (Server Action)
```tsx
// Example: components/TopBar.tsx (Client)
"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutAction } from "@/actions/auth";

export default function TopBarLogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await signOutAction(); router.refresh(); })}
      className="rounded px-3 py-2 border"
    >
      Logout
    </button>
  );
}
```

---

## 7) (Dev only) quick seed user
```ts
// scripts/dev-seed-user.ts (optional Node script with tsx or ts-node)
import "dotenv/config";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/crypto";

async function main() {
  const hash = await hashPassword("password123");
  await db.insert(users).values({
    email: "owner@example.com",
    fullName: "Owner One",
    isRestaurantOwner: 1 as any,
    passwordHash: hash,
  });
  console.log("Seeded owner@example.com / password123");
}
main();
```


---

# REGISTER (Sign Up) — Server Action + Page + Form

## 1) Validator
```ts
// src/lib/validators.ts (append)
import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(8),
    fullName: z.string().min(1).optional(),
    isRestaurantOwner: z.coerce.boolean().default(false),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
```

---

## 2) Action: `signUpAction`
```ts
// src/actions/auth.ts (append)
"use server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { authCookieOptions, signJwt } from "@/lib/crypto";
import { hashPassword } from "@/lib/crypto";
import { signUpSchema } from "@/lib/validators";

export async function signUpAction(form: FormData | {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  isRestaurantOwner?: boolean;
}) {
  const data = form instanceof FormData
    ? {
        email: String(form.get("email") || "").toLowerCase().trim(),
        password: String(form.get("password") || ""),
        confirmPassword: String(form.get("confirmPassword") || ""),
        fullName: (form.get("fullName") as string) || undefined,
        isRestaurantOwner: String(form.get("isRestaurantOwner") || "false") === "true",
      }
    : {
        ...form,
        email: String(form.email || "").toLowerCase().trim(),
        isRestaurantOwner: !!form.isRestaurantOwner,
      };

  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  // check if email exists
  const [existing] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing) return { ok: false, error: "Email already in use" };

  const hash = await hashPassword(parsed.data.password);
  try {
    const inserted = await db.insert(users).values({
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      isRestaurantOwner: parsed.data.isRestaurantOwner ? 1 as any : 0 as any,
      passwordHash: hash,
    }).returning({ id: users.id });

    const uid = inserted[0]?.id;
    const token = await signJwt({
      sub: String(uid),
      email: parsed.data.email,
      is_restaurant_owner: parsed.data.isRestaurantOwner,
    });
    const cookieStore = await cookies();
    cookieStore.set("access", token, authCookieOptions());
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

---

## 3) Page: `/register`
```tsx
// app/register/page.tsx (Server Component)
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/");

  const sp = await searchParams;
  const next = (Array.isArray(sp.next) ? sp.next[0] : sp.next) || "/";

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-muted-foreground">Join to manage your restaurants and orders.</p>
      <RegisterForm next={next} />
    </div>
  );
}
```

---

## 4) Component: `RegisterForm`
```tsx
// src/components/RegisterForm.tsx (Client Component)
"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/actions/auth";

export default function RegisterForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await signUpAction(form);
      if (res.ok) router.replace(next);
      else setError(typeof res.error === "string" ? res.error : "Check your inputs");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label className="text-sm">Full name</label>
        <input name="fullName" className="w-full rounded border px-3 py-2" placeholder="Juan Dela Cruz" />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input name="email" type="email" className="w-full rounded border px-3 py-2" required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input name="password" type="password" className="w-full rounded border px-3 py-2" required minLength={8} />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Confirm password</label>
          <input name="confirmPassword" type="password" className="w-full rounded border px-3 py-2" required minLength={8} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="isRestaurantOwner" type="checkbox" value="true" className="h-4 w-4" />
        I am a restaurant owner
      </label>
      <button disabled={pending} className="w-full rounded bg-black text-white py-2">
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-muted-foreground">
        Already have an account? <a href="/login" className="underline">Sign in</a>
      </p>
    </form>
  );
}
```

---

## 5) (Optional) Middleware tweak: redirect authed users away from /login & /register
```ts
// middleware.ts — optional addition
export const config = {
  matcher: ["/owner/:path*", "/login", "/register"],
};

// inside middleware(req):
if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") {
  const user = await isAuthed(req);
  if (user) return NextResponse.redirect(new URL("/", req.url));
}
```

**Done.** The register page creates a user, hashes their password, signs a JWT, sets the `access` HttpOnly cookie, and auto-logs them in before redirecting to `next` (defaults to `/`).


---

# Owner → Restaurants → View & Manage Menu

This adds:
- `/owner/restaurants` — list your restaurants with links
- `/owner/restaurants/[id]` — view a restaurant and **add/edit/delete** its menu items
- Client components: `AddMenuItemForm`, `MenuTable`

## 1) Actions: get one restaurant
```ts
// src/actions/restaurants.ts (append)
"use server";
import { db } from "@/db/client";
import { restaurants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/auth";

export async function getRestaurant(id: number) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)))
    .limit(1);
  return row || null;
}
```

> We already have `listMenuItems`, `createMenuItem`, `updateMenuItem`, `deleteMenuItem` in `src/actions/menu.ts`.

---

## 2) Page: `/owner/restaurants`
```tsx
// app/owner/restaurants/page.tsx
import Link from "next/link";
import { listRestaurantsByOwner } from "@/actions/restaurants";

export default async function OwnerRestaurantsPage() {
  const rows = await listRestaurantsByOwner();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">My Restaurants</h1>
      <ul className="divide-y rounded border">
        {rows.map((r) => (
          <li key={r.id} className="p-3 hover:bg-muted/50 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              {r.description && <div className="text-sm text-muted-foreground">{r.description}</div>}
            </div>
            <Link className="underline" href={`/owner/restaurants/${r.id}`}>Manage menu →</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 3) Page: `/owner/restaurants/[id]` (view + manage menu)
```tsx
// app/owner/restaurants/[id]/page.tsx
import { notFound } from "next/navigation";
import { getRestaurant } from "@/actions/restaurants";
import { listMenuItems } from "@/actions/menu";
import AddMenuItemForm from "@/components/AddMenuItemForm";
import MenuTable from "@/components/MenuTable";

export default async function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const [rest, items] = await Promise.all([
    getRestaurant(id),
    listMenuItems(id),
  ]);

  if (!rest) notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{rest.name}</h1>
        {rest.description && <p className="text-muted-foreground">{rest.description}</p>}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Add menu item</h2>
        <AddMenuItemForm restaurantId={id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Menu items</h2>
        <MenuTable restaurantId={id} initialItems={items} />
      </section>
    </div>
  );
}
```

---

## 4) Component: `AddMenuItemForm`
```tsx
// src/components/AddMenuItemForm.tsx
"use client";
import { useTransition, useState } from "react";
import { createMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";

export default function AddMenuItemForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("restaurantId", String(restaurantId));
    setError(null);
    start(async () => {
      const res = await createMenuItem(form);
      if (res.ok) {
        (e.currentTarget as HTMLFormElement).reset();
        router.refresh(); // will re-run the RSC and fetch latest
      } else setError(typeof res.error === "string" ? res.error : "Failed to add item");
    });
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-5">
      <input name="name" placeholder="Name" className="rounded border px-3 py-2 md:col-span-2" required />
      <input name="price" type="number" step="0.01" placeholder="Price" className="rounded border px-3 py-2" required />
      <input name="category" placeholder="Category" className="rounded border px-3 py-2" />
      <button disabled={pending} className="rounded bg-black text-white py-2">
        {pending ? "Adding…" : "Add"}
      </button>
      <input name="description" placeholder="Description (optional)" className="rounded border px-3 py-2 md:col-span-5" />
      {error && <div className="md:col-span-5 text-sm text-red-600">{error}</div>}
    </form>
  );
}
```

---

## 5) Component: `MenuTable` (inline edit + delete)
```tsx
// src/components/MenuTable.tsx
"use client";
import { useState, useTransition } from "react";
import { deleteMenuItem, updateMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";

export type MenuItem = {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  available: 0 | 1 | boolean;
};

export default function MenuTable({ restaurantId, initialItems }: { restaurantId: number; initialItems: MenuItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const onDelete = (id: number) => {
    if (!confirm("Delete this item?")) return;
    start(async () => {
      const res = await deleteMenuItem(id);
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        router.refresh();
      } else alert(res.error || "Failed to delete");
    });
  };

  const onSave = (id: number, form: HTMLFormElement) => {
    const fd = new FormData(form);
    const patch = {
      name: String(fd.get("name") || ""),
      price: Number(fd.get("price") || 0),
      description: (fd.get("description") as string) || undefined,
      category: (fd.get("category") as string) || undefined,
      available: String(fd.get("available") || "true") === "true",
    };
    start(async () => {
      const res = await updateMenuItem(id, patch);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else alert(res.error || "Failed to update");
    });
  };

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Available</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">No items yet</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              {editing === it.id ? (
                <EditableRow it={it} onCancel={() => setEditing(null)} onSave={(form) => onSave(it.id, form)} pending={pending} />
              ) : (
                <ReadRow it={it} onEdit={() => setEditing(it.id)} onDelete={() => onDelete(it.id)} />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReadRow({ it, onEdit, onDelete }: { it: MenuItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <td className="p-2">{it.name}</td>
      <td className="p-2">{it.category || "—"}</td>
      <td className="p-2">₱{Number(it.price).toFixed(2)}</td>
      <td className="p-2">{(it.available as any) ? "Yes" : "No"}</td>
      <td className="p-2 text-right space-x-2">
        <button onClick={onEdit} className="rounded border px-2 py-1">Edit</button>
        <button onClick={onDelete} className="rounded border px-2 py-1">Delete</button>
      </td>
    </>
  );
}

function EditableRow({ it, onCancel, onSave, pending }: { it: MenuItem; onCancel: () => void; onSave: (form: HTMLFormElement) => void; pending: boolean }) {
  return (
    <td colSpan={5} className="p-2">
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(e.currentTarget); }}
        className="grid gap-2 md:grid-cols-6 items-end"
      >
        <input name="name" defaultValue={it.name} className="rounded border px-3 py-2 md:col-span-2" />
        <input name="category" defaultValue={it.category ?? ""} className="rounded border px-3 py-2" />
        <input name="price" type="number" step="0.01" defaultValue={String(it.price)} className="rounded border px-3 py-2" />
        <select name="available" defaultValue={(it.available as any) ? "true" : "false"} className="rounded border px-3 py-2">
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <div className="flex gap-2 justify-end md:col-span-6">
          <button type="button" onClick={onCancel} className="rounded border px-3 py-2">Cancel</button>
          <button disabled={pending} className="rounded bg-black text-white px-3 py-2">{pending ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </td>
  );
}
```

---

### Usage
- Go to **/owner/restaurants** → click a restaurant → manage menu.
- Adding uses `createMenuItem(form)`; editing uses `updateMenuItem(id, patch)`; deleting uses `deleteMenuItem(id)`.
- After each mutation, the action already calls `revalidatePath()` so `router.refresh()` reflects latest data.

> You can later swap the basic buttons with shadcn Buttons/Dialogs and Sonner toasts without changing the data flow.


---

# Reviews (1–5) — one per user per restaurant, only if user has a **completed** order there

This adds a `reviews` table, wiring, and minimal UI so customers can rate restaurants once (1–5), only after at least one **completed** order.

## 1) Schema
```ts
// src/db/schema.ts (append new table + optional denormalized stats on restaurants)
import { sqliteTable, text, integer, real, unique, index } from "drizzle-orm/sqlite-core";

// Add these columns to restaurants (optional but recommended for quick averages)
export const restaurants = sqliteTable(
  "restaurants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at").notNull().default(Math.floor(Date.now()/1000)),
    // NEW ↓
    ratingAvg: real("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
  },
  (t) => ({
    ownerIdx: index("restaurants_owner_idx").on(t.ownerId),
    uniqNamePerOwner: unique().on(t.ownerId, t.name),
  })
);

// NEW TABLE: reviews
export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1..5 (validated in app)
    comment: text("comment"),
    createdAt: integer("created_at").notNull().default(Math.floor(Date.now()/1000)),
    updatedAt: integer("updated_at").notNull().default(Math.floor(Date.now()/1000)),
  },
  (t) => ({
    uniqUserRestaurant: unique().on(t.userId, t.restaurantId),
    restIdx: index("reviews_restaurant_idx").on(t.restaurantId),
  })
);
```
Run migrations:
```bash
pnpm drizzle-kit generate && pnpm drizzle-kit push
```

---

## 2) Validators
```ts
// src/lib/validators.ts (append)
import { z } from "zod";

export const createReviewSchema = z.object({
  restaurantId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
```

---

## 3) Actions: create/list/check review
```ts
// src/actions/reviews.ts
"use server";
import "server-only";
import { db } from "@/db/client";
import { reviews, restaurants, orders } from "@/db/schema";
import { createReviewSchema } from "@/lib/validators";
import { requireUser, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { and, eq, desc } from "drizzle-orm";

export async function listRestaurantReviews(restaurantId: number) {
  const rows = await db.select().from(reviews)
    .where(eq(reviews.restaurantId, restaurantId))
    .orderBy(desc(reviews.createdAt));
  return rows;
}

export async function getMyReview(restaurantId: number) {
  const user = await getSessionUser();
  if (!user) return null;
  const [row] = await db.select().from(reviews)
    .where(and(eq(reviews.restaurantId, restaurantId), eq(reviews.userId, user.id)))
    .limit(1);
  return row || null;
}

export async function canUserReview(restaurantId: number) {
  const user = await getSessionUser();
  if (!user) return { allowed: false, reason: "Sign in to review." };
  // must have at least one COMPLETED order at this restaurant
  const [o] = await db.select({ id: orders.id }).from(orders)
    .where(and(eq(orders.userId, user.id), eq(orders.restaurantId, restaurantId), eq(orders.status, "completed")))
    .limit(1);
  if (!o) return { allowed: false, reason: "You can review only after a completed order." };
  const existing = await getMyReview(restaurantId);
  if (existing) return { allowed: false, reason: "You already reviewed this restaurant." };
  return { allowed: true };
}

export async function createReview(form: FormData | { restaurantId: number; rating: number; comment?: string }) {
  const user = await requireUser();
  const data = form instanceof FormData
    ? {
        restaurantId: Number(form.get("restaurantId")),
        rating: Number(form.get("rating")),
        comment: (form.get("comment") as string) || undefined,
      }
    : form;

  const parsed = createReviewSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  // rule 1: must have a completed order
  const [o] = await db.select({ id: orders.id }).from(orders)
    .where(and(eq(orders.userId, user.id), eq(orders.restaurantId, parsed.data.restaurantId), eq(orders.status, "completed")))
    .limit(1);
  if (!o) return { ok: false, error: "You can only review after a completed order." };

  // rule 2: only one review per user per restaurant
  const [existing] = await db.select().from(reviews)
    .where(and(eq(reviews.userId, user.id), eq(reviews.restaurantId, parsed.data.restaurantId)))
    .limit(1);
  if (existing) return { ok: false, error: "You have already reviewed this restaurant." };

  // insert + update restaurant aggregates atomically
  try {
    await db.transaction(async (tx) => {
      const now = Math.floor(Date.now() / 1000);
      await tx.insert(reviews).values({
        userId: user.id,
        restaurantId: parsed.data.restaurantId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        createdAt: now,
        updatedAt: now,
      });

      const [agg] = await tx.select({ avg: restaurants.ratingAvg, cnt: restaurants.ratingCount })
        .from(restaurants)
        .where(eq(restaurants.id, parsed.data.restaurantId))
        .limit(1);
      const prevAvg = agg?.avg ?? 0;
      const prevCnt = agg?.cnt ?? 0;
      const newCnt = prevCnt + 1;
      const newAvg = (prevAvg * prevCnt + parsed.data.rating) / newCnt;
      await tx.update(restaurants)
        .set({ ratingAvg: newAvg, ratingCount: newCnt })
        .where(eq(restaurants.id, parsed.data.restaurantId));
    });

    revalidatePath(`/restaurants/${parsed.data.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
```

---

## 4) UI — Add to Restaurant page

### Server component section on `/restaurants/[id]`
```tsx
// app/restaurants/[id]/page.tsx (excerpt) — add this near the bottom
import { listMenuItems } from "@/actions/menu";
import { listRestaurantReviews, getMyReview, canUserReview } from "@/actions/reviews";
import CreateReviewForm from "@/components/CreateReviewForm";

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  // ... fetch restaurant (public) + items
  const [items, reviews, myReview, reviewGate] = await Promise.all([
    listMenuItems(id),
    listRestaurantReviews(id),
    getMyReview(id),
    canUserReview(id),
  ]);

  return (
    <div className="space-y-8">
      {/* your header + menu UI here */}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <div className="text-sm text-muted-foreground">
          Average rating: {/* assume you've fetched restaurant.ratingAvg & ratingCount */}
        </div>

        {myReview ? (
          <div className="rounded border p-3 text-sm">
            <div className="font-medium">Your review</div>
            <div>Rating: {myReview.rating} / 5</div>
            {myReview.comment && <p className="mt-1">{myReview.comment}</p>}
          </div>
        ) : reviewGate.allowed ? (
          <CreateReviewForm restaurantId={id} />
        ) : (
          <div className="rounded border p-3 text-sm">{reviewGate.reason}</div>
        )}

        <ul className="divide-y rounded border">
          {reviews.length === 0 && (
            <li className="p-3 text-sm text-muted-foreground">No reviews yet.</li>
          )}
          {reviews.map((r) => (
            <li key={r.id} className="p-3 space-y-1">
              <div className="text-sm">Rating: {r.rating} / 5</div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

### Client form
```tsx
// src/components/CreateReviewForm.tsx
"use client";
import { useTransition, useState } from "react";
import { createReview } from "@/actions/reviews";
import { useRouter } from "next/navigation";

export default function CreateReviewForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("restaurantId", String(restaurantId));
    setError(null);
    start(async () => {
      const res = await createReview(fd);
      if (res.ok) {
        (e.currentTarget as HTMLFormElement).reset();
        router.refresh();
      } else setError(typeof res.error === "string" ? res.error : "Failed to submit review");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border p-3">
      <div className="space-y-1">
        <label className="text-sm">Rating</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <label key={n} className="flex items-center gap-1 text-sm">
              <input type="radio" name="rating" value={n} required /> {n}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm">Comment (optional)</label>
        <textarea name="comment" rows={3} className="w-full rounded border px-3 py-2" placeholder="Share a few words about your experience" />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button disabled={pending} className="rounded bg-black text-white px-4 py-2">
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
```

---

## 5) Notes / Options
- **Rule scope**: I used `status = "completed"` for the eligibility check. If you prefer allowing after **confirmed** too, change the predicate to `orders.status IN ("confirmed","preparing","completed")`.
- **Editing reviews**: Spec says *once*. If you want edits, we’ll add an `updateReview` action that adjusts `ratingAvg` with the delta.
- **Averages**: Using `restaurants.ratingAvg/ratingCount` keeps the page fast. You can also compute with a query if you don’t want denormalized columns.
- **Owner view**: On `/owner/restaurants/[id]`, you can render the average and review count to the owner, but not allow them to write reviews.
