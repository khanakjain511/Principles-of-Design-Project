import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import RideFeed from "@/components/RideFeed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Browse rides
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              See what other students have posted. Use the filters to narrow by
              destination or date, then reach out on WhatsApp.
            </p>
          </div>
          {session?.user ? (
            <Link
              href="/rides/new"
              className="bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              Post a ride
            </Link>
          ) : (
            <Link
              href="/login"
              className="border border-line bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              Sign in to post
            </Link>
          )}
        </div>

        <RideFeed currentUserId={session?.user?.id} showFilters />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-xs text-ink-subtle">
          <span>SmartRide Connect · Coordination, not booking.</span>
        </div>
      </footer>
    </div>
  );
}
