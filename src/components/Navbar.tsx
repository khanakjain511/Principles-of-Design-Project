import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-tight text-ink"
        >
          Campus Rides
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "User"}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full border border-line"
                />
              ) : (
                <div className="grid h-6 w-6 place-items-center rounded-full border border-line bg-surface text-[10px] font-medium text-ink-muted">
                  {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-ink">{user.name}</span>
            </div>
            <SignOutButton />
          </div>
        ) : null}
      </div>
    </header>
  );
}
