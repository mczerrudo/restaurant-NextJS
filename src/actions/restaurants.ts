"use server";
import "server-only";
import { db } from "@/db/index";
import { restaurants } from "@/db/schema";
import { createRestaurantSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc, like, gt, sql } from "drizzle-orm";

export async function listRestaurants(search: string = "") {
  const rows = await db
    .select()
    .from(restaurants)
    .where(like(restaurants.name, `%${search}%`)); // will match all if search = ""

  return rows;
}

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

export async function createRestaurant(_: any,
  form: FormData | { name: string; description?: string; address:string}
) {
  const user = await requireUser();
  const payload =
    form instanceof FormData
      ? {
          name: String(form.get("name") || ""),
          description: String(form.get("description") || ""),
          address: String(form.get("address") || "")|| undefined,
        }
      : form;

  const parsed = createRestaurantSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  try {
    await db.insert(restaurants).values({
      ownerId: user.id,
      name: parsed.data.name,
      address: parsed.data.address,
      description: parsed.data.description,
    });
    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteRestaurant(_: any, form: FormData | { id: number }) {
  const user = await requireUser();
  const id = form instanceof FormData ? Number(form.get("id")) : form.id;
  try {
    console.log(user,id)
    await db
      .delete(restaurants)
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)));
    revalidatePath("/owner/restaurants");
    console.log(user,id)
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateRestaurant(
 _: any,
  form: FormData | { id: number; name: string; description?: string; address:string }
) {
  try {
    const user = await requireUser();

    const { id, name, description, address } = form instanceof FormData
      ? {
          id: Number(form.get("id")),
          name: String(form.get("name") || ""),
          description: String(form.get("description") || ""),
          address: String(form.get("address") || "")|| undefined,
        }
      : { id: form.id, name: form.name, description: form.description ,address: form.address};

    // Only allow updating restaurants owned by the user
    const result = await db
      .update(restaurants)
      .set({ name, description,address })
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)))
      .returning({ id: restaurants.id });

    if (result.length === 0) {
      return { ok: false, error: "Restaurant not found or not authorized" };
    }

    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to update restaurant" };
  }
}

export async function getRestaurantByOwner(id: number) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)))
    .limit(1);
  return row || null;
}

export async function getRestaurant(id: number) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);
  return row || null;

}

export async function listTopRestaurants(opts?: { limit?: number; includeUnrated?: boolean }) {
  const limit = opts?.limit ?? 5;
  const includeUnrated = opts?.includeUnrated ?? false;

  const where = includeUnrated ? undefined : gt(restaurants.ratingCount, 0);

  const rows = await db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      description: restaurants.description,
      address: restaurants.address,
      ratingAvg: restaurants.ratingAvg,
      ratingCount: restaurants.ratingCount,
      createdAt: restaurants.createdAt,
    })
    .from(restaurants)
    .where(where)
    .orderBy(
      desc(restaurants.ratingAvg),
      desc(restaurants.ratingCount),
      desc(restaurants.createdAt)
    )
    .limit(limit);

  return rows;
}

export async function listRandomRestaurants(limit = 12) {
  return db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      description: restaurants.description,
      address: restaurants.address,
      ratingAvg: restaurants.ratingAvg,
      ratingCount: restaurants.ratingCount,
    })
    .from(restaurants)
    // SQLite/libSQL random ordering:
    .orderBy(sql`RANDOM()`)
    .limit(limit);
}


export type HeroStats = {
  totalRestaurants: number;
  ratedRestaurants: number;
  totalRatings: number;
  averageRating: number | null; // weighted by ratingCount
};

export async function getHeroStats(): Promise<HeroStats> {
  const [row] = await db
    .select({
      totalRestaurants: sql<number>`coalesce(count(*), 0)`,
      ratedRestaurants: sql<number>`
        coalesce(sum(case when ${restaurants.ratingCount} > 0 then 1 else 0 end), 0)
      `,
      totalRatings: sql<number>`coalesce(sum(${restaurants.ratingCount}), 0)`,
      weightedRatingSum: sql<number>`
        coalesce(sum(${restaurants.ratingAvg} * ${restaurants.ratingCount}), 0)
      `,
    })
    .from(restaurants);

  const averageRating =
    Number(row.totalRatings) > 0
      ? Number(row.weightedRatingSum) / Number(row.totalRatings)
      : null;

  return {
    totalRestaurants: Number(row.totalRestaurants),
    ratedRestaurants: Number(row.ratedRestaurants),
    totalRatings: Number(row.totalRatings),
    averageRating,
  };
}

// optional: pretty print counts (1.2k+, 3.4m+ …)
