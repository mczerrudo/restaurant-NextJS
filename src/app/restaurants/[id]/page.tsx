import { getRestaurant } from "@/actions/restaurant";
import { listMenuItems } from "@/actions/menu-item";
import MenuItem from "@/components/restaurant/menu-items";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const r = await getRestaurant(Number(params.id));
  return { title: `${r.name} • React Restaurant` };
}

export default async function RestaurantDetail({
  params,
}: {
  params: { id: string };
}) {
  const r = await getRestaurant(Number(params.id));
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
