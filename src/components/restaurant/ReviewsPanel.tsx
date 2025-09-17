// components/restaurant/ReviewsPanel.tsx
"use client";

import CreateReviewForm from "@/components/restaurant/createReviewForm";

type Review = {
  id: string | number;
  rating: number;
  comment?: string | null;
};

export default function ReviewsPanel({
  restaurantId,
  average,
  ratingCount,
  myReview,
  reviews,
  reviewGate,
}: {
  restaurantId: number;
  average?: number | null;
  ratingCount?: number | null;
  myReview?: { rating: number; comment?: string | null } | null;
  reviews: Review[];
  reviewGate: { allowed: boolean; reason?: string };
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 self-start">
      <div className="rounded border p-4">
        <h2 className="text-lg font-semibold">Reviews</h2>
        <div className="mt-1 text-sm text-muted-foreground">
          {average && ratingCount
            ? <>Average rating: <span className="font-medium">{average.toFixed(1)}</span> ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})</>
            : reviews.length > 0
              ? <>Average rating: <span className="font-medium">{(average ?? 0).toFixed(1)}</span> ({reviews.length} {reviews.length === 1 ? "rating" : "ratings"})</>
              : "Not yet rated"}
        </div>
      </div>

      {myReview ? (
        <div className="rounded border p-4 text-sm">
          <div className="font-medium">Your review</div>
          <div>Rating: {myReview.rating} / 5</div>
          {myReview.comment && <p className="mt-1">{myReview.comment}</p>}
        </div>
      ) : reviewGate.allowed ? (
        <div className="rounded border p-4">
          <CreateReviewForm restaurantId={restaurantId} />
        </div>
      ) : (
        <div className="rounded border p-4 text-sm">{reviewGate.reason}</div>
      )}

      <ul className="divide-y rounded border">
        {reviews.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">No reviews yet.</li>
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
    </aside>
  );
}
