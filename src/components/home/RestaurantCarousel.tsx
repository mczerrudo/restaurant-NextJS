// components/home/RestaurantsCarousel.tsx
"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/home/RestaurantCard";

type Item = {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  ratingAvg: number;
  ratingCount: number;
};

export default function RestaurantsCarousel({ items }: { items: Item[] }) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollByCard = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const amount = card ? (card as HTMLElement).offsetWidth + 16 : 320; // card width + gap
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) {
    return <p className="text-muted-foreground">No restaurants yet.</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Discover Restaurants</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scrollByCard("left")} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scrollByCard("right")} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-pb-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* hide scrollbar for WebKit */}
        <style>{`
          ul::-webkit-scrollbar { display: none; }
        `}</style>
        {items.map((r) => (
          <RestaurantCard key={r.id} r={r} />
        ))}
      </ul>
    </section>
  );
}
