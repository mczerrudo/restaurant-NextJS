// components/orders/CustomerOrderCard.tsx
"use client";
import { startTransition, useState } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/customUI/confirm-dialog";
import { XCircle, Clock, CheckCircle, ChefHat, Truck, Loader2 } from "lucide-react";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  preparing: <ChefHat className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function CustomerStatus({
  order,
}: {
  order: { id: string; status: string };
}) {
  const [status, setStatus] = useState(order.status);
  const [isCancelling, setIsCancelling] = useState(false);

  const cancel = () => {
    setIsCancelling(true);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, "cancelled");
      if (res.ok) setStatus("cancelled");
      setIsCancelling(false);
    });
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border min-w-[140px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Status:</span>
        <Badge 
          className={`capitalize flex items-center gap-1 ${STATUS_COLORS[status]}`}
          variant="outline"
        >
          {STATUS_ICONS[status]}
          {status.replace(/_/g, ' ')}
        </Badge>
      </div>
      
      {status === "pending" && (
        <ConfirmDialog
          trigger={
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs flex items-center gap-1"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              Cancel Order
            </Button>
          }
          title="Cancel Order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          confirmText="Yes, cancel order"
          cancelText="No, keep order"
          onConfirm={cancel}
        />
      )}
      
      {status !== "pending" && status !== "cancelled" && (
        <div className="text-xs text-gray-500 text-center py-1">
          Order cannot be cancelled
        </div>
      )}
    </div>
  );
}