// app/dashboard/restaurants/page.tsx (server component)
import { getMyRestaurants } from "@/actions/authDRF";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import CreateForm from "@/components/restaurant/createForm";
import EditForm from "@/components/restaurant/editForm";
import DeleteForm from "@/components/restaurant/deleteForm";
import {listRestaurantsByOwner} from "@/actions/restaurants";
import {cookies} from "next/headers";
import Link from "next/link";

export default async function OwnerRestaurantsPage() {
  const cookieStore = await cookies();
  const userCookieValue = cookieStore.get("user")?.value;
  const user = userCookieValue ? JSON.parse(userCookieValue) : null;
  
  const data = await listRestaurantsByOwner(user.id);

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Restaurants</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Restaurant</DialogTitle></DialogHeader>
            <CreateForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((r: any) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{r.name}</span>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Edit Restaurant</DialogTitle></DialogHeader>
                      <EditForm r={r} />
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Delete Restaurant</DialogTitle></DialogHeader>
                      <DeleteForm id={r.id} name={r.name} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {r.description && <p className="text-sm opacity-80">{r.description}</p>}
                <Link className="underline" href={`/owner/${r.id}`}>Manage menu →</Link>
                <Link className="underline" href={`/owner/${r.id}/orders`}>Manage orders →</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
