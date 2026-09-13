import type { Metadata } from "next";

import { ItemCard } from "@/components/item-card";
import { MarketplaceToggle } from "@/components/marketplace-toggle";
import { getCurrentUser } from "@/lib/auth";
import { CITIES, ITEM_CATEGORIES } from "@/lib/constants";
import { listFavoriteIds, listLiveItems } from "@/lib/store";
import type { ItemCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Rent generators, tools and appliances",
  description: "Borrow everyday items from people nearby — generators, projectors, sewing machines and work tools.",
};

export default async function RentItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string; area?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const favorites = await listFavoriteIds(user?.id ?? null);
  const items = await listLiveItems({
    category: params.category as ItemCategory | undefined,
    city: params.city,
    area: params.area,
    maxPricePerDay: params.maxPrice ? Number(params.maxPrice) : undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Items for rent</h1>
          <p className="mt-2 text-sm text-ink-soft">Generators, tools, appliances and more — same marketplace as homes.</p>
        </div>
        <MarketplaceToggle active="items" />
      </div>
      <form className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-4 sm:grid-cols-2 lg:grid-cols-5">
        <select name="category" defaultValue={params.category ?? ""} className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm">
          <option value="">All categories</option>
          {ITEM_CATEGORIES.map((row) => (
            <option key={row.value} value={row.value}>{row.label}</option>
          ))}
        </select>
        <select name="city" defaultValue={params.city ?? ""} className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm">
          <option value="">All cities</option>
          {CITIES.map((row) => (
            <option key={row.city} value={row.city}>{row.city}</option>
          ))}
        </select>
        <input name="area" defaultValue={params.area ?? ""} placeholder="Area" className="rounded-xl border border-ink/15 px-3 py-2 text-sm" />
        <input name="maxPrice" type="number" defaultValue={params.maxPrice ?? ""} placeholder="Max ₦/day" className="rounded-xl border border-ink/15 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-ink px-3 py-2 font-head text-sm font-semibold text-cream">Filter</button>
      </form>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} canSave={Boolean(user)} saved={favorites.itemIds.has(item.id)} />
        ))}
      </div>
    </div>
  );
}
