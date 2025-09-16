"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/actions/authDRF";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import IconTooltip from "@/components/header/IconToolTip";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout(); // server action
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed");
    }
  }

  return (
    <IconTooltip label="Logout">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        aria-label="Logout"
      >
        {" "}
        <LogOut className="h-5 w-5" />
      </Button>
    </IconTooltip>
  );
}
