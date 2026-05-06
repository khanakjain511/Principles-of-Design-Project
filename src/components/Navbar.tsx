import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import NavLinks from "@/components/NavLinks";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-ink shrink-0"
            >
              SmartRide Connect
            </Link>

            <div className="hidden sm:block">
              <NavLinks showDashboard={Boolean(user)} />
            </div>
          </div>

          {user ? (
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2.5">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div className="grid h-7 w-7 place-items-center rounded-full border border-line bg-surface text-[11px] font-bold text-ink-muted">
                    {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-semibold text-ink">{user.name}</span>
              </div>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90 shrink-0"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile Navigation Row */}
        <div className="block sm:hidden border-t border-line py-3 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <NavLinks showDashboard={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
