"use client";

import { BarChart3 } from "lucide-react";

interface Order {
  id: string | number;
  status: string;
}

interface OrderStatisticsProps {
  orders?: Order[];
}

export function OrderStatistics({ orders = [] }: OrderStatisticsProps) {
  const total = orders.length;

  const active = orders.filter((o) =>
    ["pending", "confirmed", "preparing"].includes(o.status)
  ).length;

  const completed = orders.filter((o) => o.status === "completed").length;

  const cancelled = orders.filter((o) => o.status === "cancelled").length;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Order Statistics
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="text-gray-600">Total Orders</span>
          <span className="font-semibold">{total}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="text-gray-600">Active Orders</span>
          <span className="font-semibold text-blue-600">{active}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
          <span className="text-gray-600">Completed</span>
          <span className="font-semibold text-green-600">{completed}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Cancelled</span>
          <span className="font-semibold text-red-600">{cancelled}</span>
        </div>
      </div>
    </div>
  );
}
