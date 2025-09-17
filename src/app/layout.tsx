import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/cart/cart-provider";
import TopBar from "@/components/header/TopBar";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Order delicious food from nearby restaurants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className=""> 
      <body className="min-h-screen">
        <TopBar />
        <CartProvider>{children}</CartProvider>
        <Toaster position="top-right"  offset="60px"  richColors />
      </body>
    </html>
  );
}
