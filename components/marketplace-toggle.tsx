import Link from "next/link";

export function MarketplaceToggle({ active }: { active: "housing" | "items" }) {
  return (
    <div
      className="inline-flex rounded-full border border-ink/15 bg-cream p-1 font-head text-sm font-semibold"
      role="tablist"
      aria-label="Marketplace"
    >
      <Link
        href="/listings"
        role="tab"
        aria-selected={active === "housing"}
        className={`rounded-full px-4 py-2 ${active === "housing" ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"}`}
      >
        Homes
      </Link>
      <Link
        href="/rent-items"
        role="tab"
        aria-selected={active === "items"}
        className={`rounded-full px-4 py-2 ${active === "items" ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"}`}
      >
        Items
      </Link>
    </div>
  );
}
