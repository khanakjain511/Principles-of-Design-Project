import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="text-sm font-medium uppercase tracking-[0.18em] text-ink-subtle"
          >
            SmartRide Connect
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Use your college email and password to access the rides board.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-10 text-center text-xs text-ink-subtle">
          Restricted to verified college email domains.
        </p>
      </div>
    </main>
  );
}
