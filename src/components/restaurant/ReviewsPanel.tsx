"use client";

import CreateReviewForm from "@/components/restaurant/createReviewForm";
import EditReviewForm from "@/components/restaurant/editReviewForm";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, User, Edit, StarHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Review = {
  id: string | number;
  rating: number;
  comment?: string | null;
  user?: {
    name: string;
  };
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
  const [editing, setEditing] = useState(false);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-1/4 lg:sticky lg:top-20 lg:self-start">
      {/* User Review Section */}
      {myReview ? (
        <Card className={editing ? "border-primary/20" : "border-0 shadow-sm"}>
          <CardContent className="p-4">
            {!editing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">Your Review</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="h-8 gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
                <div className="space-y-2">
                  {renderStars(myReview.rating)}
                  {myReview.comment && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                      {myReview.comment}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <EditReviewForm
                restaurantId={restaurantId}
                initialRating={myReview.rating}
                initialComment={myReview.comment ?? ""}
                onDone={() => setEditing(false)}
              />
            )}
          </CardContent>
        </Card>
      ) : reviewGate.allowed ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <CreateReviewForm restaurantId={restaurantId} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <p>{reviewGate.reason}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reviews.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              No reviews yet. Be the first to review!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gray-100 rounded-full">
                      <User className="h-3 w-3 text-gray-500" />
                    </div>
                    <span className="text-xs text-gray-500">
                    Anonymous
                    </span>
                  </div>
                  {renderStars(r.rating)}
                  {r.comment && (
                    <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}