import type { Metadata } from "next";

import { HousingCard } from "@/components/housing-card";
import { MarketplaceToggle } from "@/components/marketplace-toggle";
import { getCurrentUser } from "@/lib/auth";
import { CITIES, PROPERTY_TYPES } from "@/lib/constants";
import { listFavoriteIds, listLiveProperties } from "@/lib/store";
import type { PropertyType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Apartments for rent in Nigeria",
  description: "Browse homes for rent across Lagos, Abuja and more on GoRent.ng.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; area?: string; bedrooms?: string; propertyType?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const favorites = await listFavoriteIds(user?.id ?? null);
  const properties = await listLiveProperties({
    city: params.city,
    area: params.area,
    bedrooms: params.bedrooms ? Number(params.bedrooms) : undefined,
    propertyType: params.propertyType as PropertyType | undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Homes for rent</h1>
          <p className="mt-2 text-sm text-ink-soft">Yearly rentals listed by owners and managers across Nigeria.</p>
        </div>
        <MarketplaceToggle active="housing" />
      </div>
      <form className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-cream p-4 sm:grid-cols-2 lg:grid-cols-6">
        <select name="city" defaultValue={params.city ?? ""} className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm">
          <option value="">All cities</option>
          {CITIES.map((row) => (
            <option key={row.city} value={row.city}>{row.city}</option>
          ))}
        </select>
        <input name="area" defaultValue={params.area ?? ""} placeholder="Area" className="rounded-xl border border-ink/15 px-3 py-2 text-sm" />
        <select name="bedrooms" defaultValue={params.bedrooms ?? ""} className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm">
          <option value="">Any beds</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
        <select name="propertyType" defaultValue={params.propertyType ?? ""} className="rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm">
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((row) => (
            <option key={row.value} value={row.value}>{row.label}</option>
          ))}
        </select>
        <input name="maxPrice" type="number" defaultValue={params.maxPrice ?? ""} placeholder="Max ₦/year" className="rounded-xl border border-ink/15 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-xl bg-ink px-3 py-2 font-head text-sm font-semibold text-cream">Filter</button>
      </form>
      <p className="mt-6 text-sm text-ink-soft">{properties.length} live listing{properties.length === 1 ? "" : "s"}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {properties.map((property) => (
          <HousingCard
            key={property.id}
            property={property}
            canSave={Boolean(user)}
            saved={favorites.propertyIds.has(property.id)}
          />
        ))}
      </div>
    </div>
  );
}
