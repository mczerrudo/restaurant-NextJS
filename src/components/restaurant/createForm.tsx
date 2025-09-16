// app/dashboard/restaurants/_components/CreateForm.tsx
"use client";
import { useActionState } from "react";
import { createRestaurant } from "@/actions/restaurants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateForm() {
  const [state, formAction, pending] = useActionState(createRestaurant, { ok: true, error: "" });

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
      {state?.ok === false && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
