import type { ItemCategory, PropertyType } from "@/lib/types";

export const SITE_NAME = "GoRent.ng";
export const SITE_TAGLINE = "Homes and items for rent across Nigeria.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gorent.ng";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "flat", label: "Flat" },
  { value: "duplex", label: "Duplex" },
  { value: "bungalow", label: "Bungalow" },
  { value: "studio", label: "Studio" },
  { value: "terrace", label: "Terrace" },
  { value: "room", label: "Room" },
];

export const PHOTO_LABELS = [
  "Living",
  "Bedroom",
  "Dining",
  "Kitchen",
  "Bathroom",
  "Compound",
  "Exterior",
  "Balcony",
  "Parking",
  "Other",
] as const;

export const MAX_HOUSING_PHOTOS = 12;

export const AMENITIES = [
  "Prepaid meter",
  "Water",
  "Security",
  "Parking",
  "Generator",
  "POP ceiling",
  "Wardrobes",
  "Kitchen cabinets",
  "Tiled floors",
  "Estate",
  "Borehole",
  "Air conditioning",
];

export const ITEM_CATEGORIES: { value: ItemCategory; label: string; slug: string }[] = [
  { value: "generators", label: "Power & Generators", slug: "generators" },
  { value: "tools", label: "Tools & Equipment", slug: "tools" },
  { value: "electronics", label: "Electronics & AV", slug: "electronics" },
  { value: "appliances", label: "Home & Appliances", slug: "appliances" },
  { value: "events", label: "Events & Party", slug: "events" },
];

export const ITEM_CONDITIONS = [
  { value: "new", label: "Brand new" },
  { value: "like_new", label: "Like new" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
] as const;

export const CITIES: { city: string; areas: string[] }[] = [
  { city: "Lagos", areas: ["Lekki", "Ikoyi", "Ikeja", "Yaba", "Surulere", "Ajah", "Victoria Island", "Agege"] },
  { city: "Abuja", areas: ["Gwarinpa", "Wuse", "Maitama", "Garki", "Jabi"] },
  { city: "Ogun", areas: ["Abeokuta", "Sango Ota", "Ijebu Ode", "Magboro"] },
  { city: "Oyo", areas: ["Ibadan", "Bodija", "Ogbomosho", "Oyo Town"] },
  { city: "Port Harcourt", areas: ["GRA", "Trans Amadi", "Rumuola"] },
  { city: "Ibadan", areas: ["Bodija", "Iwo Road", "Ring Road"] },
];

export const SESSION_COOKIE = "gorent_session";
