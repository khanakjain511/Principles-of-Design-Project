"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

type Props = {
  showDashboard: boolean;
};

export default function NavLinks({ showDashboard }: Props) {
  const pathname = usePathname();

  const items: NavItem[] = [{ href: "/", label: "Home" }];
  if (showDashboard) items.push({ href: "/dashboard", label: "Dashboard" });

  return (
    <nav className="flex items-center gap-1 sm:gap-2 w-full justify-start sm:justify-center overflow-x-auto no-scrollbar">
      {items.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "bg-ink text-white px-3.5 py-1.5 rounded-full text-sm font-medium"
                : "text-ink-muted hover:text-ink hover:bg-surface px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
