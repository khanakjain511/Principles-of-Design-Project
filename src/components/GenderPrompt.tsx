"use client";

import { useEffect, useState } from "react";
import { GENDER_VALUES, type Gender } from "@/lib/gender";

const OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const SKIP_KEY = "smartride:gender-prompt-skipped";

export default function GenderPrompt() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Gender | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const gender = data?.user?.gender as string | null | undefined;
        if (cancelled) return;
        if (!gender || !GENDER_VALUES.includes(gender as Gender)) {
          if (typeof window !== "undefined" && window.sessionStorage.getItem(SKIP_KEY) === "1") {
            return;
          }
          setOpen(true);
        }
      } catch {
        // Silent — non-blocking enhancement.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit() {
    if (!selected) {
      setError("Please pick an option.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/me/gender", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Could not save");
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  function handleSkip() {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SKIP_KEY, "1");
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-6 pt-20 sm:items-center sm:pb-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gender-prompt-title"
        className="w-full max-w-md border border-line bg-white p-6 shadow-xl"
      >
        <h2 id="gender-prompt-title" className="text-lg font-semibold tracking-tight text-ink">
          One quick thing
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Add your gender so other students can see it on the rides you post.
          This helps people coordinate safer, more comfortable carpools.
        </p>

        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">Choose your gender</legend>
          {OPTIONS.map((opt) => {
            const active = selected === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-ink bg-surface text-ink"
                    : "border-line bg-white text-ink-muted hover:border-ink/40"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={active}
                  onChange={() => setSelected(opt.value)}
                  className="h-4 w-4 accent-ink"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </fieldset>

        {error ? (
          <p className="mt-3 border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            className="border border-line bg-white px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-surface disabled:opacity-60"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selected}
            className="bg-ink px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
