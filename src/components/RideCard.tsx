"use client";

import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { formatRelativeTime, formatRideDate, whatsappLink } from "@/lib/format";
import type { RideStatus } from "@/lib/constants";
import { GENDER_LABEL, type Gender } from "@/lib/gender";

export type Ride = {
  _id: string;
  from: string;
  to: string;
  date: string;
  timeWindow: string;
  whatsapp: string;
  notes?: string;
  status: RideStatus;
  createdBy: string;
  creatorName: string;
  creatorEmail: string;
  creatorImage?: string;
  creatorGender?: Gender;
  createdAt: string;
};

const GENDER_BADGE_CLASS: Record<Gender, string> = {
  female: "border-pink-200 bg-pink-50 text-pink-700",
  male: "border-blue-200 bg-blue-50 text-blue-700",
  "non-binary": "border-violet-200 bg-violet-50 text-violet-700",
  "prefer-not-to-say": "border-line bg-surface text-ink-muted",
};

type Props = {
  ride: Ride;
  currentUserId?: string;
  onUpdated?: (ride: Ride) => void;
};

export default function RideCard({ ride, currentUserId, onUpdated }: Props) {
  const [status, setStatus] = useState<RideStatus>(ride.status);
  const [busy, setBusy] = useState(false);
  const isOwner = currentUserId && currentUserId === ride.createdBy;

  async function toggleStatus() {
    if (!isOwner || busy) return;
    const next: RideStatus = status === "active" ? "full" : "active";
    setBusy(true);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setStatus(data.ride.status);
      onUpdated?.(data.ride);
    } catch (err) {
      console.error(err);
      alert("Could not update status. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const waMessage = `Hi ${ride.creatorName.split(" ")[0]}, I saw your ride from ${ride.from} to ${ride.to} on SmartRide Connect. Is the seat still open?`;

  return (
    <article className="group border border-line bg-white p-5 transition-colors hover:border-ink/30">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight text-ink">
            {ride.from}
            <span className="mx-2 text-ink-subtle">→</span>
            {ride.to}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            {formatRideDate(ride.date)} · {ride.timeWindow}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <StatusBadge status={status} />
          {ride.creatorGender ? (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${GENDER_BADGE_CLASS[ride.creatorGender]}`}
              title={`Posted by a ${GENDER_LABEL[ride.creatorGender].toLowerCase()} student`}
            >
              {GENDER_LABEL[ride.creatorGender]}
            </span>
          ) : null}
        </div>
      </header>

      {ride.notes ? (
        <p className="mt-3 text-sm text-ink-muted">{ride.notes}</p>
      ) : null}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">
            {ride.creatorName}
          </p>
          <p className="mt-0.5 text-xs text-ink-subtle">
            Posted {formatRelativeTime(ride.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner ? (
            <button
              onClick={toggleStatus}
              disabled={busy}
              className="border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface disabled:opacity-60"
            >
              {busy
                ? "Updating…"
                : status === "active"
                  ? "Mark as full"
                  : "Reopen ride"}
            </button>
          ) : null}

          {status === "active" ? (
            <a
              href={whatsappLink(ride.whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-ink px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-black"
            >
              Contact on WhatsApp
            </a>
          ) : (
            <span className="text-xs text-ink-subtle">Closed</span>
          )}
        </div>
      </footer>
    </article>
  );
}
