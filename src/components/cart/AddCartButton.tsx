"use client";

import { useCart } from "@/components/cart/cart-provider";
import { MenuItemType } from "@/lib/definitions";
import { Plus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AddToCartButton({ 
  item, 
  disabled = false 
}: { 
  item: MenuItemType;
  disabled?: boolean;
}) {
  const { add } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;
    
    setIsAdding(true);
    
    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    add({ ...item, qty: 1 });
    
    setIsAdded(true);
    setIsAdding(false);
    
    // Reset the added state after 2 seconds
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={`relative overflow-hidden transition-all duration-200 ${
        disabled 
          ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
          : isAdded
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-primary hover:bg-primary/90 text-white"
      }`}
      size="sm"
    >
      <span className={`flex items-center gap-2 transition-opacity duration-200 ${
        isAdding || isAdded ? "opacity-0" : "opacity-100"
      }`}>
        <Plus className="h-4 w-4" />
        Add to Cart
      </span>
      
      {isAdding && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
      
      {isAdded && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Check className="h-4 w-4 mr-1" />
          Added!
        </span>
      )}
    </Button>
  );
}