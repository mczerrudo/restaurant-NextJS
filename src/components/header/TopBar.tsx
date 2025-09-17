// components/TopBar.tsx
"use server";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Icon } from "lucide-react";
import LogoutButton from "@/components/header/Logout";
import { cookies } from "next/headers";
import IconTooltip from "@/components/header/IconToolTip";

export default async function TopBar() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/restaurants", label: "Restaurants" },
    { href: "/orders", label: "Orders" },
  ];
  const cookieStore = await cookies();
  const userCookieValue = cookieStore.get("user")?.value;
  const user = userCookieValue ? JSON.parse(userCookieValue) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between md px-6">
        {/* Logo / Brand */}
        <Link href="/" className="font-bold text-lg">
        Restaurant
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user?.isRestaurantOwner && (
            <Link
              href="/owner"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Owner
            </Link>
          )}
        </nav>

        {/* Right side: Actions */}

        <div className="flex items-center gap-2">
          <IconTooltip label="Cart">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
              </Link>
            </Button>
          </IconTooltip>
          {/* Logout Button */}
          <LogoutButton />
          
          <IconTooltip label="Login">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </IconTooltip>
          {user && (
            <div className="text-sm font-medium transition-colors hover:text-primary">
              
              {user?.email}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
