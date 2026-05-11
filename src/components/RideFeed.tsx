"use client";

import { useEffect, useMemo, useState } from "react";
import RideCard, { type Ride } from "@/components/RideCard";
import { CAMPUS } from "@/lib/constants";

type Props = {
  currentUserId?: string;
  showFilters?: boolean;
};

type Group = "leaving" | "coming" | "other" | "all";

const SECTIONS: { id: Group; title: string; description: string }[] = [
  {
    id: "leaving",
    title: "Leaving Campus",
    description: `Rides starting from ${CAMPUS}.`,
  },
  {
    id: "coming",
    title: "Coming to Campus",
    description: `Rides ending at ${CAMPUS}.`,
  },
  {
    id: "other",
    title: "Other Routes",
    description: "Rides between other locations.",
  },
];

function classify(ride: Ride): Group {
  const from = ride.from.toLowerCase();
  const to = ride.to.toLowerCase();
  const campus = CAMPUS.toLowerCase();
  
  if (from.includes(campus) || from.includes("college") || from.includes("clg")) return "leaving";
  if (to.includes(campus) || to.includes("college") || to.includes("clg")) return "coming";
  return "other";
}

export default function RideFeed({ currentUserId, showFilters = false }: Props) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [routeType, setRouteType] = useState<Group>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rides", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load rides");
        const data = await res.json();
        if (!cancelled) setRides(data.rides ?? []);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const dest = destination.trim().toLowerCase();
    return rides.filter((r) => {
      if (dest && !r.from.toLowerCase().includes(dest) && !r.to.toLowerCase().includes(dest)) {
        return false;
      }
      if (date && r.date !== date) return false;
      return true;
    });
  }, [rides, destination, date]);

  const grouped = useMemo(() => {
    const out: Record<Group, Ride[]> = { leaving: [], coming: [], other: [], all: [] };
    for (const ride of filtered) out[classify(ride)].push(ride);
    return out;
  }, [filtered]);

  function handleUpdated(updated: Ride) {
    setRides((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  }

  function handleDeleted(rideId: string) {
    setRides((prev) => prev.filter((r) => r._id !== rideId));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <SectionSkeleton key={s.id} title={s.title} description={s.description} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-line bg-surface p-6 text-sm text-ink-muted">
        {error}
      </div>
    );
  }

  const filtersActive = destination.trim() !== "" || date !== "" || routeType !== "all";

  return (
    <div className="space-y-10">
      {showFilters ? (
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-5 rounded-lg border border-line bg-surface/30">
          <label className="block flex-1 min-w-0">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-muted">
              Filter by Destination
            </span>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Delhi, Gurgaon..."
              className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none transition-shadow"
            />
          </label>
          <label className="block sm:w-48">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-muted">
              Filter by Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none transition-shadow"
            />
          </label>
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setDestination("");
                setDate("");
                setRouteType("all");
              }}
              className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink w-full sm:w-auto"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
            Viewing:
          </span>
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
        <span className="text-xs text-ink-subtle">{filtered.length} rides found</span>
      </div>

      {SECTIONS.filter(s => routeType === "all" || s.id === routeType).map((section) => {
        const sectionRides = grouped[section.id];
        if (routeType === "all" && sectionRides.length === 0) return null;

        return (
          <section key={section.id}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                  {section.title}
                </h2>
                <p className="mt-1 text-xs text-ink-subtle">{section.description}</p>
              </div>
              <span className="text-xs text-ink-subtle">
                {sectionRides.length}
              </span>
            </div>

            {sectionRides.length === 0 ? (
              <div className="border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-ink-subtle">
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
          </section>
        );
      })}
    </div>
  );
}

function SectionSkeleton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
          {title}
        </h2>
        <p className="mt-1 text-xs text-ink-subtle">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex flex-col h-48 animate-pulse border border-line bg-surface p-5"
          >
            <div className="flex justify-between items-start">
              <div className="h-6 w-1/2 bg-line rounded"></div>
              <div className="h-5 w-16 bg-line rounded-full"></div>
            </div>
            <div className="mt-2 h-4 w-1/3 bg-line rounded"></div>
            <div className="flex-1"></div>
            <div className="mt-4 border-t border-line pt-4 flex justify-between items-end">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-line"></div>
                <div>
                  <div className="h-4 w-20 bg-line rounded mb-1.5"></div>
                  <div className="h-3 w-16 bg-line rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
