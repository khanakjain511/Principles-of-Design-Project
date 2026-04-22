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
    <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 sm:flex">
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
                ? "border-b border-ink pb-0.5 text-sm font-medium text-ink"
                : "border-b border-transparent pb-0.5 text-sm text-ink-muted transition-colors hover:text-ink"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
