import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import CreateRideForm from "@/components/CreateRideForm";

export const dynamic = "force-dynamic";

export default async function NewRidePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.14em] text-ink-subtle transition-colors hover:text-ink"
          >
            ← Back to board
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            Post a ride
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Share where you&rsquo;re going. Other students will reach out on WhatsApp.
          </p>
        </div>

        <div className="border border-line bg-white p-6">
          <CreateRideForm />
        </div>

        <p className="mt-6 text-xs text-ink-subtle">
          By posting, you agree this is for coordination only. The app does not
          handle payments or guarantee seats.
        </p>
      </main>
    </div>
  );
}
