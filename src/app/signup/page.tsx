import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ALLOWED_DOMAINS } from "@/lib/constants";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-medium uppercase tracking-[0.18em] text-ink-subtle"
          >
            SmartRide Connect
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Only {ALLOWED_DOMAINS.map((d) => `@${d}`).join(" and ")} accounts can sign up.
          </p>
        </div>

        <SignupForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
