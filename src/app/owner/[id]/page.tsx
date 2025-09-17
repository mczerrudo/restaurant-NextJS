// app/owner/restaurants/[id]/page.tsx
import { notFound } from "next/navigation";
import { getRestaurantByOwner } from "@/actions/restaurants";
import { listMenuItems } from "@/actions/menu";
import AddMenuItemForm from "@/components/menuItem/AddMenuItemForm";
import MenuTable from "@/components/menuItem/MenuTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";


export default async function RestaurantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const [rest, items] = await Promise.all([
    getRestaurantByOwner(id),
    listMenuItems(id),
    
  ]);

  if (!rest) notFound();

  return (
    <div className="p-6 space-y-6">
      {/* Header with button on the right */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{rest.name}</h1>
          {rest.description && (
            <p className="text-muted-foreground">{rest.description}</p>
          )}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add menu item</DialogTitle>
            </DialogHeader>
            <AddMenuItemForm restaurantId={id} />
          </DialogContent>
        </Dialog>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Menu items</h2>
        <MenuTable restaurantId={id} initialItems={items} />
      </section>
    </div>
  );
}
