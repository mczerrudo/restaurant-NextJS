"use client";
import { useTransition, useState } from "react";
import { createReview } from "@/actions/reviews";
import { useRouter } from "next/navigation";

export default function CreateReviewForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("restaurantId", String(restaurantId));
    setError(null);
    start(async () => {
      const res = await createReview(fd);
      if (res.ok) {
        (e.currentTarget as HTMLFormElement).reset();
        router.refresh();
      } else setError(typeof res.error === "string" ? res.error : "Failed to submit review");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border p-3">
      <div className="space-y-1">
        <label className="text-sm">Rating</label>
        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <label key={n} className="flex items-center gap-1 text-sm">
              <input type="radio" name="rating" value={n} required /> {n}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm">Comment (optional)</label>
        <textarea name="comment" rows={3} className="w-full rounded border px-3 py-2" placeholder="Share a few words about your experience" />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button disabled={pending} className="rounded bg-black text-white px-4 py-2">
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}