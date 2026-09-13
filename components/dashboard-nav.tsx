import Link from "next/link";

import type { Role } from "@/lib/types";

const LINKS: { href: string; label: string; role?: Role }[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/landlord", label: "Landlord", role: "landlord" },
  { href: "/dashboard/tenant", label: "Tenant", role: "tenant" },
  { href: "/dashboard/lender", label: "Item lender", role: "lender" },
  { href: "/dashboard/renter", label: "Item renter", role: "renter" },
];

export function DashboardNav({ roles, current }: { roles: Role[]; current: string }) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Dashboard roles">
      {LINKS.filter((link) => !link.role || roles.includes(link.role) || link.href === current).map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`shrink-0 rounded-full px-3 py-1.5 font-head text-sm font-semibold ${
            current === link.href ? "bg-ink text-cream" : "border border-ink/15 text-ink-soft hover:text-ink"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
