"use client";
import { useEffect, useState } from "react";

export default function OwnerDashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // call a BFF route that forwards auth, or hit DRF directly with Authorization from cookie (via /api/*)
    fetch("/api/owner/restaurants", { method: "GET" })
      .then((r) => r.json())
      .then((d) => setData(d.results ?? d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-3">
      <h1 className="text-xl font-semibold">My Restaurants</h1>
      <ul className="divide-y rounded-lg border">
        {data.map((r) => (
          <li key={r.id} className="p-4">{r.name}</li>
        ))}
      </ul>
    </main>
  );
}
