// components/orders/CustomerOrderCard.tsx
"use client";
import { startTransition, useState } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/customUI/confirm-dialog";

export function CustomerStatus({
  order,
}: {
  order: { id: string; status: string };
}) {
  const [status, setStatus] = useState(order.status);

  const cancel = () =>
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, "cancelled");
      if (res.ok) setStatus("cancelled");
    });

  return (
    <div>
      <Badge variant="secondary" className="capitalize">
        {status}
      </Badge>

      {status === "pending" && (
        <ConfirmDialog
          trigger={
            <Badge
              variant="destructive"
              className="ml-4 cursor-pointer select-none"
            >
              Cancel
            </Badge>
          }
          title="Cancel Order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          confirmText="Yes, cancel order"
          cancelText="No, keep order"
          onConfirm={cancel}
        />
      )}
    </div>
  );
}
