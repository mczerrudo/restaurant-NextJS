// components/orders/OwnerOrderRow.tsx
"use client";
import { startTransition, useMemo, useState } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/customUI/confirm-dialog";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChefHat, 
  Truck,
  Loader2
} from "lucide-react";

const NEXT_BY_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  preparing: <ChefHat className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

// Optional: custom titles/descriptions per target
function confirmCopy(from: string, to: string) {
  const pretty = (s: string) => s.replace(/_/g, ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `Change status to ${pretty(to)}?`;

  let description = `You are changing the order status from "${pretty(from)}" to "${pretty(to)}".`;

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
  const [isUpdating, setIsUpdating] = useState(false);
  const nexts = useMemo(() => NEXT_BY_STATUS[status] ?? [], [status]);

  const go = (to: string) => {
    setIsUpdating(true);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, to as any);
      if (res.ok) setStatus(to);
      setIsUpdating(false);
    });
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Current Status:</span>
        <Badge 
          className={`capitalize flex items-center gap-1 ${STATUS_COLORS[status]}`}
          variant="outline"
        >
          {STATUS_ICONS[status]}
          {status.replace(/_/g, ' ')}
        </Badge>
      </div>
      
      {nexts.length > 0 && (
        <>
          <div className="text-sm font-medium text-gray-700">Update Status:</div>
          <div className="flex flex-wrap gap-2">
            {nexts.map((to) => {
              const { title, description } = confirmCopy(status, to);
              const isCancelled = to === "cancelled";

              return (
                <ConfirmDialog
                  key={to}
                  trigger={
                    <Button
                      variant={isCancelled ? "destructive" : "outline"}
                      size="sm"
                      className="capitalize h-8 text-xs flex items-center gap-1"
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        STATUS_ICONS[to]
                      )}
                      {to.replace(/_/g, ' ')}
                    </Button>
                  }
                  title={title}
                  description={description}
                  confirmText={`Yes, set to ${to.replace(/_/g, ' ')}`}
                  cancelText="No, go back"
                  onConfirm={() => go(to)}
                />
              );
            })}
          </div>
        </>
      )}
      
      {nexts.length === 0 && (
        <div className="text-xs text-gray-500 text-center py-1">
          No further actions available for this status
        </div>
      )}
    </div>
  );
}