"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { CAMPUS } from "@/lib/constants";
import type { Ride } from "@/components/RideCard";
import toast from "react-hot-toast";

const COMMON_CITIES = [CAMPUS, "Delhi", "Gurgaon", "Noida"];

type Props = {
  onCreated?: (ride: Ride) => void;
};

export default function CreateRideForm({ onCreated }: Props = {}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    const startTime = String(formData.get("startTime") ?? "").trim();
    const endTime = String(formData.get("endTime") ?? "").trim();
    
    if (!startTime || !endTime) {
      toast.error("Please select both start and end times.");
      setSubmitting(false);
      return;
    }

    const rideDate = formData.get("date")?.toString() || "";
    
    // Strict Date/Time Validations
    const now = new Date();
    const selectedDateStr = `${rideDate}T${startTime}`;
    const selectedStartDateTime = new Date(selectedDateStr);
    
    if (selectedStartDateTime < now) {
      toast.error("Start time cannot be in the past.");
      setSubmitting(false);
      return;
    }

    if (endTime <= startTime) {
      toast.error("End time must be after the start time.");
      setSubmitting(false);
      return;
    }

    const formatTime = (t: string) => {
      const [h, m] = t.split(":");
      const hours = parseInt(h, 10);
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      return `${h12}:${m} ${ampm}`;
    };

    const timeWindow = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    const whatsappRaw = String(formData.get("whatsapp") ?? "").trim();
    
    const digits = whatsappRaw.replace(/[^\d]/g, "");
    if (digits.length < 10) {
      toast.error("Please enter a valid WhatsApp number (at least 10 digits).");
      setSubmitting(false);
      return;
    }

    const payload = {
      from: String(formData.get("from") ?? "").trim(),
      to: String(formData.get("to") ?? "").trim(),
      date: String(formData.get("date") ?? "").trim(),
      timeWindow,
      whatsapp: whatsappRaw,
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
      toast.success("Ride posted successfully!");
      if (onCreated && data?.ride) {
        onCreated(data.ride as Ride);
        formRef.current?.reset();
        setSubmitting(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
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
          htmlFor="startTime"
          hint="e.g. 4:00 PM to 6:00 PM"
        >
          <div className="flex items-center gap-2">
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              className={inputClass}
            />
            <span className="text-ink-subtle text-sm">to</span>
            <input
              id="endTime"
              name="endTime"
              type="time"
              required
              className={inputClass}
            />
          </div>
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
