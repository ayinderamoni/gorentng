import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HousingCard } from "@/components/housing-card";
import { CITIES } from "@/lib/constants";
import { citySlug, titleCaseSlug } from "@/lib/format";
import { listLiveProperties } from "@/lib/store";

function resolvePlace(cityParam: string, areaParam: string) {
  for (const row of CITIES) {
    if (citySlug(row.city) !== cityParam) continue;
    const area = row.areas.find((name) => citySlug(name) === areaParam);
    if (area) return { city: row.city, area };
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; area: string }>;
}): Promise<Metadata> {
  const { city, area } = await params;
  const place = resolvePlace(city, area);
  const label = place ? `${place.area}, ${place.city}` : `${titleCaseSlug(area)}, ${titleCaseSlug(city)}`;
  return {
    title: `Apartments for rent in ${label}`,
    description: `Homes for rent in ${label} on GoRent.ng.`,
  };
}

export default async function CityLandingPage({
  params,
}: {
  params: Promise<{ city: string; area: string }>;
}) {
  const { city, area } = await params;
  const place = resolvePlace(city, area);
  if (!place) notFound();
  const properties = await listLiveProperties({ city: place.city, area: place.area });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">Apartments for rent in {place.area}, {place.city}</h1>
      <p className="mt-2 text-sm text-ink-soft">Yearly rentals in {place.area}. Switch to items anytime from the menu.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {properties.map((property) => (
          <HousingCard key={property.id} property={property} />
        ))}
      </div>
      {properties.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">No live homes in this area yet. Browse all listings instead.</p>
      ) : null}
    </div>
  );
}
