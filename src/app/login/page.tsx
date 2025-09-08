"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.detail || "Login failed");
      return;
    }
    router.replace(next);
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border rounded px-3 py-2 w-full" placeholder="Username" value={username} onChange={(e)=>setU(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full" type="password" placeholder="Password" value={password} onChange={(e)=>setP(e.target.value)} />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="px-4 py-2 rounded bg-black text-white">Sign in</button>
      </form>
    </main>
  );
}
