import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import DashboardRides from "@/components/DashboardRides";
import GenderPrompt from "@/components/GenderPrompt";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <GenderPrompt />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Your dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Post a ride and manage the ones you&rsquo;ve already shared.
          </p>
        </div>

        <DashboardRides currentUserId={session.user.id} />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-xs text-ink-subtle">
          <span>SmartRide Connect · Coordination, not booking.</span>
        </div>
      </footer>
    </div>
  );
}
