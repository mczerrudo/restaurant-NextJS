"use client";

import { useCart } from "@/components/cart/cart-provider";
import { Check, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import CheckoutButton from "@/components/cart/CheckoutButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function peso(n: number | string) {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return `₱${v.toFixed(2)}`;
}

export default function CartPage() {
  const { items, remove, clear, setQty } = useCart();

  const total = items.reduce((sum, it) => sum + Number(it.price) * it.qty, 0);
  const itemCount = items.reduce((sum, it) => sum + it.qty, 0);

  const inc = (id: number | string) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    setQty(id, it.qty + 1);
  };

  const dec = (id: number | string) => {
    const it = items.find(i => i.id === id);
    if (!it) return;
    const next = Math.max(1, it.qty - 1);
    setQty(id, next);
  };

  const onQtyInput = (id: number | string, value: string) => {
    if (!setQty) return;
    const n = parseInt(value.replace(/[^\d]/g, ""), 10);
    if (Number.isNaN(n)) return;
    setQty(id, Math.min(999, Math.max(1, n)));
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600">Review and manage your order items</p>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto bg-gray-100 rounded-full p-4 w-fit mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">Add some delicious items to get started!</p>
            <Button asChild>
              <a href="/restaurants">Browse Restaurants</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Order Items ({itemCount})</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-100">
                  {items.map((it) => (
                    <li key={it.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Item Image Placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-2xl">🍽️</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{it.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{peso(it.price)} each</p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => dec(it.id)}
                                disabled={it.qty <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              
                              <Input
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={999}
                                value={it.qty}
                                onChange={(e) => onQtyInput(it.id, e.target.value)}
                                className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => inc(it.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="font-semibold text-primary">
                              {peso(Number(it.price) * it.qty)}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => remove(it.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{peso(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{peso(total)}</span>
                    </div>
                  </div>
                </div>

                {/* <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Free delivery on orders over ₱300</span>
                </div> */}

                <CheckoutButton />
                
                <Button variant="outline" className="w-full" asChild>
                  <a href="/restaurants">Continue Shopping</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}