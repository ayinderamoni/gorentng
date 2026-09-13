import { averageRating } from "@/lib/format";
import type {
  Application,
  Item,
  ItemAvailability,
  ItemBooking,
  ItemMedia,
  ItemWithMeta,
  ListingMedia,
  MaintenanceRecord,
  Profile,
  Property,
  PropertyWithMeta,
  RentPayment,
  Review,
  Role,
  Tenancy,
} from "@/lib/types";

export function mapProfile(row: Record<string, unknown>, email = ""): Profile {
  return {
    id: String(row.id),
    email: String(row.email ?? email),
    fullName: String(row.full_name ?? "GoRent member"),
    phone: (row.phone as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    roles: (row.roles as Role[]) ?? [],
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export function mapProperty(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    landlordId: String(row.landlord_id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description),
    address: String(row.address),
    city: String(row.city),
    area: String(row.area),
    propertyType: row.property_type as Property["propertyType"],
    priceYearly: Number(row.price_yearly),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    amenities: (row.amenities as string[]) ?? [],
    listingStatus: row.listing_status as Property["listingStatus"],
    occupancyStatus: row.occupancy_status as Property["occupancyStatus"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapListingMedia(row: Record<string, unknown>): ListingMedia {
  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    url: String(row.url),
    kind: row.kind as ListingMedia["kind"],
    label: row.label ? String(row.label) : null,
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function hydrateProperty(
  property: Property,
  media: ListingMedia[],
  landlord: Profile,
  ratings: number[],
): PropertyWithMeta {
  return {
    ...property,
    media: media.sort((a, b) => a.sortOrder - b.sortOrder),
    landlord,
    rating: averageRating(ratings),
    reviewCount: ratings.length,
  };
}

export function mapApplication(row: Record<string, unknown>): Application {
  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    tenantId: String(row.tenant_id),
    status: row.status as Application["status"],
    moveInDate: String(row.move_in_date),
    message: String(row.message),
    income: (row.income as string | null) ?? null,
    employment: (row.employment as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function mapTenancy(row: Record<string, unknown>): Tenancy {
  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    tenantId: String(row.tenant_id),
    landlordId: String(row.landlord_id),
    applicationId: String(row.application_id),
    startDate: String(row.start_date),
    endDate: (row.end_date as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function mapMaintenance(row: Record<string, unknown>): MaintenanceRecord {
  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    date: String(row.date),
    description: String(row.description),
    cost: Number(row.cost),
  };
}

export function mapPayment(row: Record<string, unknown>): RentPayment {
  return {
    id: String(row.id),
    tenancyId: String(row.tenancy_id),
    date: String(row.date),
    amount: Number(row.amount),
    note: String(row.note ?? ""),
  };
}

export function mapItem(row: Record<string, unknown>): Item {
  return {
    id: String(row.id),
    lenderId: String(row.lender_id),
    slug: String(row.slug),
    title: String(row.title),
    category: row.category as Item["category"],
    description: String(row.description),
    condition: row.condition as Item["condition"],
    pricePerDay: Number(row.price_per_day),
    pricePerWeek: row.price_per_week == null ? null : Number(row.price_per_week),
    pickupCity: String(row.pickup_city),
    pickupArea: String(row.pickup_area),
    status: row.status as Item["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapItemMedia(row: Record<string, unknown>): ItemMedia {
  return {
    id: String(row.id),
    itemId: String(row.item_id),
    url: String(row.url),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function hydrateItem(item: Item, media: ItemMedia[], lender: Profile, ratings: number[]): ItemWithMeta {
  return {
    ...item,
    media: media.sort((a, b) => a.sortOrder - b.sortOrder),
    lender,
    rating: averageRating(ratings),
    reviewCount: ratings.length,
  };
}

export function mapBooking(row: Record<string, unknown>): ItemBooking {
  return {
    id: String(row.id),
    itemId: String(row.item_id),
    renterId: String(row.renter_id),
    lenderId: String(row.lender_id),
    status: row.status as ItemBooking["status"],
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    agreedPrice: Number(row.agreed_price),
    message: String(row.message ?? ""),
    createdAt: String(row.created_at),
  };
}

export function mapAvailability(row: Record<string, unknown>): ItemAvailability {
  return {
    id: String(row.id),
    itemId: String(row.item_id),
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    note: String(row.note ?? ""),
  };
}

export function mapReview(row: Record<string, unknown>): Review {
  return {
    id: String(row.id),
    reviewerId: String(row.reviewer_id),
    revieweeId: String(row.reviewee_id),
    tenancyId: (row.tenancy_id as string | null) ?? null,
    itemBookingId: (row.item_booking_id as string | null) ?? null,
    rating: Number(row.rating),
    comment: String(row.comment),
    direction: row.direction as Review["direction"],
    createdAt: String(row.created_at),
  };
}
