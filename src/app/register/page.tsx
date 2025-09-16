// app/register/page.tsx (Server Component)
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/forms/register-form"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/");

  const sp = await searchParams;
  const next = (Array.isArray(sp.next) ? sp.next[0] : sp.next) || "/";

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="text-sm text-muted-foreground">
        Join to manage your restaurants and orders.
      </p>
      <RegisterForm next={next} />
    </div>
  );
}
