import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import AddToCartButton from "@/components/cart/AddCartButton";
import { MenuItemType } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle, XCircle } from "lucide-react";

export default function MenuItem({ m }: { m: MenuItemType }) {
  const isAvailable = m.available !== false; // Default to true if undefined

  return (
    <Card
      key={m.id}
      className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="p-4">
        <CardHeader className="p-0 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {m.name}
              </CardTitle>
            </div>

            {isAvailable ? (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-700 text-xs"
              >
                Available
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-600 text-xs"
              >
                Sold Out
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 mb-4">
          {m.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {m.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-primary">
              ₱{Number(m.price).toFixed(2)}
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-0">
          <div className="w-full">
            <AddToCartButton item={m} disabled={!isAvailable} />

            {!isAvailable && (
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                <Info className="h-3 w-3" />
                <span>This item is currently unavailable</span>
              </div>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
