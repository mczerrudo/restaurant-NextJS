// src/components/MenuTable.tsx
"use client";
import { useState, useTransition } from "react";
import { deleteMenuItem, updateMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type MenuItem = {
  id: number;
  restaurantId: number;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  available: 0 | 1 | boolean;
};

export default function MenuTable({ restaurantId, initialItems }: { restaurantId: number; initialItems: MenuItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<number | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const onDelete = (id: number) => {
    if (!confirm("Delete this item?")) return;
    start(async () => {
      const res = await deleteMenuItem(id);
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id));
        router.refresh();
      } else alert(res.error || "Failed to delete");
    });
  };

  const onSave = (id: number, form: HTMLFormElement) => {
    const fd = new FormData(form);
    const patch = {
      name: String(fd.get("name") || ""),
      price: Number(fd.get("price") || 0),
      description: (fd.get("description") as string) || undefined,
      category: (fd.get("category") as string) || undefined,
      available: String(fd.get("available") || "true") === "true",
    };
    start(async () => {
      const res = await updateMenuItem(id, patch);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else alert(res.error || "Failed to update");
    });
  };

  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Available</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">No items yet</td>
            </tr>
          )}
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              {editing === it.id ? (
                <EditableRow it={it} onCancel={() => setEditing(null)} onSave={(form) => onSave(it.id, form)} pending={pending} />
              ) : (
                <ReadRow it={it} onEdit={() => setEditing(it.id)} onDelete={() => onDelete(it.id)} />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReadRow({ it, onEdit, onDelete }: { it: MenuItem; onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <td className="p-2">{it.name}</td>
      <td className="p-2">{it.category || "—"}</td>
      <td className="p-2">₱{Number(it.price).toFixed(2)}</td>
      <td className="p-2">{(it.available as any) ? "Yes" : "No"}</td>
      <td className="p-2 text-right space-x-2">
        <button onClick={onEdit} className="rounded border px-2 py-1">Edit</button>
        <button onClick={onDelete} className="rounded border px-2 py-1">Delete</button>
      </td>
    </>
  );
}

function EditableRow({ it, onCancel, onSave, pending }: { it: MenuItem; onCancel: () => void; onSave: (form: HTMLFormElement) => void; pending: boolean }) {
  return (
    <td colSpan={5} className="p-2">
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(e.currentTarget); }}
        className="grid gap-2 md:grid-cols-6 items-end"
      >
        <input name="name" defaultValue={it.name} className="rounded border px-3 py-2 md:col-span-2" />
        <input name="category" defaultValue={it.category ?? ""} className="rounded border px-3 py-2" />
        <input name="price" type="number" step="0.01" defaultValue={String(it.price)} className="rounded border px-3 py-2" />
        <select name="available" defaultValue={(it.available as any) ? "true" : "false"} className="rounded border px-3 py-2">
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <div className="flex gap-2 justify-end md:col-span-6">
          <button type="button" onClick={onCancel} className="rounded border px-3 py-2">Cancel</button>
          <button disabled={pending} className="rounded bg-black text-white px-3 py-2">{pending ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </td>
  );
}