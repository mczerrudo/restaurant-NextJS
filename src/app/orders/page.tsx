import { listOrders } from "@/actions/order";
import { listRestaurants } from "@/actions/restaurant"; // must return [{id,name}, ...]
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrdersFilters from "@/components/orders/filter";

export const dynamic = "force-dynamic";

function pesos(n: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(n);
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {

  const sp = await searchParams;

  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v || "";
  };


  const restaurants = await listRestaurants(); // dropdown data
  const orders = await listOrders({
    restaurant: get("restaurant"),
    status: get("status"),
    ordering: (get("ordering") === "created_at" || get("ordering") === "-created_at")
      ? (get("ordering") as "-created_at" | "created_at")
      : "-created_at",
  }); 

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      <OrdersFilters restaurants={restaurants || []} />

      {(!orders || orders.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>No orders yet</CardTitle>
            <CardDescription className="text-gray-600">
              You don’t have any orders yet. When you place one, it’ll show up here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-4">
        {orders?.map((o: any) => {
          const total = o.items?.reduce((sum: number, i: any) => sum + Number(i.item_subtotal ?? 0), 0) ?? 0;
          const created = o.created_at ? new Date(o.created_at).toLocaleString() : "—";

          return (
            <Card key={o.order_id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base sm:text-lg">Order #{o.order_id}</CardTitle>
                  <CardDescription>Placed on {created}</CardDescription>
                </div>
                <Badge variant="secondary" className="capitalize">{o.status}</Badge>
              </CardHeader>

              <CardContent className="space-y-2">
                {o.items?.length ? (
                  <ul className="space-y-1 text-sm">
                    {o.items.map((i: any) => (
                      <li key={i.id} className="flex items-center justify-between">
                        <span className="truncate">{i.menu_item?.name ?? "Item"} × {i.quantity ?? 0}</span>
                        <span className="tabular-nums">{pesos(Number(i.item_subtotal ?? 0))}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}
              </CardContent>

              <Separator className="my-2" />

              <CardFooter className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-semibold tabular-nums">{pesos(total)}</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
