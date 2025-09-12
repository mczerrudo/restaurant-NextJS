import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AddToCartButton from "@/components/cart/AddCartButton";
import { MenuItemType } from "@/lib/definitions";

export default function MenuItem({
  m,
}: {
  m: MenuItemType;
}) {
  return (
    <Card key={m.id} className="flex items-center justify-between p-3 hover:shadow-md transition">
      <div>
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-lg">{m.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-gray-700">₱{Number(m.price).toFixed(2)}</p>
        </CardContent>
      </div>

      <AddToCartButton item={m}/>
    </Card>
  );
}
