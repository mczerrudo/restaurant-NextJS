// app/dashboard/restaurants/page.tsx (server component)

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Store, Eye, Utensils, Package } from "lucide-react";
import CreateForm from "@/components/restaurant/createForm";
import EditForm from "@/components/restaurant/editForm";
import DeleteForm from "@/components/restaurant/deleteForm";
import { listRestaurantsByOwner } from "@/actions/restaurants";
import { cookies } from "next/headers";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getActiveOrdersForCurrentOwner } from "@/actions/orders";

export default async function OwnerRestaurantsPage() {
  const cookieStore = await cookies();
  const userCookieValue = cookieStore.get("user")?.value;
  const user = userCookieValue ? JSON.parse(userCookieValue) : null;
  
  const data = await listRestaurantsByOwner(user.id);
  const orders = await getActiveOrdersForCurrentOwner();

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Restaurants</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant businesses</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Add Restaurant
              </DialogTitle>
            </DialogHeader>
            <CreateForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{data.length}</p>
                <p className="text-sm text-blue-700">Total Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Utensils className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">0</p>
                <p className="text-sm text-green-700">Available Menu Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">{orders.length}</p>
                <p className="text-sm text-orange-700">Active Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants Grid */}
      {data.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-fit mb-4">
              <Store className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No restaurants yet</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first restaurant</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Restaurant</DialogTitle>
                </DialogHeader>
                <CreateForm />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((r: any) => (
            <Card key={r.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
                    {r.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit Restaurant
                          </DialogTitle>
                        </DialogHeader>
                        <EditForm r={r} />
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Restaurant
                          </DialogTitle>
                        </DialogHeader>
                        <DeleteForm id={r.id} name={r.name} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                {r.description && (
                  <CardDescription className="line-clamp-2 mt-2">
                    {r.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="space-y-2">
                  {r.address && (
                    <p className="text-sm text-gray-600 line-clamp-1">{r.address}</p>
                  )}
                  {r.is_active !== undefined && (
                    <Badge variant={r.is_active ? "default" : "secondary"}>
                      {r.is_active ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col items-start gap-2 pt-0">
                <Link 
                  href={`/owner/${r.id}`}
                  className="w-full text-sm font-medium text-primary hover:underline flex items-center gap-2 py-2"
                >
                  <Utensils className="h-4 w-4" />
                  Manage Menu
                </Link>
                <Link 
                  href={`/owner/${r.id}/orders`}
                  className="w-full text-sm font-medium text-primary hover:underline flex items-center gap-2 py-2"
                >
                  <Package className="h-4 w-4" />
                  Manage Orders
                </Link>
                <Link 
                  href={`/restaurants/${r.id}`}
                  className="w-full text-sm font-medium text-gray-600 hover:underline flex items-center gap-2 py-2"
                >
                  <Eye className="h-4 w-4" />
                  View Public Page
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}