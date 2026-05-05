"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export default function SignupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      gender: String(data.get("gender") ?? ""),
      password: String(data.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error ?? "Could not create account");
      }

      const signin = await signIn("credentials", {
        email: payload.email,
        password: payload.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (!signin || signin.error) {
        throw new Error("Account created. Please sign in.");
      }

      router.push(signin.url ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          placeholder="Your Name"
          className={inputClass}
        />
      </Field>

      <Field label="College email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@nst.rishihood.edu.in"
          className={inputClass}
        />
      </Field>

      <Field label="Gender" htmlFor="gender">
        <select
          id="gender"
          name="gender"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Select your gender
          </option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        hint="At least 8 characters."
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </Field>

      {error ? (
        <p className="border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-ink-subtle">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="flex w-full items-center justify-center gap-2 border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign up with Google
      </button>
    </form>
  );
}

const inputClass =
  "w-full border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-subtle">{hint}</span> : null}
    </label>
  );
}
