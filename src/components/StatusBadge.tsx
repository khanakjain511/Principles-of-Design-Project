import type { RideStatus } from "@/lib/constants";

const STYLES: Record<RideStatus, string> = {
  active: "border-line bg-white text-ink",
  full: "border-line bg-surface text-ink-muted",
  expired: "border-line bg-surface text-ink-subtle",
};

const LABELS: Record<RideStatus, string> = {
  active: "Active",
  full: "Full",
  expired: "Expired",
};

export default function StatusBadge({ status }: { status: RideStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active" ? "bg-emerald-500" : "bg-ink-subtle"
        }`}
      />
      {LABELS[status]}
    </span>
  );
}
