import { drfFetch } from "@/lib/drf";
import { getRestaurant } from "@/actions/restaurant";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const r = await getRestaurant(Number(params.id));
  console.log("restaurant", r);
  return { title: `${r.name} • React Restaurant` };
}

export default async function RestaurantDetail({
  params,
}: {
  params: { id: string };
}) {
  const r = await getRestaurant(Number(params.id));
  console.log("restaurant", r);
  const items = r.menu_items ?? [];

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{r.name}</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((m: any) => (
          <li key={m.id} className="border rounded p-3">
            <div className="font-medium">{m.name}</div>
            <div className="opacity-70">₱{Number(m.price).toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
