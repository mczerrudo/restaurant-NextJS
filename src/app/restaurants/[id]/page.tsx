import { getRestaurant } from "@/actions/restaurants";
import { listMenuItems } from "@/actions/menu";
import MenuItem from "@/components/restaurant/menu-items";
import {
  listRestaurantReviews,
  getMyReview,
  canUserReview,
} from "@/actions/reviews";
import CreateReviewForm from "@/components/restaurant/createReviewForm";

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
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-semibold">{r?.name}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((m: any) => (
          <MenuItem key={m.id} m={m} />
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <div className="text-sm text-muted-foreground">
          Average rating:{r.ratingAvg}
          
        </div>

        {myReview ? (
          <div className="rounded border p-3 text-sm">
            <div className="font-medium">Your review</div>
            <div>Rating: {myReview.rating} / 5</div>
            {myReview.comment && <p className="mt-1">{myReview.comment}</p>}
          </div>
        ) : reviewGate.allowed ? (
          <CreateReviewForm restaurantId={id} />
        ) : (
          <div className="rounded border p-3 text-sm">{reviewGate.reason}</div>
        )}

        <ul className="divide-y rounded border">
          {reviews.length === 0 && (
            <li className="p-3 text-sm text-muted-foreground">
              No reviews yet.
            </li>
          )}
          {reviews.map((r) => (
            <li key={r.id} className="p-3 space-y-1">
              <div className="text-sm">Rating: {r.rating} / 5</div>
              {r.comment && (
                <p className="text-sm text-muted-foreground">{r.comment}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
