import { drfFetch } from "@/lib/drf";
import { listRestaurants } from "@/actions/restaurant";
import Link from "next/link";

export const revalidate = 60; // ISR every minute (optional). Remove to make it SSR-only.

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams?.q || "";
  const restaurants = await listRestaurants(q);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Restaurants</h2>
      <form className="mt-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search restaurants…"
          className="border rounded px-3 py-2 w-full"
        />
      </form>
      <ul className="divide-y rounded-lg border">
        {restaurants.map((r: any) => (
          <li key={r.id} className="p-0">
            <Link
              href={`/restaurants/${r.id}`} // or r.slug if you have slugs
              className="block p-4 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none"
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
