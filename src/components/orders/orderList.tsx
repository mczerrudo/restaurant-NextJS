"use client";

import { Calendar, Utensils, Store, User, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CustomerStatus } from "@/components/orders/CustomerStatus";
import { OwnerStatus } from "@/components/orders/OwnerStatus";
function pesos(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);
}

export function OrdersList({
  orders = [],
  restaurants = [],
  ordering,
  isOwner,
}: {
  orders?: any[];
  restaurants?: any[];
  ordering: string;
  isOwner: boolean;
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
        <div className="mx-auto bg-gray-100 rounded-full p-3 w-fit mb-4">
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          You don't have any orders yet. When you place one, it'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-4 flex justify-between items-center border border-gray-200">
        <h2 className="text-lg font-semibold">
          {orders.length} Order{orders.length !== 1 ? "s" : ""}
        </h2>
        <div className="text-sm text-gray-500">
          Sorted by: {ordering === "created_at" ? "Oldest" : "Newest"}
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((o: any) => {
          const total =
            o.items?.reduce(
              (sum: number, i: any) => sum + Number(i.itemSubtotal ?? 0),
              0
            ) ?? 0;

          const created = o.createdAt
            ? new Date(o.createdAt).toLocaleString()
            : "—";

          return (
            <div
              key={o.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">
                        Order #{o.id.slice(0, 8)}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Placed on {created}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Restaurant:{" "}
                      {restaurants.find((r) => r.id === o.restaurantId)?.name ||
                        "Unknown"}
                    </p>
                  </div>
                  {isOwner ? (
                    <OwnerStatus order={{ id: o.id, status: o.status }} />
                  ) : (
                    <CustomerStatus order={{ id: o.id, status: o.status }} />
                  )}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-700">
                      <Utensils className="h-4 w-4" />
                      Order Items
                    </h4>
                    {o.items?.length ? (
                      <ul className="space-y-2 text-sm">
                        {o.items.map((i: any) => (
                          <li
                            key={i.id}
                            className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="truncate">
                              {i.menuName ?? "Item"} × {i.quantity ?? 0}
                            </span>
                            <span className="tabular-nums font-medium">
                              {pesos(Number(i.itemSubtotal ?? 0))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No items</p>
                    )}
                  </div>

                  <div className="md:w-48 shrink-0">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-gray-700">
                      <Store className="h-4 w-4" />
                      Summary
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{pesos(total)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{pesos(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Footer */}
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    Customer ID: {o.userId || "N/A"}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Order Total</span>
                    <span className="font-semibold tabular-nums text-lg text-gray-800">
                      {pesos(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
