import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { formatNaira } from "@/lib/format";
import type { ItemWithMeta, PropertyWithMeta } from "@/lib/types";

export function housingTitle(property: PropertyWithMeta) {
  return `${property.bedrooms}-Bedroom ${capitalize(property.propertyType)} for Rent in ${property.area}, ${property.city} — ${formatNaira(property.priceYearly)}/year | ${SITE_NAME}`;
}

export function housingDescription(property: PropertyWithMeta) {
  return `${property.title} in ${property.area}, ${property.city}. ${formatNaira(property.priceYearly)}/year. ${property.description.slice(0, 140)}`;
}

export function itemTitle(item: ItemWithMeta) {
  const period = item.pricePerWeek ? `${formatNaira(item.pricePerDay)}/day` : `${formatNaira(item.pricePerDay)}/day`;
  return `${item.title} for Rent in ${item.pickupArea}, ${item.pickupCity} — ${period} | ${SITE_NAME}`;
}

export function itemDescription(item: ItemWithMeta) {
  return `${item.title} available to rent in ${item.pickupArea}, ${item.pickupCity} from ${formatNaira(item.pricePerDay)}/day. ${item.description.slice(0, 140)}`;
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function housingJsonLd(property: PropertyWithMeta) {
  const photo = property.media.find((m) => m.kind === "photo")?.url;
  return {
    "@context": "https://schema.org",
    "@type": property.propertyType === "apartment" || property.propertyType === "flat" ? "Apartment" : "Residence",
    name: property.title,
    description: property.description,
    image: photo ? absoluteUrl(photo) : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.area,
      addressRegion: property.city,
      addressCountry: "NG",
    },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    offers: {
      "@type": "Offer",
      price: property.priceYearly,
      priceCurrency: "NGN",
      availability: property.occupancyStatus === "vacant" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/listings/${property.slug}`),
    },
  };
}

export function itemJsonLd(item: ItemWithMeta) {
  const photo = item.media[0]?.url;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description: item.description,
    image: photo ? absoluteUrl(photo) : undefined,
    brand: SITE_NAME,
    offers: {
      "@type": "Offer",
      price: item.pricePerDay,
      priceCurrency: "NGN",
      availability: item.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/rent-items/${item.slug}`),
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    },
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
