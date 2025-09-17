// components/TopRestaurants.tsx
import { listTopRestaurants } from "@/actions/restaurants";
import Link from "next/link";
import { RestaurantCard } from "@/components/home/RestaurantCard";

export default async function TopRestaurants({
  limit = 5,
  includeUnrated = false,
}: {
  limit?: number;
  includeUnrated?: boolean;
}) {
  const top = await listTopRestaurants({ limit, includeUnrated });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Top Rated Restaurants</h2>

      {top.length === 0 ? (
        <p className="text-muted-foreground">No rated restaurants yet.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-6">
          {top.map((r) => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </ul>
      )}
    </section>
  );
}
