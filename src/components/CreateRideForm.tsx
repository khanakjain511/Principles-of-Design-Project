"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { CAMPUS } from "@/lib/constants";
import type { Ride } from "@/components/RideCard";

const COMMON_CITIES = [CAMPUS, "Delhi", "Gurgaon", "Noida"];

type Props = {
  onCreated?: (ride: Ride) => void;
};

export default function CreateRideForm({ onCreated }: Props = {}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      from: String(formData.get("from") ?? "").trim(),
      to: String(formData.get("to") ?? "").trim(),
      date: String(formData.get("date") ?? "").trim(),
      timeWindow: String(formData.get("timeWindow") ?? "").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create ride");
      }
      if (onCreated && data?.ride) {
        onCreated(data.ride as Ride);
        formRef.current?.reset();
        setSubmitting(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From" htmlFor="from">
          <input
            id="from"
            name="from"
            list="city-options"
            required
            placeholder={CAMPUS}
            className={inputClass}
          />
        </Field>
        <Field label="To" htmlFor="to">
          <input
            id="to"
            name="to"
            list="city-options"
            required
            placeholder="Delhi"
            className={inputClass}
          />
        </Field>
      </div>

      <datalist id="city-options">
        {COMMON_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" htmlFor="date">
          <input
            id="date"
            name="date"
            type="date"
            required
            min={today}
            defaultValue={today}
            className={inputClass}
          />
        </Field>
        <Field
          label="Time window"
          htmlFor="timeWindow"
          hint="e.g. 4pm – 6pm"
        >
          <input
            id="timeWindow"
            name="timeWindow"
            required
            placeholder="4pm – 6pm"
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="WhatsApp number"
        htmlFor="whatsapp"
        hint="Include country code, e.g. 9198XXXXXXXX"
      >
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          required
          inputMode="tel"
          placeholder="9198XXXXXXXX"
          className={inputClass}
        />
      </Field>

      <Field
        label="Notes (optional)"
        htmlFor="notes"
        hint="Add anything riders should know — luggage, exact pickup, etc."
      >
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={280}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {error ? (
        <p className="border border-line bg-surface px-3 py-2 text-sm text-ink-muted">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        {onCreated ? null : (
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post ride"}
        </button>
      </div>
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
