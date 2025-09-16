"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Restaurant = { id: number; name: string };

export default function OrdersFilters({
  restaurants,
  isOwner,
  restaurantId,
}: {
  restaurants: Restaurant[];
  isOwner: boolean;
  restaurantId?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const get = useCallback((k: string) => sp.get(k) || "", [sp]);

  const setParam = useCallback(
    (k: string, v?: string) => {
      const params = new URLSearchParams(sp.toString());
      if (v && v.length) params.set(k, v);
      else params.delete(k);
      if (isOwner)
        router.replace(`/owner/${restaurantId}/orders?${params.toString()}`);
      else router.replace(`/orders?${params.toString()}`);
    },
    [router, sp]
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All statuses" },
      { value: "pending", label: "Pending" },
      { value: "confirmed", label: "Confirmed" },
      { value: "preparing", label:"Preparing"},
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },    
    ],
    []
  );

  return (
    <div >
      <div className="flex justify-center gap-4 flex-wrap">
        {/* Restaurant */}
        {!isOwner && (
          <div>
            <label className="block text-xs mb-1">Restaurant</label>
            <Select
              value={get("restaurant")}
              onValueChange={(v) => setParam("restaurant", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All restaurants</SelectItem>
                {restaurants.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-xs mb-1">Status</label>
          <Select
            value={get("status") || "all"}
            onValueChange={(v) => setParam("status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordering */}
        <div>
          <label className="block text-xs mb-1">Created at</label>
          <Select
            value={get("ordering") || "-created_at"}
            onValueChange={(v) => setParam("ordering", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">Newest first</SelectItem>
              <SelectItem value="created_at">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={() => router.replace("/orders")}>
          Clear
        </Button>
      </div>
    </div>
  );
}
