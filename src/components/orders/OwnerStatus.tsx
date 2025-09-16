// components/orders/OwnerOrderRow.tsx
"use client";
import { startTransition, useMemo, useState } from "react";
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

// Optional: tweak how each target state looks
const VARIANT_BY_TO: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  confirmed: "outline",
  preparing: "outline",
  completed: "outline",
  cancelled: "destructive",
};

// Optional: custom titles/descriptions per target
function confirmCopy(from: string, to: string) {
  const pretty = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const title = `Change status to ${pretty(to)}?`;

  let description = `You are changing the order status from "${pretty(from)}" to "${pretty(
    to
  )}".`;

  if (to === "cancelled") {
    description += " This action cannot be undone.";
  }

  return { title, description };
}

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
    <div className="flex items-center justify-between py-2">
      <div className="flex gap-2">
        {/* Current status */}
        <Badge variant="secondary" className="capitalize">
          {status}
        </Badge>

        {/* Next possible statuses (ALL with confirmation) */}
        {nexts.map((to) => {
          const { title, description } = confirmCopy(status, to);
          const variant = VARIANT_BY_TO[to] ?? "outline";

          return (
            <ConfirmDialog
              key={to}
              trigger={
                <Badge
                  variant={variant}
                  className="capitalize cursor-pointer select-none"
                >
                  {to}
                </Badge>
              }
              title={title}
              description={description}
              confirmText={`Yes, set to ${to}`}
              cancelText="No, go back"
              onConfirm={() => go(to)}
            />
          );
        })}
      </div>
    </div>
  );
}
