import type { MetadataRoute } from "next";

import { CITIES, ITEM_CATEGORIES, SITE_URL } from "@/lib/constants";
import { citySlug } from "@/lib/format";
import { listLiveItems, listLiveProperties } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [liveHousing, liveItems] = await Promise.all([listLiveProperties(), listLiveItems()]);
  const staticRoutes = ["", "/listings", "/rent-items", "/report", "/login", "/signup"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const housing = liveHousing.map((property) => ({
    url: `${SITE_URL}/listings/${property.slug}`,
    lastModified: new Date(property.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const items = liveItems.map((item) => ({
    url: `${SITE_URL}/rent-items/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const cityPages = CITIES.flatMap((row) =>
    row.areas.map((area) => ({
      url: `${SITE_URL}/rent/${citySlug(row.city)}/${citySlug(area)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  const itemLandings = ITEM_CATEGORIES.flatMap((category) =>
    CITIES.map((row) => ({
      url: `${SITE_URL}/rent-items/${category.slug}/${citySlug(row.city)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  );

  return [...staticRoutes, ...housing, ...items, ...cityPages, ...itemLandings];
}
