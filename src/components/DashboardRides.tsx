"use client";

import { useEffect, useState } from "react";
import RideCard, { type Ride } from "@/components/RideCard";
import CreateRideForm from "@/components/CreateRideForm";

type Props = {
  currentUserId: string;
};

export default function DashboardRides({ currentUserId }: Props) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rides", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load rides");
        const data = await res.json();
        if (cancelled) return;
        const all = (data.rides ?? []) as Ride[];
        setRides(all.filter((r) => r.createdBy === currentUserId));
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  function handleCreated(ride: Ride) {
    setRides((prev) => [ride, ...prev]);
    setShowForm(false);
  }

  function handleUpdated(updated: Ride) {
    setRides((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  }

  function handleDeleted(rideId: string) {
    setRides((prev) => prev.filter((r) => r._id !== rideId));
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
              Create Ride
            </h2>
            <p className="mt-1 text-xs text-ink-subtle">
              Post where you&rsquo;re going. It will show up on Home and below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface"
          >
            {showForm ? "Hide form" : "New ride"}
          </button>
        </div>

        {showForm ? (
          <div className="border border-line bg-white p-5">
            <CreateRideForm onCreated={handleCreated} />
          </div>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
              My Rides
            </h2>
            <p className="mt-1 text-xs text-ink-subtle">
              Toggle each ride between Active and Full as plans change.
            </p>
          </div>
          <span className="text-xs text-ink-subtle">{rides.length}</span>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse border border-line bg-surface"
              />
            ))}
          </div>
        ) : error ? (
          <div className="border border-line bg-surface p-6 text-sm text-ink-muted">
            {error}
          </div>
        ) : rides.length === 0 ? (
          <div className="border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-ink-subtle">
            You haven&rsquo;t posted any rides yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rides.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                currentUserId={currentUserId}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
