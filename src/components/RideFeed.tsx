"use client";

import { useEffect, useMemo, useState } from "react";
import RideCard, { type Ride } from "@/components/RideCard";
import { CAMPUS } from "@/lib/constants";

type Props = {
  currentUserId?: string;
  showFilters?: boolean;
};

type Group = "leaving" | "coming" | "other";

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
  if (from.includes(campus)) return "leaving";
  if (to.includes(campus)) return "coming";
  return "other";
}

export default function RideFeed({ currentUserId, showFilters = false }: Props) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

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
    const out: Record<Group, Ride[]> = { leaving: [], coming: [], other: [] };
    for (const ride of filtered) out[classify(ride)].push(ride);
    return out;
  }, [filtered]);

  function handleUpdated(updated: Ride) {
    setRides((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
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

  const filtersActive = destination.trim() !== "" || date !== "";

  return (
    <div className="space-y-10">
      {showFilters ? (
        <div className="flex flex-wrap items-end gap-3 border border-line bg-surface px-4 py-3">
          <label className="block min-w-0 flex-1">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Destination
            </span>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Delhi"
              className="w-full border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
            />
          </label>
          {filtersActive ? (
            <button
              type="button"
              onClick={() => {
                setDestination("");
                setDate("");
              }}
              className="border border-line bg-white px-3 py-2 text-xs font-medium text-ink-muted transition-colors hover:bg-white/70"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}

      {SECTIONS.map((section) => (
        <section key={section.id}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                {section.title}
              </h2>
              <p className="mt-1 text-xs text-ink-subtle">{section.description}</p>
            </div>
            <span className="text-xs text-ink-subtle">
              {grouped[section.id].length}
            </span>
          </div>

          {grouped[section.id].length === 0 ? (
            <div className="border border-dashed border-line bg-white px-4 py-8 text-center text-sm text-ink-subtle">
              No rides yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {grouped[section.id].map((ride) => (
                <RideCard
                  key={ride._id}
                  ride={ride}
                  currentUserId={currentUserId}
                  onUpdated={handleUpdated}
                />
              ))}
            </div>
          )}
        </section>
      ))}
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
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
          {title}
        </h2>
        <p className="mt-1 text-xs text-ink-subtle">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse border border-line bg-surface"
          />
        ))}
      </div>
    </section>
  );
}
