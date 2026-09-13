import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ItemCard } from "@/components/item-card";
import { CITIES, ITEM_CATEGORIES } from "@/lib/constants";
import { citySlug, titleCaseSlug } from "@/lib/format";
import { listLiveItems } from "@/lib/store";
import type { ItemCategory } from "@/lib/types";

function resolve(categoryParam: string, cityParam: string) {
  const category = ITEM_CATEGORIES.find((row) => row.slug === categoryParam);
  const city = CITIES.find((row) => citySlug(row.city) === cityParam);
  if (!category || !city) return null;
  return { category, city: city.city };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city } = await params;
  const place = resolve(slug, city);
  const label = place ? `${place.category.label} in ${place.city}` : `${titleCaseSlug(slug)} in ${titleCaseSlug(city)}`;
  return {
    title: `${label} for rent`,
    description: `Rent ${label.toLowerCase()} from people nearby on GoRent.ng.`,
  };
}

export default async function ItemCityLandingPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const place = resolve(slug, city);
  if (!place) notFound();
  const items = await listLiveItems({ category: place.category.value as ItemCategory, city: place.city });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="font-display text-3xl font-extrabold">
        {place.category.label} for rent in {place.city}
      </h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
