import { drfFetch } from "@/lib/drf";
import { listRestaurants } from "@/actions/restaurants";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const revalidate = 60; // ISR every minute (optional). Remove to make it SSR-only.

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const sp = await searchParams;
  const q = sp?.q || "";
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
      <Card>
        <CardHeader>
          <CardTitle>Restaurant List</CardTitle>
          <CardDescription>Find your favorite restaurant</CardDescription>
        </CardHeader>
        <CardContent className="max-h overflow-y-scroll">
          <ul className="grid gap-4">
            {restaurants.map((r : any) => (
              <li key={r.id}>
                <Link
                  href={`/restaurants/${r.id}`}
                  className="block p-4 rounded-md outline-1 focus:bg-white/10 focus:outline-none hover:bg-white/10"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
