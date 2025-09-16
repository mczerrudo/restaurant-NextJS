// app/dashboard/restaurants/_components/DeleteForm.tsx
"use client";
import { useActionState } from "react";
import { deleteRestaurant } from "@/actions/restaurants";
import { Button } from "@/components/ui/button";

export default function DeleteForm({ id, name }: { id: number; name: string }) {
  const [state, formAction, pending] = useActionState(deleteRestaurant, { ok: true, error: "" });

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <p>Delete <span className="font-medium">{name}</span>? This cannot be undone.</p>
      <div className="flex justify-end">
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {state?.ok === false && state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
