"use server";
import "server-only";
import { db } from "@/db/index";
import { orders, orderItems, menuItems, restaurants } from "@/db/schema";
import { createOrderSchema, updateOrderStatusSchema } from "@/lib/validators";
import { getSessionUser, requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { inArray, eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { OrderStatus } from "@/lib/definitions";
import { canTransition } from "@/lib/order-status";

export async function listOrders(params: {
  restaurant?: number;
  status?: OrderStatus;
  ordering?: "created_at" | "-created_at";
}) {
  const where: any[] = [];
  if (params.restaurant) where.push(eq(orders.restaurantId, params.restaurant));
  
  if (params.status) where.push(eq(orders.status, params.status));

  const orderBy =
    params.ordering === "created_at"
      ? orders.createdAt
      : desc(orders.createdAt);

  // base order rows
  const rows = await db
    .select()
    .from(orders)
    .where(where.length ? (and as any)(...where) : undefined)
    .orderBy(orderBy);

  if (rows.length === 0) return rows;

  // fetch all items for these orders in one query
  const orderIds = rows.map((r) => r.id);
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  // group items by orderId
  const itemsByOrder = new Map<string, typeof items>();
  for (const it of items) {
    const arr = itemsByOrder.get(it.orderId) ?? [];
    arr.push(it);
    itemsByOrder.set(it.orderId, arr);
  }

  // attach items[] to each row
  return rows.map((o) => ({
    ...o,
    items: itemsByOrder.get(o.id) ?? [],
  }));
}

export async function getOrder(orderId: string) {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!row) return null;
  // you could join order items here if you prefer
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  return { ...row, items };
}

type OrderItemIn = { menu_item: number | string; quantity: number };
type OrderCreatePayload = { restaurant: number; items: OrderItemIn[] };

export async function createOrder(payload: OrderCreatePayload) {
  const user = await requireUser();

  const parsed = createOrderSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten() };
  }

  const { restaurant, items } = parsed.data;

  if (items.length === 0) {
    return { ok: false, error: "At least one item is required" };
  }

  // Collect menu IDs and fetch them in one query
  const menuIds = items.map((i) => i.menu_item);

  const menus = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, menuIds));

  if (menus.length !== menuIds.length) {
    return { ok: false, error: "Some menu items not found" };
  }

  // Ensure all belong to the same restaurant
  for (const m of menus) {
    if (m.restaurantId !== restaurant) {
      return {
        ok: false,
        error: "Menu items must belong to the specified restaurant",
      };
    }
  }

  // Faster lookup per item
  const menusById = new Map(menus.map((m) => [m.id, m]));

  const orderId = randomUUID();
  try {
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        userId: user.id,
        restaurantId: restaurant,
        status: "pending",
      });

      for (const it of items) {
        const m = menusById.get(it.menu_item);
        if (!m) throw new Error(`Menu item ${it.menu_item} not found`);

        await tx.insert(orderItems).values({
          orderId,
          menuItemId: m.id,
          quantity: it.quantity,
          menuName: m.name, // snapshot
          unitPrice: m.price, // snapshot
          itemSubtotal: it.quantity * m.price, // snapshot
        });
      }
    });

    revalidatePath("/orders");
    return { ok: true, order_id: orderId };
  } catch (e: any) {
    return { ok: false, error: e.message || "Failed to create order" };
  }
}

export async function updateOrderStatus(orderId: string, next: OrderStatus) {
  const user = await requireUser();
  const res = await getOrderWithRestaurant(orderId); // must include: order.userId, order.restaurant.ownerId, order.status
  if (!res) return { ok: false, message: "Order not found" };
  const { order, restaurant } = res;

  const role: "customer" | "owner" =
    user.isRestaurantOwner && restaurant?.ownerId === user.id ? "owner"
    : order.userId === user.id ? "customer"
    : null as never;

  if (!role) return { ok: false, message: "Not authorized for this order" };

  if (!canTransition(role, order.status as OrderStatus, next))
    return { ok: false, message: `Illegal transition: ${role} cannot set ${order.status} → ${next}` };

  // Optional: prevent changing once completed/cancelled
  if (order.status === "completed" || order.status === "cancelled")
    return { ok: false, message: "Order is already finalized" };

  await db.update(orders).set({ status: next }).where(eq(orders.id, orderId));
  
  revalidatePath("/orders");
  revalidatePath("/owner")
  return { ok: true };
}


export async function getOrderWithRestaurant(orderId: string) {
  const row = await db
    .select({
      order: orders,
      restaurant: restaurants,
    })
    .from(orders)
    .leftJoin(restaurants, eq(restaurants.id, orders.restaurantId))
    .where(eq(orders.id, orderId))
    .limit(1);

  return row[0]; // contains { order, restaurant }
}
