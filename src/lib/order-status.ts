// lib/order-status.ts
export type OrderStatus = "pending" | "confirmed" | "preparing" | "completed" | "cancelled";
export type Role = "customer" | "owner";

const ownerTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const customerTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending:   ["cancelled"],
  confirmed: [],
  preparing: [],
  completed: [],
  cancelled: [],
};

export function canTransition(role: Role, from: OrderStatus, to: OrderStatus) {
  const map = role === "owner" ? ownerTransitions : customerTransitions;
  return map[from]?.includes(to) ?? false;
}
