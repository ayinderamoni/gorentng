export type Role = "landlord" | "tenant" | "lender" | "renter";

export type ListingStatus = "draft" | "live" | "unlisted";
export type OccupancyStatus = "vacant" | "occupied";
export type PropertyType = "apartment" | "flat" | "duplex" | "bungalow" | "studio" | "terrace" | "room";

export type ApplicationStatus = "pending" | "approved" | "declined";
export type BookingStatus = "pending" | "approved" | "declined" | "completed";
export type ItemStatus = "available" | "inactive";
export type ItemCondition = "new" | "like_new" | "good" | "fair";
export type ItemCategory = "generators" | "tools" | "electronics" | "appliances" | "events";

export type ReviewDirection =
  | "tenant_to_landlord"
  | "landlord_to_tenant"
  | "renter_to_lender"
  | "lender_to_renter";

export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export type MediaKind = "photo" | "video";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  roles: Role[];
  createdAt: string;
}

export interface ListingMedia {
  id: string;
  propertyId: string;
  url: string;
  kind: MediaKind;
  label: string | null;
  sortOrder: number;
}

export type ListingMediaInput = {
  url: string;
  kind: MediaKind;
  label?: string | null;
};

export interface Property {
  id: string;
  landlordId: string;
  slug: string;
  title: string;
  description: string;
  address: string;
  city: string;
  area: string;
  propertyType: PropertyType;
  priceYearly: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  listingStatus: ListingStatus;
  occupancyStatus: OccupancyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyWithMeta extends Property {
  media: ListingMedia[];
  landlord: Profile;
  rating: number | null;
  reviewCount: number;
}

export interface Application {
  id: string;
  propertyId: string;
  tenantId: string;
  status: ApplicationStatus;
  moveInDate: string;
  message: string;
  income: string | null;
  employment: string | null;
  createdAt: string;
}

export interface Tenancy {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  applicationId: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface MaintenanceRecord {
  id: string;
  propertyId: string;
  date: string;
  description: string;
  cost: number;
}

export interface RentPayment {
  id: string;
  tenancyId: string;
  date: string;
  amount: number;
  note: string;
}

export interface ItemMedia {
  id: string;
  itemId: string;
  url: string;
  sortOrder: number;
}

export interface Item {
  id: string;
  lenderId: string;
  slug: string;
  title: string;
  category: ItemCategory;
  description: string;
  condition: ItemCondition;
  pricePerDay: number;
  pricePerWeek: number | null;
  pickupCity: string;
  pickupArea: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ItemWithMeta extends Item {
  media: ItemMedia[];
  lender: Profile;
  rating: number | null;
  reviewCount: number;
}

export interface ItemBooking {
  id: string;
  itemId: string;
  renterId: string;
  lenderId: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  agreedPrice: number;
  message: string;
  createdAt: string;
}

export interface ItemAvailability {
  id: string;
  itemId: string;
  startDate: string;
  endDate: string;
  note: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  tenancyId: string | null;
  itemBookingId: string | null;
  rating: number;
  comment: string;
  direction: ReviewDirection;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string | null;
  propertyId: string | null;
  landlordId: string | null;
  description: string;
  evidenceUrl: string | null;
  contact: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string | null;
  itemId: string | null;
}

export interface HousingFilters {
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: PropertyType;
}

export interface ItemFilters {
  category?: ItemCategory;
  city?: string;
  area?: string;
  maxPricePerDay?: number;
}
