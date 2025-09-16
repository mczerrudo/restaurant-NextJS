// src/components/RegisterForm.tsx (Client Component)
"use client";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/actions/auth";

export default function RegisterForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const res = await signUpAction(form);
      if (res.ok) router.replace(next);
      else
        setError(
          typeof res.error === "string" ? res.error : "Check your inputs"
        );
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-1">
        <label className="text-sm">Full name</label>
        <input
          name="fullName"
          className="w-full rounded border px-3 py-2"
          placeholder="Juan Dela Cruz"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input
          name="email"
          type="email"
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            name="password"
            type="password"
            className="w-full rounded border px-3 py-2"
            required
            minLength={8}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Confirm password</label>
          <input
            name="confirmPassword"
            type="password"
            className="w-full rounded border px-3 py-2"
            required
            minLength={8}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          name="isRestaurantOwner"
          type="checkbox"
          value="true"
          className="h-4 w-4"
        />
        I am a restaurant owner
      </label>
      <button
        disabled={pending}
        className="w-full rounded bg-black text-white py-2"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
