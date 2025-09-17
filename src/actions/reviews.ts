// src/actions/reviews.ts
"use server";
import "server-only";
import { db } from "@/db/index";
import { reviews, restaurants, orders } from "@/db/schema";
import { createReviewSchema } from "@/lib/validators";
import { requireUser, getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { and, eq, desc, sql } from "drizzle-orm";

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

async function recomputeRestaurantRating(restaurantId: number) {
  const [agg] = await db
    .select({
      count: sql<number>`coalesce(count(*), 0)`,
      sum: sql<number>`coalesce(sum(${reviews.rating}), 0)`,
    })
    .from(reviews)
    .where(eq(reviews.restaurantId, restaurantId));

  const ratingCount = Number(agg.count);
  const ratingAvg = ratingCount > 0 ? Number(agg.sum) / ratingCount : 0;

  await db
    .update(restaurants)
    .set({ ratingAvg, ratingCount })
    .where(eq(restaurants.id, restaurantId));
}

export async function updateMyReview(restaurantId: number, input: { rating: number; comment?: string | null }) {
  const user = await requireUser();

  // upsert-or-update only the current user's review for this restaurant
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.restaurantId, restaurantId), eq(reviews.userId, user.id)))
    .limit(1);

  if (!existing) {
    // If you do NOT want to allow creating here, throw instead.
    // return { ok: false, message: "No existing review to edit." };
    await db.insert(reviews).values({
      restaurantId,
      userId: user.id,
      rating: input.rating,
      comment: input.comment ?? null,
      createdAt: Math.floor(Date.now() / 1000),
    });
  } else {
    await db
      .update(reviews)
      .set({
        rating: input.rating,
        comment: input.comment ?? null,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(reviews.id, existing.id));
  }

  await recomputeRestaurantRating(restaurantId);
  return { ok: true };
}

export async function deleteMyReview(restaurantId: number) {
  const user = await requireUser();

  await db
    .delete(reviews)
    .where(and(eq(reviews.restaurantId, restaurantId), eq(reviews.userId, user.id)));

  await recomputeRestaurantRating(restaurantId);
  return { ok: true };
}