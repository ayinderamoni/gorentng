import { randomUUID } from "crypto";

import { averageRating, rangesOverlap, slugify } from "@/lib/format";
import {
  seedBookings,
  seedItemMedia,
  seedItems,
  seedListingMedia,
  seedProfiles,
  seedProperties,
  seedReviews,
  seedTenancies,
} from "@/lib/store/seed";
import type {
  Application,
  Favorite,
  HousingFilters,
  Item,
  ItemAvailability,
  ItemBooking,
  ItemFilters,
  ItemMedia,
  ItemWithMeta,
  ListingMedia,
  MaintenanceRecord,
  Profile,
  Property,
  PropertyWithMeta,
  RentPayment,
  Report,
  Review,
  Role,
  Tenancy,
} from "@/lib/types";

interface MemoryStore {
  profiles: Profile[];
  properties: Property[];
  listingMedia: ListingMedia[];
  applications: Application[];
  tenancies: Tenancy[];
  maintenance: MaintenanceRecord[];
  payments: RentPayment[];
  items: Item[];
  itemMedia: ItemMedia[];
  bookings: ItemBooking[];
  availability: ItemAvailability[];
  reviews: Review[];
  reports: Report[];
  favorites: Favorite[];
}

function createStore(): MemoryStore {
  return {
    profiles: structuredClone(seedProfiles),
    properties: structuredClone(seedProperties),
    listingMedia: structuredClone(seedListingMedia),
    applications: [
      {
        id: "app-ikoyi",
        propertyId: "prop-ikoyi",
        tenantId: "user-adaeze",
        status: "approved",
        moveInDate: "2026-01-15",
        message: "I work nearby and can move in mid-January.",
        income: "₦4.2m/year",
        employment: "Product designer, remote",
        createdAt: "2026-01-04T10:00:00.000Z",
      },
    ],
    tenancies: structuredClone(seedTenancies),
    maintenance: [
      {
        id: "maint-1",
        propertyId: "prop-ikoyi",
        date: "2026-04-11",
        description: "Replaced kitchen tap and washer",
        cost: 18500,
      },
    ],
    payments: [
      {
        id: "pay-1",
        tenancyId: "ten-ikoyi",
        date: "2026-01-12",
        amount: 1800000,
        note: "Full year, bank transfer",
      },
    ],
    items: structuredClone(seedItems),
    itemMedia: structuredClone(seedItemMedia),
    bookings: structuredClone(seedBookings),
    availability: [],
    reviews: structuredClone(seedReviews),
    reports: [],
    favorites: [],
  };
}

const globalForStore = globalThis as unknown as { __gorentStore?: MemoryStore };
export const store = globalForStore.__gorentStore ?? createStore();
globalForStore.__gorentStore = store;

function addRole(profile: Profile, role: Role) {
  if (!profile.roles.includes(role)) profile.roles.push(role);
}

function uniqueSlug(base: string, existing: string[]) {
  const root = slugify(base) || "listing";
  let slug = root;
  let n = 2;
  while (existing.includes(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

function profileRating(profileId: string) {
  const ratings = store.reviews.filter((review) => review.revieweeId === profileId).map((review) => review.rating);
  return { rating: averageRating(ratings), reviewCount: ratings.length };
}

function hydrateProperty(property: Property): PropertyWithMeta {
  const landlord = store.profiles.find((profile) => profile.id === property.landlordId) ?? store.profiles[0];
  const { rating, reviewCount } = profileRating(property.landlordId);
  return {
    ...property,
    media: store.listingMedia.filter((media) => media.propertyId === property.id).sort((a, b) => a.sortOrder - b.sortOrder),
    landlord,
    rating,
    reviewCount,
  };
}

function hydrateItem(item: Item): ItemWithMeta {
  const lender = store.profiles.find((profile) => profile.id === item.lenderId) ?? store.profiles[0];
  const { rating, reviewCount } = profileRating(item.lenderId);
  return {
    ...item,
    media: store.itemMedia.filter((media) => media.itemId === item.id).sort((a, b) => a.sortOrder - b.sortOrder),
    lender,
    rating,
    reviewCount,
  };
}

export function listLiveProperties(filters: HousingFilters = {}): PropertyWithMeta[] {
  return store.properties
    .filter((property) => property.listingStatus === "live")
    .filter((property) => (filters.city ? property.city.toLowerCase() === filters.city.toLowerCase() : true))
    .filter((property) => (filters.area ? property.area.toLowerCase() === filters.area.toLowerCase() : true))
    .filter((property) => (filters.propertyType ? property.propertyType === filters.propertyType : true))
    .filter((property) => (filters.bedrooms ? property.bedrooms >= filters.bedrooms : true))
    .filter((property) => (filters.minPrice ? property.priceYearly >= filters.minPrice : true))
    .filter((property) => (filters.maxPrice ? property.priceYearly <= filters.maxPrice : true))
    .map(hydrateProperty)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPropertyBySlug(slug: string) {
  const property = store.properties.find((row) => row.slug === slug);
  return property ? hydrateProperty(property) : null;
}

export function getPropertyById(id: string) {
  const property = store.properties.find((row) => row.id === id);
  return property ? hydrateProperty(property) : null;
}

export function listPropertiesByLandlord(landlordId: string) {
  return store.properties.filter((property) => property.landlordId === landlordId).map(hydrateProperty);
}

export function listLiveItems(filters: ItemFilters = {}): ItemWithMeta[] {
  return store.items
    .filter((item) => item.status === "available")
    .filter((item) => (filters.category ? item.category === filters.category : true))
    .filter((item) => (filters.city ? item.pickupCity.toLowerCase() === filters.city.toLowerCase() : true))
    .filter((item) => (filters.area ? item.pickupArea.toLowerCase() === filters.area.toLowerCase() : true))
    .filter((item) => (filters.maxPricePerDay ? item.pricePerDay <= filters.maxPricePerDay : true))
    .map(hydrateItem)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getItemBySlug(slug: string) {
  const item = store.items.find((row) => row.slug === slug);
  return item ? hydrateItem(item) : null;
}

export function getItemById(id: string) {
  const item = store.items.find((row) => row.id === id);
  return item ? hydrateItem(item) : null;
}

export function listItemsByLender(lenderId: string) {
  return store.items.filter((item) => item.lenderId === lenderId).map(hydrateItem);
}

export function getProfile(id: string) {
  return store.profiles.find((profile) => profile.id === id) ?? null;
}

export function getProfileByEmail(email: string) {
  return store.profiles.find((profile) => profile.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function upsertProfile(input: { email: string; fullName: string; phone?: string }) {
  const existing = getProfileByEmail(input.email);
  if (existing) {
    existing.fullName = input.fullName || existing.fullName;
    if (input.phone) existing.phone = input.phone;
    return existing;
  }
  const profile: Profile = {
    id: randomUUID(),
    email: input.email.toLowerCase(),
    fullName: input.fullName,
    phone: input.phone ?? null,
    avatarUrl: null,
    roles: [],
    createdAt: new Date().toISOString(),
  };
  store.profiles.push(profile);
  return profile;
}

/** Keep the signed-in user in the demo store so listings/bookings can attach to their id. */
export function ensureProfile(input: Profile) {
  const existing = getProfile(input.id);
  if (existing) {
    existing.email = input.email || existing.email;
    existing.fullName = input.fullName || existing.fullName;
    if (input.phone) existing.phone = input.phone;
    if (input.avatarUrl) existing.avatarUrl = input.avatarUrl;
    for (const role of input.roles) addRole(existing, role);
    return existing;
  }

  const profile: Profile = {
    id: input.id,
    email: input.email.toLowerCase(),
    fullName: input.fullName,
    phone: input.phone,
    avatarUrl: input.avatarUrl,
    roles: [...input.roles],
    createdAt: input.createdAt,
  };
  store.profiles.push(profile);
  return profile;
}

export function createProperty(
  landlordId: string,
  input: Omit<Property, "id" | "landlordId" | "slug" | "createdAt" | "updatedAt" | "listingStatus" | "occupancyStatus"> & {
    listingStatus?: Property["listingStatus"];
    media?: { url: string; kind: ListingMedia["kind"]; label?: string | null }[];
  },
) {
  const landlord = getProfile(landlordId);
  if (!landlord) throw new Error("Profile not found");
  addRole(landlord, "landlord");
  const now = new Date().toISOString();
  const property: Property = {
    id: randomUUID(),
    landlordId,
    slug: uniqueSlug(`${input.title}-${input.area}-${input.city}`, store.properties.map((row) => row.slug)),
    title: input.title,
    description: input.description,
    address: input.address,
    city: input.city,
    area: input.area,
    propertyType: input.propertyType,
    priceYearly: input.priceYearly,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    amenities: input.amenities,
    listingStatus: input.listingStatus ?? "live",
    occupancyStatus: "vacant",
    createdAt: now,
    updatedAt: now,
  };
  store.properties.push(property);
  (input.media ?? []).forEach((media, index) => {
    store.listingMedia.push({
      id: randomUUID(),
      propertyId: property.id,
      url: media.url,
      kind: media.kind,
      label: media.kind === "photo" ? media.label?.trim() || null : null,
      sortOrder: index,
    });
  });
  return hydrateProperty(property);
}

export function updateProperty(
  landlordId: string,
  propertyId: string,
  input: Partial<Omit<Property, "id" | "landlordId" | "slug" | "createdAt">> & {
    media?: { url: string; kind: ListingMedia["kind"]; label?: string | null }[];
  },
) {
  const property = store.properties.find((row) => row.id === propertyId && row.landlordId === landlordId);
  if (!property) throw new Error("You can only edit your own listing");
  Object.assign(property, {
    title: input.title ?? property.title,
    description: input.description ?? property.description,
    address: input.address ?? property.address,
    city: input.city ?? property.city,
    area: input.area ?? property.area,
    propertyType: input.propertyType ?? property.propertyType,
    priceYearly: input.priceYearly ?? property.priceYearly,
    bedrooms: input.bedrooms ?? property.bedrooms,
    bathrooms: input.bathrooms ?? property.bathrooms,
    amenities: input.amenities ?? property.amenities,
    listingStatus: input.listingStatus ?? property.listingStatus,
    occupancyStatus: input.occupancyStatus ?? property.occupancyStatus,
    updatedAt: new Date().toISOString(),
  });
  if (input.media) {
    store.listingMedia = store.listingMedia.filter((media) => media.propertyId !== property.id);
    input.media.forEach((media, index) => {
      store.listingMedia.push({
        id: randomUUID(),
        propertyId: property.id,
        url: media.url,
        kind: media.kind,
        label: media.kind === "photo" ? media.label?.trim() || null : null,
        sortOrder: index,
      });
    });
  }
  return hydrateProperty(property);
}

export function createItem(
  lenderId: string,
  input: Omit<Item, "id" | "lenderId" | "slug" | "createdAt" | "updatedAt" | "status"> & {
    status?: Item["status"];
    media?: { url: string }[];
  },
) {
  const lender = getProfile(lenderId);
  if (!lender) throw new Error("Profile not found");
  addRole(lender, "lender");
  const now = new Date().toISOString();
  const item: Item = {
    id: randomUUID(),
    lenderId,
    slug: uniqueSlug(`${input.title}-${input.pickupArea}-${input.pickupCity}`, store.items.map((row) => row.slug)),
    title: input.title,
    category: input.category,
    description: input.description,
    condition: input.condition,
    pricePerDay: input.pricePerDay,
    pricePerWeek: input.pricePerWeek,
    pickupCity: input.pickupCity,
    pickupArea: input.pickupArea,
    status: input.status ?? "available",
    createdAt: now,
    updatedAt: now,
  };
  store.items.push(item);
  (input.media ?? []).forEach((media, index) => {
    store.itemMedia.push({ id: randomUUID(), itemId: item.id, url: media.url, sortOrder: index });
  });
  return hydrateItem(item);
}

export function updateItem(
  lenderId: string,
  itemId: string,
  input: Partial<Omit<Item, "id" | "lenderId" | "slug" | "createdAt">> & { media?: { url: string }[] },
) {
  const item = store.items.find((row) => row.id === itemId && row.lenderId === lenderId);
  if (!item) throw new Error("You can only edit your own item");
  Object.assign(item, {
    ...input,
    media: undefined,
    updatedAt: new Date().toISOString(),
  });
  if (input.media) {
    store.itemMedia = store.itemMedia.filter((media) => media.itemId !== item.id);
    input.media.forEach((media, index) => {
      store.itemMedia.push({ id: randomUUID(), itemId: item.id, url: media.url, sortOrder: index });
    });
  }
  return hydrateItem(item);
}

export function createApplication(
  tenantId: string,
  input: { propertyId: string; moveInDate: string; message: string; income?: string; employment?: string },
) {
  const tenant = getProfile(tenantId);
  const property = store.properties.find((row) => row.id === input.propertyId && row.listingStatus === "live");
  if (!tenant || !property) throw new Error("Listing not found");
  if (property.landlordId === tenantId) throw new Error("You cannot apply to your own listing");
  const duplicate = store.applications.find(
    (row) => row.propertyId === input.propertyId && row.tenantId === tenantId && row.status === "pending",
  );
  if (duplicate) throw new Error("You already have a pending application");
  addRole(tenant, "tenant");
  const application: Application = {
    id: randomUUID(),
    propertyId: input.propertyId,
    tenantId,
    status: "pending",
    moveInDate: input.moveInDate,
    message: input.message,
    income: input.income ?? null,
    employment: input.employment ?? null,
    createdAt: new Date().toISOString(),
  };
  store.applications.push(application);
  return application;
}

export function listApplicationsForLandlord(landlordId: string) {
  const ids = store.properties.filter((property) => property.landlordId === landlordId).map((property) => property.id);
  return store.applications
    .filter((application) => ids.includes(application.propertyId))
    .map((application) => ({
      ...application,
      property: getPropertyById(application.propertyId),
      tenant: getProfile(application.tenantId),
    }));
}

export function listApplicationsForTenant(tenantId: string) {
  return store.applications
    .filter((application) => application.tenantId === tenantId)
    .map((application) => ({ ...application, property: getPropertyById(application.propertyId) }));
}

export function decideApplication(landlordId: string, applicationId: string, decision: "approved" | "declined") {
  const application = store.applications.find((row) => row.id === applicationId);
  if (!application) throw new Error("Application not found");
  const property = store.properties.find((row) => row.id === application.propertyId && row.landlordId === landlordId);
  if (!property) throw new Error("Not your listing");
  if (application.status !== "pending") throw new Error("This application was already decided");
  application.status = decision;
  if (decision === "declined") return { application, tenancy: null };
  property.occupancyStatus = "occupied";
  const tenancy: Tenancy = {
    id: randomUUID(),
    propertyId: property.id,
    tenantId: application.tenantId,
    landlordId,
    applicationId: application.id,
    startDate: application.moveInDate,
    endDate: null,
    createdAt: new Date().toISOString(),
  };
  store.tenancies.push(tenancy);
  return { application, tenancy };
}

export function endTenancy(landlordId: string, tenancyId: string, endDate: string) {
  const tenancy = store.tenancies.find((row) => row.id === tenancyId && row.landlordId === landlordId);
  if (!tenancy) throw new Error("Tenancy not found");
  tenancy.endDate = endDate;
  const property = store.properties.find((row) => row.id === tenancy.propertyId);
  const stillOccupied = store.tenancies.some((row) => row.propertyId === tenancy.propertyId && !row.endDate);
  if (property && !stillOccupied) property.occupancyStatus = "vacant";
  return tenancy;
}

export function listTenanciesForLandlord(landlordId: string) {
  return store.tenancies
    .filter((tenancy) => tenancy.landlordId === landlordId)
    .map((tenancy) => ({
      ...tenancy,
      property: getPropertyById(tenancy.propertyId),
      tenant: getProfile(tenancy.tenantId),
    }));
}

export function listTenanciesForTenant(tenantId: string) {
  return store.tenancies
    .filter((tenancy) => tenancy.tenantId === tenantId)
    .map((tenancy) => ({
      ...tenancy,
      property: getPropertyById(tenancy.propertyId),
      landlord: getProfile(tenancy.landlordId),
    }));
}

export function addMaintenance(landlordId: string, input: { propertyId: string; date: string; description: string; cost: number }) {
  const property = store.properties.find((row) => row.id === input.propertyId && row.landlordId === landlordId);
  if (!property) throw new Error("Not your property");
  const record: MaintenanceRecord = { id: randomUUID(), ...input };
  store.maintenance.push(record);
  return record;
}

export function listMaintenance(propertyId: string) {
  return store.maintenance.filter((row) => row.propertyId === propertyId).sort((a, b) => b.date.localeCompare(a.date));
}

export function addRentPayment(landlordId: string, input: { tenancyId: string; date: string; amount: number; note: string }) {
  const tenancy = store.tenancies.find((row) => row.id === input.tenancyId && row.landlordId === landlordId);
  if (!tenancy) throw new Error("Not your tenancy");
  const payment: RentPayment = { id: randomUUID(), ...input };
  store.payments.push(payment);
  return payment;
}

export function listPaymentsForTenancy(tenancyId: string) {
  return store.payments.filter((row) => row.tenancyId === tenancyId);
}

export function earningsForLandlord(landlordId: string) {
  const tenancyIds = store.tenancies.filter((row) => row.landlordId === landlordId).map((row) => row.id);
  return store.payments.filter((row) => tenancyIds.includes(row.tenancyId));
}

export function createBooking(
  renterId: string,
  input: { itemId: string; startDate: string; endDate: string; message: string },
) {
  const renter = getProfile(renterId);
  const item = store.items.find((row) => row.id === input.itemId && row.status === "available");
  if (!renter || !item) throw new Error("Item not found");
  if (item.lenderId === renterId) throw new Error("You cannot book your own item");
  assertItemFree(item.id, input.startDate, input.endDate);
  addRole(renter, "renter");
  const days = Math.max(1, dateDiffDays(input.startDate, input.endDate) + 1);
  const agreedPrice =
    item.pricePerWeek && days >= 7
      ? Math.round((days / 7) * item.pricePerWeek)
      : days * item.pricePerDay;
  const booking: ItemBooking = {
    id: randomUUID(),
    itemId: item.id,
    renterId,
    lenderId: item.lenderId,
    status: "pending",
    startDate: input.startDate,
    endDate: input.endDate,
    agreedPrice,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
  store.bookings.push(booking);
  return booking;
}

export function decideBooking(lenderId: string, bookingId: string, decision: "approved" | "declined") {
  const booking = store.bookings.find((row) => row.id === bookingId && row.lenderId === lenderId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "pending") throw new Error("Already decided");
  if (decision === "approved") assertItemFree(booking.itemId, booking.startDate, booking.endDate, booking.id);
  booking.status = decision;
  return booking;
}

export function completeBooking(lenderId: string, bookingId: string) {
  const booking = store.bookings.find((row) => row.id === bookingId && row.lenderId === lenderId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "approved") throw new Error("Only approved bookings can be completed");
  booking.status = "completed";
  return booking;
}

export function listBookingsForLender(lenderId: string) {
  return store.bookings
    .filter((booking) => booking.lenderId === lenderId)
    .map((booking) => ({
      ...booking,
      item: getItemById(booking.itemId),
      renter: getProfile(booking.renterId),
    }));
}

export function listBookingsForRenter(renterId: string) {
  return store.bookings
    .filter((booking) => booking.renterId === renterId)
    .map((booking) => ({ ...booking, item: getItemById(booking.itemId), lender: getProfile(booking.lenderId) }));
}

export function addAvailability(lenderId: string, input: { itemId: string; startDate: string; endDate: string; note: string }) {
  const item = store.items.find((row) => row.id === input.itemId && row.lenderId === lenderId);
  if (!item) throw new Error("Not your item");
  const block: ItemAvailability = { id: randomUUID(), ...input };
  store.availability.push(block);
  return block;
}

export function listAvailability(itemId: string) {
  return store.availability.filter((row) => row.itemId === itemId);
}

export function createReview(
  reviewerId: string,
  input: { tenancyId?: string; itemBookingId?: string; rating: number; comment: string },
) {
  if (!!input.tenancyId === !!input.itemBookingId) {
    throw new Error("A review must be tied to one tenancy or one completed booking");
  }
  if (input.rating < 1 || input.rating > 5) throw new Error("Rating must be 1–5");

  if (input.tenancyId) {
    const tenancy = store.tenancies.find((row) => row.id === input.tenancyId);
    if (!tenancy) throw new Error("Tenancy not found");
    const isTenant = tenancy.tenantId === reviewerId;
    const isLandlord = tenancy.landlordId === reviewerId;
    if (!isTenant && !isLandlord) throw new Error("You can only review someone you have a tenancy with");
    const direction = isTenant ? "tenant_to_landlord" : "landlord_to_tenant";
    const revieweeId = isTenant ? tenancy.landlordId : tenancy.tenantId;
    if (store.reviews.some((row) => row.tenancyId === tenancy.id && row.reviewerId === reviewerId)) {
      throw new Error("You already reviewed this tenancy");
    }
    const review: Review = {
      id: randomUUID(),
      reviewerId,
      revieweeId,
      tenancyId: tenancy.id,
      itemBookingId: null,
      rating: input.rating,
      comment: input.comment,
      direction,
      createdAt: new Date().toISOString(),
    };
    store.reviews.push(review);
    return review;
  }

  const booking = store.bookings.find((row) => row.id === input.itemBookingId);
  if (!booking || booking.status !== "completed") throw new Error("Reviews need a completed rental");
  const isRenter = booking.renterId === reviewerId;
  const isLender = booking.lenderId === reviewerId;
  if (!isRenter && !isLender) throw new Error("You can only review someone you completed a rental with");
  const direction = isRenter ? "renter_to_lender" : "lender_to_renter";
  const revieweeId = isRenter ? booking.lenderId : booking.renterId;
  if (store.reviews.some((row) => row.itemBookingId === booking.id && row.reviewerId === reviewerId)) {
    throw new Error("You already reviewed this rental");
  }
  const review: Review = {
    id: randomUUID(),
    reviewerId,
    revieweeId,
    tenancyId: null,
    itemBookingId: booking.id,
    rating: input.rating,
    comment: input.comment,
    direction,
    createdAt: new Date().toISOString(),
  };
  store.reviews.push(review);
  return review;
}

export function createReport(input: {
  reporterId: string | null;
  propertyId?: string;
  landlordId?: string;
  description: string;
  evidenceUrl?: string;
  contact?: string;
}) {
  const report: Report = {
    id: randomUUID(),
    reporterId: input.reporterId,
    propertyId: input.propertyId ?? null,
    landlordId: input.landlordId ?? null,
    description: input.description,
    evidenceUrl: input.evidenceUrl ?? null,
    contact: input.contact ?? null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.reports.push(report);
  return report;
}

export function toggleFavorite(userId: string, input: { propertyId?: string; itemId?: string }) {
  const existing = store.favorites.find(
    (row) =>
      row.userId === userId &&
      row.propertyId === (input.propertyId ?? null) &&
      row.itemId === (input.itemId ?? null),
  );
  if (existing) {
    store.favorites = store.favorites.filter((row) => row.id !== existing.id);
    return { saved: false };
  }
  store.favorites.push({
    id: randomUUID(),
    userId,
    propertyId: input.propertyId ?? null,
    itemId: input.itemId ?? null,
  });
  return { saved: true };
}

export function listFavoriteIds(userId: string) {
  return {
    propertyIds: new Set(
      store.favorites.filter((row) => row.userId === userId && row.propertyId).map((row) => row.propertyId!),
    ),
    itemIds: new Set(store.favorites.filter((row) => row.userId === userId && row.itemId).map((row) => row.itemId!)),
  };
}

export function listFavorites(userId: string) {
  return {
    properties: store.favorites
      .filter((row) => row.userId === userId && row.propertyId)
      .map((row) => getPropertyById(row.propertyId!))
      .filter(Boolean),
    items: store.favorites
      .filter((row) => row.userId === userId && row.itemId)
      .map((row) => getItemById(row.itemId!))
      .filter(Boolean),
  };
}

export function isFavorited(userId: string | null, input: { propertyId?: string; itemId?: string }) {
  if (!userId) return false;
  return store.favorites.some(
    (row) =>
      row.userId === userId &&
      row.propertyId === (input.propertyId ?? null) &&
      row.itemId === (input.itemId ?? null),
  );
}

function dateDiffDays(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.round(ms / 86_400_000);
}

function assertItemFree(itemId: string, startDate: string, endDate: string, ignoreBookingId?: string) {
  const blocked = store.availability.some(
    (row) => row.itemId === itemId && rangesOverlap(startDate, endDate, row.startDate, row.endDate),
  );
  if (blocked) throw new Error("Those dates are blocked on the lender's calendar");
  const taken = store.bookings.some(
    (row) =>
      row.itemId === itemId &&
      row.id !== ignoreBookingId &&
      (row.status === "approved" || row.status === "pending") &&
      rangesOverlap(startDate, endDate, row.startDate, row.endDate),
  );
  if (taken) throw new Error("Those dates are already booked");
}
