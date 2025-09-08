import { drfFetch } from "@/lib/drf";

export const revalidate = 60; // ISR every minute (optional). Remove to make it SSR-only.

export default async function RestaurantsPage({
  searchParams,
}: { searchParams: { q?: string } }) {
  const q = searchParams?.q || "";
  const qs = q ? `?name__icontains=${encodeURIComponent(q)}` : "";
  const res = await drfFetch(`/restaurants/${qs}`, {}, { revalidate: 60 });
  const restaurants = res.results ?? res;

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
          <li key={r.id} className="p-4">{r.name}</li>
        ))}
      </ul>
    </main>
  );
}
