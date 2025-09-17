// components/restaurant/EditReviewForm.tsx
"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyReview, deleteMyReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // if you have it; else use <textarea>
import { Label } from "@/components/ui/label";       // optional
import { toast } from "sonner";                      // optional

export default function EditReviewForm({
  restaurantId,
  initialRating,
  initialComment,
  onDone,
  allowDelete = true,
}: {
  restaurantId: number;
  initialRating: number;
  initialComment?: string | null;
  onDone?: () => void;
  allowDelete?: boolean;
}) {
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>(initialComment ?? "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const save = () =>
    startTransition(async () => {
      const res = await updateMyReview(restaurantId, { rating, comment });
      if (!res.ok) {
        toast?.error?.("Failed to update review");
        return;
      }
      toast?.success?.("Review updated");
      router.refresh();
      onDone?.();
    });

  const remove = () =>
    startTransition(async () => {
      const res = await deleteMyReview(restaurantId);
      if (!res.ok) {
        toast?.error?.("Failed to delete review");
        return;
      }
      toast?.success?.("Review deleted");
      router.refresh();
      onDone?.();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-3"
    >
      <div className="space-y-1">
        <Label htmlFor="rating">Rating</Label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full rounded border px-3 py-2"
          disabled={pending}
        >
          {[5,4,3,2,1].map((n) => (
            <option key={n} value={n}>{n} / 5</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="comment">Comment</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share more details about your experience…"
          disabled={pending}
          className="min-h-[90px]"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        {allowDelete ? (
          <Button type="button" variant="outline" onClick={remove} disabled={pending}>
            Delete
          </Button>
        ) : <div />}

        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
