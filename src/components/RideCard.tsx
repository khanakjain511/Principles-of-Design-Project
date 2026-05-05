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
  onDeleted?: (rideId: string) => void;
};

export default function RideCard({ ride, currentUserId, onUpdated, onDeleted }: Props) {
  const [status, setStatus] = useState<RideStatus>(ride.status);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  async function deleteRide() {
    if (!isOwner || deleting) return;
    if (!confirm("Are you sure you want to delete this ride?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/rides/${ride._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onDeleted?.(ride._id);
    } catch (err) {
      console.error(err);
      alert("Could not delete ride. Please try again.");
      setDeleting(false);
    }
  }

  const waMessage = `Hi ${ride.creatorName.split(" ")[0]}, I saw your ride from ${ride.from} to ${ride.to} on SmartRide Connect. Is the seat still open?`;

  return (
    <article className="group border border-line bg-white p-5 transition-colors hover:border-ink/30 flex flex-col h-full">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-tight text-ink">
            {ride.from}
            <span className="mx-2 font-normal text-ink-muted">→</span>
            {ride.to}
          </h3>
          <p className="mt-1.5 text-sm font-medium text-ink-muted">
            {formatRideDate(ride.date)} <span className="mx-1.5 text-line">•</span> {ride.timeWindow}
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
        <p className="mt-3 text-sm text-ink-subtle bg-surface/50 p-3 rounded-md border border-line/50">{ride.notes}</p>
      ) : null}

      <div className="flex-1" />

      <footer className="mt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-line pt-4">
        <div className="flex items-center gap-3 min-w-0">
          {ride.creatorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ride.creatorImage} alt={ride.creatorName} className="w-9 h-9 rounded-full border border-line object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center text-xs font-bold text-ink-muted">
              {ride.creatorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
               <p className="truncate text-sm font-semibold text-ink">
                 {ride.creatorName}
               </p>
               <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm" title="Verified University Student">Verified</span>
            </div>
            <p className="text-xs text-ink-subtle mt-0.5">
              Posted {formatRelativeTime(ride.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isOwner ? (
            <>
              <button
                onClick={toggleStatus}
                disabled={busy || deleting}
                className="flex-1 sm:flex-none justify-center border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface disabled:opacity-60"
              >
                {busy
                  ? "Updating…"
                  : status === "active"
                    ? "Mark as full"
                    : "Reopen ride"}
              </button>
              <button
                onClick={deleteRide}
                disabled={busy || deleting}
                className="flex-1 sm:flex-none justify-center border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </>
          ) : null}

          {!isOwner && status === "active" ? (
            <a
              href={whatsappLink(ride.whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 bg-ink px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-black"
            >
              Contact on WhatsApp
            </a>
          ) : !isOwner && status !== "active" ? (
            <span className="inline-flex w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-ink-subtle bg-surface border border-line">Closed</span>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
