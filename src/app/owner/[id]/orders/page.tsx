import { listOrders } from "@/actions/orders";
import { listRestaurants } from "@/actions/restaurants"; // must return [{id,name}, ...]
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrdersFilters from "@/components/orders/filter";
import { Car } from "lucide-react";
import { OrderStatus } from "@/lib/definitions";
import { OwnerStatus } from "@/components/orders/OwnerStatus";
import {
  ShoppingCart,
  User,
  Calendar,
  Utensils,
  Store,
  Filter,
  BarChart3,
} from "lucide-react";
import { OrderStatistics } from "@/components/orders/orderStatistics";
import { OrdersList } from "@/components/orders/orderList";
import { getRestaurant } from "@/actions/restaurants";

export const dynamic = "force-dynamic";

function pesos(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);
}

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v || "";
  };
  function parseStatus(s: unknown): OrderStatus | undefined {
    return s === "all" || s == null ? undefined : (s as OrderStatus);
  }

  const p = await params;
  const restaurantId = p.id;
  const restaurants = await getRestaurant(Number(restaurantId)); // dropdown data
  const orders = await listOrders({
    restaurant: restaurantId ? Number(restaurantId) : undefined,
    status: parseStatus(get("status")),
    ordering:
      get("ordering") === "created_at" || get("ordering") === "-created_at"
        ? (get("ordering") as any)
        : "-created_at",
  });
  const ordering = get("ordering");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {restaurants.name}
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage your order history
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4 lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Orders
              </h2>
              <OrdersFilters restaurants={[restaurants]} isOwner={true} />
            </div>

            <OrderStatistics orders={orders} />
          </div>

          {/* Orders List */}
          <div className="w-full lg:w-3/4">
            <OrdersList
              orders={orders}
              restaurants={[restaurants]}
              ordering={ordering}
              isOwner={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
