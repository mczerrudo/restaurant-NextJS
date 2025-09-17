// components/RestaurantCard.tsx
import Link from "next/link";
import { Search, Utensils, Star, MapPin } from "lucide-react";
export function RestaurantCard({
  r,
}: {
  r: {
    id: number;
    name: string;
    description: string | null;
    address: string | null;
    ratingAvg: number;
    ratingCount: number;
  };
}) {
  return (
    <li className="snap-start shrink-0 w-72 rounded-2xl border p-4 mr-4 bg-card hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium">
          <Link href={`/restaurants/${r.id}`} className="hover:underline">
            {r.name}
          </Link>
        </h3>
        {r.ratingCount > 0 ? (
          <div className="flex items-center gap-1 text-sm">
            <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-amber-400 mr-1" />
              {r.ratingAvg.toFixed(1)}
            </div>
            <span className="text-gray-500 text-xs">
              {r.ratingCount} review{r.ratingCount !== 1 && "s"}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Not yet rated</span>
        )}
      </div>

      {r.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {r.description}
        </p>
      )}
      {r.address && (
        <p className="mt-1 text-xs text-muted-foreground">{r.address}</p>
      )}
    </li>
  );
}
