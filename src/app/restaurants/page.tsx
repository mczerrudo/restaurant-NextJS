import { listRestaurants } from "@/actions/restaurants";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Utensils, Star, MapPin } from "lucide-react";

export const revalidate = 60;

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const sp = await searchParams;
  const q = sp?.q || "";
  const restaurants = await listRestaurants(q);

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Restaurants</h1>
        <p className="text-gray-600">
          Discover and order from your favorite local restaurants
        </p>
      </div>

      <form className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search restaurants by name..."
          className="pl-10 py-6 text-base border-gray-300 focus:border-primary"
        />
      </form>

      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {restaurants.length} Restaurant{restaurants.length !== 1 ? "s" : ""}{" "}
            Available
          </h2>
          {q && (
            <p className="text-sm text-gray-500">
              Results for "<span className="font-medium">{q}</span>"
            </p>
          )}
        </div>

        {restaurants.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto bg-gray-100 rounded-full p-4 w-fit mb-4">
                <Utensils className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No restaurants found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {q
                  ? `No results for "${q}". Try a different search term.`
                  : "No restaurants available at the moment."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurants.map((r: any) => (
              <Link key={r.id} href={`/restaurants/${r.id}`}>
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {r.name}
                      </CardTitle>
                      {r.ratingAvg ? (
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
                        <span className="text-xs text-gray-500 italic">
                          Not yet rated
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {r.address && (
                        <div className="flex items-start text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{r.address}</span>
                        </div>
                      )}
                      {r.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>View Menu →</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
