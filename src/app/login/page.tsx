import { LoginForm } from "@/components/forms/login-form";

export default function Page() {
  return (
    <div className="grid min-h-full w-full place-items-center px-6 md:px-10">
      <div className="w-full max-w-sm mt-10">
        {" "}
        <LoginForm />
      </div>
    </div>
  );
}
