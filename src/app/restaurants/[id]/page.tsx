import { getRestaurant } from "@/actions/restaurants";
import { listMenuItems } from "@/actions/menu";
import MenuItem from "@/components/restaurant/menu-items";

export default async function RestaurantDetail({
  params,
}: {
  params: { id: string };
}) {
  const p = await params;
  const r = await getRestaurant(Number(p.id));
  const items = await listMenuItems(r.id);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">{r.name}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((m: any) => (
          <MenuItem key={m.id} m={m} />
        ))}
      </div>
    </main>
  );
}
