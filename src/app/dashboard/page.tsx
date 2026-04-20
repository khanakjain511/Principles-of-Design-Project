import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import RideFeed from "@/components/RideFeed";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Ride board
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Find shared rides with other students or post your own.
            </p>
          </div>
          <Link
            href="/rides/new"
            className="bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            Post a ride
          </Link>
        </div>

        <RideFeed currentUserId={session.user.id} />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-xs text-ink-subtle">
          <span>Campus Rides · For coordination only</span>
          <span>No payments. No bookings. Just a notice board.</span>
        </div>
      </footer>
    </div>
  );
}
