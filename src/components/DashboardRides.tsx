"use client";

import { useEffect, useState } from "react";
import RideCard, { type Ride } from "@/components/RideCard";
import CreateRideForm from "@/components/CreateRideForm";
import { CAMPUS } from "@/lib/constants";

type Group = "leaving" | "coming" | "other" | "all";

const SECTIONS: { id: Group; title: string; description: string }[] = [
  {
    id: "leaving",
    title: "Leaving Campus",
    description: `Rides starting from ${CAMPUS}.`,
  },
  {
    id: "coming",
    title: "Going to Campus",
    description: `Rides ending at ${CAMPUS}.`,
  },
  {
    id: "other",
    title: "Other Routes",
    description: "Rides between other locations.",
  },
];

function classify(ride: Ride): "leaving" | "coming" | "other" {
  const from = ride.from.toLowerCase();
  const to = ride.to.toLowerCase();
  const campus = CAMPUS.toLowerCase();
  
  if (from.includes(campus) || from.includes("college") || from.includes("clg")) return "leaving";
  if (to.includes(campus) || to.includes("college") || to.includes("clg")) return "coming";
  return "other";
}

type Props = {
  currentUserId: string;
};

export default function DashboardRides({ currentUserId }: Props) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [routeType, setRouteType] = useState<Group>("all");

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
            className="border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
              My Rides
            </h2>
            <p className="mt-1 text-xs text-ink-subtle">
              Toggle each ride between Active and Full as plans change.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-subtle mr-2">{rides.length} rides</span>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value as Group)}
              className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink focus:border-ink focus:outline-none"
            >
              <option value="all">All Routes</option>
              <option value="leaving">Leaving Campus</option>
              <option value="coming">Going to Campus</option>
              <option value="other">Other Routes</option>
            </select>
          </div>
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
          <div className="space-y-8">
            {SECTIONS.filter(s => routeType === "all" || s.id === routeType).map((section) => {
              const sectionRides = rides.filter(r => classify(r) === section.id);
              if (routeType === "all" && sectionRides.length === 0) return null;

              return (
                <div key={section.id}>
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink-subtle">
                      {section.title}
                    </h3>
                    <span className="text-[10px] text-ink-subtle">{sectionRides.length}</span>
                  </div>
                  {sectionRides.length === 0 ? (
                    <div className="border border-dashed border-line bg-surface/30 px-4 py-6 text-center text-xs text-ink-subtle">
                      No rides in this category.
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sectionRides.map((ride) => (
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
