import { isSupabaseConfigured } from "@/lib/supabase/env";
import * as memory from "@/lib/store/memory";
import * as supabase from "@/lib/store/supabase";
import type {
  HousingFilters,
  Item,
  ItemFilters,
  ListingMedia,
  Profile,
  Property,
} from "@/lib/types";

function db() {
  return isSupabaseConfigured();
}

export async function listLiveProperties(filters: HousingFilters = {}) {
  return db() ? supabase.listLiveProperties(filters) : memory.listLiveProperties(filters);
}

export async function getPropertyBySlug(slug: string) {
  return db() ? supabase.getPropertyBySlug(slug) : memory.getPropertyBySlug(slug);
}

export async function getPropertyById(id: string) {
  return db() ? supabase.getPropertyById(id) : memory.getPropertyById(id);
}

export async function listPropertiesByLandlord(landlordId: string) {
  return db() ? supabase.listPropertiesByLandlord(landlordId) : memory.listPropertiesByLandlord(landlordId);
}

export async function listLiveItems(filters: ItemFilters = {}) {
  return db() ? supabase.listLiveItems(filters) : memory.listLiveItems(filters);
}

export async function getItemBySlug(slug: string) {
  return db() ? supabase.getItemBySlug(slug) : memory.getItemBySlug(slug);
}

export async function getItemById(id: string) {
  return db() ? supabase.getItemById(id) : memory.getItemById(id);
}

export async function listItemsByLender(lenderId: string) {
  return db() ? supabase.listItemsByLender(lenderId) : memory.listItemsByLender(lenderId);
}

export async function getProfile(id: string) {
  return db() ? supabase.getProfile(id) : memory.getProfile(id);
}

export async function getProfileByEmail(email: string) {
  return db() ? supabase.getProfileByEmail(email) : memory.getProfileByEmail(email);
}

export async function upsertProfile(input: { email: string; fullName: string; phone?: string }) {
  return db() ? supabase.upsertProfile(input) : memory.upsertProfile(input);
}

export async function ensureProfile(input: Profile) {
  return db() ? supabase.ensureProfile(input) : memory.ensureProfile(input);
}

export async function createProperty(
  landlordId: string,
  input: Parameters<typeof memory.createProperty>[1],
) {
  return db() ? supabase.createProperty(landlordId, input) : memory.createProperty(landlordId, input);
}

export async function updateProperty(
  landlordId: string,
  propertyId: string,
  input: Parameters<typeof memory.updateProperty>[2],
) {
  return db() ? supabase.updateProperty(landlordId, propertyId, input) : memory.updateProperty(landlordId, propertyId, input);
}

export async function createItem(lenderId: string, input: Parameters<typeof memory.createItem>[1]) {
  return db() ? supabase.createItem(lenderId, input) : memory.createItem(lenderId, input);
}

export async function updateItem(lenderId: string, itemId: string, input: Parameters<typeof memory.updateItem>[2]) {
  return db() ? supabase.updateItem(lenderId, itemId, input) : memory.updateItem(lenderId, itemId, input);
}

export async function createApplication(
  tenantId: string,
  input: Parameters<typeof memory.createApplication>[1],
) {
  return db() ? supabase.createApplication(tenantId, input) : memory.createApplication(tenantId, input);
}

export async function listApplicationsForLandlord(landlordId: string) {
  return db() ? supabase.listApplicationsForLandlord(landlordId) : memory.listApplicationsForLandlord(landlordId);
}

export async function listApplicationsForTenant(tenantId: string) {
  return db() ? supabase.listApplicationsForTenant(tenantId) : memory.listApplicationsForTenant(tenantId);
}

export async function decideApplication(landlordId: string, applicationId: string, decision: "approved" | "declined") {
  return db() ? supabase.decideApplication(landlordId, applicationId, decision) : memory.decideApplication(landlordId, applicationId, decision);
}

export async function endTenancy(landlordId: string, tenancyId: string, endDate: string) {
  return db() ? supabase.endTenancy(landlordId, tenancyId, endDate) : memory.endTenancy(landlordId, tenancyId, endDate);
}

export async function listTenanciesForLandlord(landlordId: string) {
  return db() ? supabase.listTenanciesForLandlord(landlordId) : memory.listTenanciesForLandlord(landlordId);
}

export async function listTenanciesForTenant(tenantId: string) {
  return db() ? supabase.listTenanciesForTenant(tenantId) : memory.listTenanciesForTenant(tenantId);
}

export async function addMaintenance(landlordId: string, input: Parameters<typeof memory.addMaintenance>[1]) {
  return db() ? supabase.addMaintenance(landlordId, input) : memory.addMaintenance(landlordId, input);
}

export async function listMaintenance(propertyId: string) {
  return db() ? supabase.listMaintenance(propertyId) : memory.listMaintenance(propertyId);
}

export async function addRentPayment(landlordId: string, input: Parameters<typeof memory.addRentPayment>[1]) {
  return db() ? supabase.addRentPayment(landlordId, input) : memory.addRentPayment(landlordId, input);
}

export async function listPaymentsForTenancy(tenancyId: string) {
  return db() ? supabase.listPaymentsForTenancy(tenancyId) : memory.listPaymentsForTenancy(tenancyId);
}

export async function earningsForLandlord(landlordId: string) {
  return db() ? supabase.earningsForLandlord(landlordId) : memory.earningsForLandlord(landlordId);
}

export async function createBooking(renterId: string, input: Parameters<typeof memory.createBooking>[1]) {
  return db() ? supabase.createBooking(renterId, input) : memory.createBooking(renterId, input);
}

export async function decideBooking(lenderId: string, bookingId: string, decision: "approved" | "declined") {
  return db() ? supabase.decideBooking(lenderId, bookingId, decision) : memory.decideBooking(lenderId, bookingId, decision);
}

export async function completeBooking(lenderId: string, bookingId: string) {
  return db() ? supabase.completeBooking(lenderId, bookingId) : memory.completeBooking(lenderId, bookingId);
}

export async function listBookingsForLender(lenderId: string) {
  return db() ? supabase.listBookingsForLender(lenderId) : memory.listBookingsForLender(lenderId);
}

export async function listBookingsForRenter(renterId: string) {
  return db() ? supabase.listBookingsForRenter(renterId) : memory.listBookingsForRenter(renterId);
}

export async function addAvailability(lenderId: string, input: Parameters<typeof memory.addAvailability>[1]) {
  return db() ? supabase.addAvailability(lenderId, input) : memory.addAvailability(lenderId, input);
}

export async function listAvailability(itemId: string) {
  return db() ? supabase.listAvailability(itemId) : memory.listAvailability(itemId);
}

export async function createReview(reviewerId: string, input: Parameters<typeof memory.createReview>[1]) {
  return db() ? supabase.createReview(reviewerId, input) : memory.createReview(reviewerId, input);
}

export async function createReport(input: Parameters<typeof memory.createReport>[0]) {
  return db() ? supabase.createReport(input) : memory.createReport(input);
}

export async function toggleFavorite(userId: string, input: { propertyId?: string; itemId?: string }) {
  return db() ? supabase.toggleFavorite(userId, input) : memory.toggleFavorite(userId, input);
}

export async function listFavoriteIds(userId: string | null) {
  if (!userId) return { propertyIds: new Set<string>(), itemIds: new Set<string>() };
  return db() ? supabase.listFavoriteIds(userId) : memory.listFavoriteIds(userId);
}

export async function listFavorites(userId: string) {
  return db() ? supabase.listFavorites(userId) : memory.listFavorites(userId);
}

export async function isFavorited(userId: string | null, input: { propertyId?: string; itemId?: string }) {
  return db() ? supabase.isFavorited(userId, input) : memory.isFavorited(userId, input);
}

export type { HousingFilters, Item, ItemFilters, ListingMedia, Profile, Property };
