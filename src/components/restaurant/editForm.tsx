// app/dashboard/restaurants/_components/EditForm.tsx
"use client";
import { useActionState } from "react";
import { updateRestaurant } from "@/actions/restaurants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditForm({ r }: { r: any }) {
  const [state, formAction, pending] = useActionState(updateRestaurant, { ok: true, error: "" });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={r.id} />
      <div className="space-y-1">
        <Label htmlFor={`name-${r.id}`}>Name</Label>
        <Input id={`name-${r.id}`} name="name" defaultValue={r.name} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor={`description-${r.id}`}>Description</Label>
        <Input id={`description-${r.id}`} name="description" defaultValue={r.description || ""} />
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
      {state?.ok === false && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
