// components/orders/OwnerOrderRow.tsx
"use client";
import { startTransition, useState, useMemo } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/customUI/confirm-dialog";

const NEXT_BY_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function OwnerStatus({
  order,
}: {
  order: { id: string; status: string };
}) {
  const [status, setStatus] = useState(order.status);
  const nexts = useMemo(() => NEXT_BY_STATUS[status] ?? [], [status]);

  const go = (to: string) =>
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, to as any);
      if (res.ok) setStatus(to);
    });

  return (
    <div className="flex items-center justify-between border-b py-2">
      <div className="flex gap-2">
        {/* Current status */}
        <Badge variant="secondary" className="capitalize">
          {status}
        </Badge>
        {/* Next possible statuses */}
        {nexts.map((to) =>
          to === "cancelled" ? (
            <ConfirmDialog
              key={to}
              trigger={
                <Badge className="capitalize" variant="destructive">
                  {to}
                </Badge>
              }
              title="Cancel Order"
              description="Are you sure you want to cancel this order? This cannot be undone."
              confirmText="Yes, cancel"
              cancelText="No, keep it"
              onConfirm={() => go(to)}
            />
          ) : (
            <Badge
              key={to}
              onClick={() => go(to)}
              className="capitalize hover:bg-muted"
              variant="outline"
            >
              {to}
            </Badge>
          )
        )}
      </div>
    </div>
  );
}
