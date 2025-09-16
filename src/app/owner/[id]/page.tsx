// app/owner/restaurants/[id]/page.tsx
import { notFound } from "next/navigation";
import { getRestaurant, getRestaurantByOwner } from "@/actions/restaurants";
import { listMenuItems } from "@/actions/menu";
import AddMenuItemForm from "@/components/menuItem/AddMenuItemForm";
import MenuTable from "@/components/menuItem/MenuTable";

export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const p = await params;
  const id = Number(p.id);
  if (!Number.isFinite(id)) notFound();

  const [rest, items] = await Promise.all([
    getRestaurantByOwner(id),
    listMenuItems(id),
  ]);

  if (!rest) notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{rest.name}</h1>
        {rest.description && (
          <p className="text-muted-foreground">{rest.description}</p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Add menu item</h2>
        <AddMenuItemForm restaurantId={id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Menu items</h2>
        <MenuTable restaurantId={id} initialItems={items} />
      </section>
    </div>
  );
}
