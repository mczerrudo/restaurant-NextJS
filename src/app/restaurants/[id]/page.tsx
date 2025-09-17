import { getRestaurant } from "@/actions/restaurants";
import { listMenuItems } from "@/actions/menu";
import MenuItem from "@/components/restaurant/menu-items";
import {
  listRestaurantReviews,
  getMyReview,
  canUserReview,
} from "@/actions/reviews";
import ReviewsPanel from "@/components/restaurant/ReviewsPanel";
import { Star, MapPin, Clock, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function RestaurantDetail({
  params,
}: {
  params: { id: string };
}) {
  const p = await params;
  const id = Number(p.id);

  const [r, items, reviews, myReview, reviewGate] = await Promise.all([
    getRestaurant(id),
    listMenuItems(id),
    listRestaurantReviews(id),
    getMyReview(id),
    canUserReview(id),
  ]);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Restaurant Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {r?.name}
          </h1>
          {r?.ratingAvg !== null && (
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="ml-1 font-bold text-gray-900">
                  {r.ratingAvg?.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">({r.ratingCount} reviews)</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {r?.address && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {r.address}
            </div>
          )}
        </div>

        {r?.description && (
          <p className="mt-4 text-gray-700 leading-relaxed max-w-3xl">
            {r.description}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Reviews Sidebar - Sticky on desktop */}
        <aside className="w-full lg:w-1/4 lg:sticky lg:top-20 lg:self-start">
          <ReviewsPanel
            restaurantId={id}
            average={r?.ratingAvg ?? null}
            ratingCount={r?.ratingCount ?? null}
            myReview={myReview}
            reviews={reviews}
            reviewGate={reviewGate}
          />
        </aside>

        {/* Menu Section */}
        <section className="w-full lg:w-3/4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Menu</h2>
              <span className="text-sm text-gray-500">
                {items.length} items
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No menu items available yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {items.map((m: any) => (
                  <MenuItem key={m.id} m={m} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
