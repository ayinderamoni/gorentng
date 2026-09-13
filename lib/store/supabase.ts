import { rangesOverlap, slugify } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  HousingFilters,
  Item,
  ItemFilters,
  ItemWithMeta,
  ListingMedia,
  Profile,
  Property,
  PropertyWithMeta,
  Role,
} from "@/lib/types";
import {
  hydrateItem,
  hydrateProperty,
  mapApplication,
  mapAvailability,
  mapBooking,
  mapItem,
  mapItemMedia,
  mapListingMedia,
  mapMaintenance,
  mapPayment,
  mapProfile,
  mapProperty,
  mapTenancy,
} from "@/lib/store/mappers";

async function db() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function throwIf(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

function definedFields(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value !== undefined));
}

async function insertListingMedia(
  supabase: Awaited<ReturnType<typeof db>>,
  rows: { property_id: string; url: string; kind: string; label: string | null; sort_order: number }[],
) {
  if (!rows.length) return;
  const { error } = await supabase.from("listing_media").insert(rows);
  if (error && /column .*label/i.test(error.message)) {
    const { error: retry } = await supabase
      .from("listing_media")
      .insert(rows.map(({ label: _label, ...row }) => row));
    throwIf(retry, "Listing saved but photos/video failed to attach");
    return;
  }
  throwIf(error, "Listing saved but photos/video failed to attach");
}

async function uniqueSlug(base: string, table: "properties" | "items") {
  const supabase = await db();
  const root = slugify(base) || "listing";
  let slug = root;
  let n = 2;
  for (;;) {
    const { data } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${root}-${n}`;
    n += 1;
  }
}

async function addRole(userId: string, role: Role) {
  const supabase = await db();
  const { data } = await supabase.from("profiles").select("roles").eq("id", userId).maybeSingle();
  const roles = (data?.roles as Role[] | undefined) ?? [];
  if (roles.includes(role)) return;
  const { error } = await supabase.from("profiles").update({ roles: [...roles, role] }).eq("id", userId);
  throwIf(error, "Could not update roles");
}

async function ratingsFor(userId: string) {
  const supabase = await db();
  const { data } = await supabase.from("reviews").select("rating").eq("reviewee_id", userId);
  return (data ?? []).map((row) => Number(row.rating));
}

async function loadProperty(idOrSlug: { id?: string; slug?: string }): Promise<PropertyWithMeta | null> {
  const supabase = await db();
  let query = supabase.from("properties").select("*");
  query = idOrSlug.id ? query.eq("id", idOrSlug.id) : query.eq("slug", idOrSlug.slug!);
  const { data, error } = await query.maybeSingle();
  throwIf(error, "Could not load listing");
  if (!data) return null;
  const property = mapProperty(data);
  const [{ data: mediaRows }, { data: landlordRow }, ratings] = await Promise.all([
    supabase.from("listing_media").select("*").eq("property_id", property.id).order("sort_order"),
    supabase.from("profiles").select("*").eq("id", property.landlordId).maybeSingle(),
    ratingsFor(property.landlordId),
  ]);
  const landlord = landlordRow
    ? mapProfile(landlordRow)
    : {
        id: property.landlordId,
        email: "",
        fullName: "Landlord",
        phone: null,
        avatarUrl: null,
        roles: ["landlord"] as Role[],
        createdAt: property.createdAt,
      };
  return hydrateProperty(property, (mediaRows ?? []).map(mapListingMedia), landlord, ratings);
}

async function loadItem(idOrSlug: { id?: string; slug?: string }): Promise<ItemWithMeta | null> {
  const supabase = await db();
  let query = supabase.from("items").select("*");
  query = idOrSlug.id ? query.eq("id", idOrSlug.id) : query.eq("slug", idOrSlug.slug!);
  const { data, error } = await query.maybeSingle();
  throwIf(error, "Could not load item");
  if (!data) return null;
  const item = mapItem(data);
  const [{ data: mediaRows }, { data: lenderRow }, ratings] = await Promise.all([
    supabase.from("item_media").select("*").eq("item_id", item.id).order("sort_order"),
    supabase.from("profiles").select("*").eq("id", item.lenderId).maybeSingle(),
    ratingsFor(item.lenderId),
  ]);
  const lender = lenderRow
    ? mapProfile(lenderRow)
    : {
        id: item.lenderId,
        email: "",
        fullName: "Lender",
        phone: null,
        avatarUrl: null,
        roles: ["lender"] as Role[],
        createdAt: item.createdAt,
      };
  return hydrateItem(item, (mediaRows ?? []).map(mapItemMedia), lender, ratings);
}

export async function getProfile(id: string) {
  const supabase = await db();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return data ? mapProfile(data) : null;
}

export async function getProfileByEmail(email: string) {
  const supabase = await db();
  const { data } = await supabase.from("profiles").select("*").eq("email", email.toLowerCase()).maybeSingle();
  return data ? mapProfile(data) : null;
}

export async function upsertProfile(input: { email: string; fullName: string; phone?: string }) {
  const existing = await getProfileByEmail(input.email);
  if (existing) return existing;
  throw new Error("Sign in with Supabase to create a profile");
}

export async function ensureProfile(input: Profile) {
  const supabase = await db();
  const existing = await getProfile(input.id);
  if (existing) {
    await supabase
      .from("profiles")
      .update({
        full_name: input.fullName || existing.fullName,
        phone: input.phone ?? existing.phone,
        avatar_url: input.avatarUrl ?? existing.avatarUrl,
      })
      .eq("id", input.id);
    return (await getProfile(input.id)) ?? existing;
  }
  const { error } = await supabase.from("profiles").insert({
    id: input.id,
    full_name: input.fullName,
    phone: input.phone,
    avatar_url: input.avatarUrl,
    roles: input.roles,
  });
  if (error?.code === "23505") {
    return (await getProfile(input.id)) ?? input;
  }
  throwIf(error, "Could not create profile");
  return (await getProfile(input.id)) ?? input;
}

export async function listLiveProperties(filters: HousingFilters = {}): Promise<PropertyWithMeta[]> {
  const supabase = await db();
  let query = supabase.from("properties").select("*").eq("listing_status", "live").order("updated_at", { ascending: false });
  if (filters.city) query = query.ilike("city", filters.city);
  if (filters.area) query = query.ilike("area", filters.area);
  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.minPrice) query = query.gte("price_yearly", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price_yearly", filters.maxPrice);
  const { data, error } = await query;
  throwIf(error, "Could not load listings");
  return Promise.all((data ?? []).map((row) => loadProperty({ id: String(row.id) }))).then(
    (rows) => rows.filter((row): row is PropertyWithMeta => Boolean(row)),
  );
}

export async function getPropertyBySlug(slug: string) {
  return loadProperty({ slug });
}

export async function getPropertyById(id: string) {
  return loadProperty({ id });
}

export async function listPropertiesByLandlord(landlordId: string) {
  const supabase = await db();
  const { data, error } = await supabase
    .from("properties")
    .select("id")
    .eq("landlord_id", landlordId)
    .order("updated_at", { ascending: false });
  throwIf(error, "Could not load your properties");
  return Promise.all((data ?? []).map((row) => loadProperty({ id: String(row.id) }))).then(
    (rows) => rows.filter((row): row is PropertyWithMeta => Boolean(row)),
  );
}

export async function listLiveItems(filters: ItemFilters = {}): Promise<ItemWithMeta[]> {
  const supabase = await db();
  let query = supabase.from("items").select("*").eq("status", "available").order("updated_at", { ascending: false });
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.city) query = query.ilike("pickup_city", filters.city);
  if (filters.area) query = query.ilike("pickup_area", filters.area);
  if (filters.maxPricePerDay) query = query.lte("price_per_day", filters.maxPricePerDay);
  const { data, error } = await query;
  throwIf(error, "Could not load items");
  return Promise.all((data ?? []).map((row) => loadItem({ id: String(row.id) }))).then(
    (rows) => rows.filter((row): row is ItemWithMeta => Boolean(row)),
  );
}

export async function getItemBySlug(slug: string) {
  return loadItem({ slug });
}

export async function getItemById(id: string) {
  return loadItem({ id });
}

export async function listItemsByLender(lenderId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("items").select("id").eq("lender_id", lenderId).order("updated_at", { ascending: false });
  throwIf(error, "Could not load your items");
  return Promise.all((data ?? []).map((row) => loadItem({ id: String(row.id) }))).then(
    (rows) => rows.filter((row): row is ItemWithMeta => Boolean(row)),
  );
}

export async function createProperty(
  landlordId: string,
  input: Omit<Property, "id" | "landlordId" | "slug" | "createdAt" | "updatedAt" | "listingStatus" | "occupancyStatus"> & {
    listingStatus?: Property["listingStatus"];
    media?: { url: string; kind: ListingMedia["kind"]; label?: string | null }[];
  },
) {
  const supabase = await db();
  await addRole(landlordId, "landlord");
  const slug = await uniqueSlug(`${input.title}-${input.area}-${input.city}`, "properties");
  const { data, error } = await supabase
    .from("properties")
    .insert({
      landlord_id: landlordId,
      slug,
      title: input.title,
      description: input.description,
      address: input.address,
      city: input.city,
      area: input.area,
      property_type: input.propertyType,
      price_yearly: input.priceYearly,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      amenities: input.amenities,
      listing_status: input.listingStatus ?? "live",
      occupancy_status: "vacant",
    })
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message || "Could not create listing. Sign in again, then publish.");
  }
  if (input.media?.length) {
    await insertListingMedia(
      supabase,
      input.media.map((media, index) => ({
        property_id: data.id,
        url: media.url,
        kind: media.kind,
        label: media.kind === "photo" ? media.label?.trim() || null : null,
        sort_order: index,
      })),
    );
  }
  const property = await loadProperty({ id: data.id });
  if (!property) throw new Error("Listing created but could not be reloaded");
  return property;
}

export async function updateProperty(
  landlordId: string,
  propertyId: string,
  input: Partial<Omit<Property, "id" | "landlordId" | "slug" | "createdAt">> & {
    media?: { url: string; kind: ListingMedia["kind"]; label?: string | null }[];
  },
) {
  const supabase = await db();
  const { error } = await supabase
    .from("properties")
    .update(
      definedFields({
        title: input.title,
        description: input.description,
        address: input.address,
        city: input.city,
        area: input.area,
        property_type: input.propertyType,
        price_yearly: input.priceYearly,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        amenities: input.amenities,
        listing_status: input.listingStatus,
        occupancy_status: input.occupancyStatus,
        updated_at: new Date().toISOString(),
      }),
    )
    .eq("id", propertyId)
    .eq("landlord_id", landlordId);
  throwIf(error, "You can only edit your own listing");
  if (input.media) {
    await supabase.from("listing_media").delete().eq("property_id", propertyId);
    if (input.media.length) {
      await insertListingMedia(
        supabase,
        input.media.map((media, index) => ({
          property_id: propertyId,
          url: media.url,
          kind: media.kind,
          label: media.kind === "photo" ? media.label?.trim() || null : null,
          sort_order: index,
        })),
      );
    }
  }
  const property = await loadProperty({ id: propertyId });
  if (!property) throw new Error("You can only edit your own listing");
  return property;
}

export async function createItem(
  lenderId: string,
  input: Omit<Item, "id" | "lenderId" | "slug" | "createdAt" | "updatedAt" | "status"> & {
    status?: Item["status"];
    media?: { url: string }[];
  },
) {
  const supabase = await db();
  await addRole(lenderId, "lender");
  const slug = await uniqueSlug(`${input.title}-${input.pickupArea}-${input.pickupCity}`, "items");
  const { data, error } = await supabase
    .from("items")
    .insert({
      lender_id: lenderId,
      slug,
      title: input.title,
      category: input.category,
      description: input.description,
      condition: input.condition,
      price_per_day: input.pricePerDay,
      price_per_week: input.pricePerWeek,
      pickup_city: input.pickupCity,
      pickup_area: input.pickupArea,
      status: input.status ?? "available",
    })
    .select("*")
    .single();
  throwIf(error, "Could not list item");
  if (input.media?.length) {
    const { error: mediaError } = await supabase.from("item_media").insert(
      input.media.map((media, index) => ({ item_id: data.id, url: media.url, sort_order: index })),
    );
    throwIf(mediaError, "Item saved but photos failed to attach");
  }
  const item = await loadItem({ id: data.id });
  if (!item) throw new Error("Item created but could not be reloaded");
  return item;
}

export async function updateItem(
  lenderId: string,
  itemId: string,
  input: Partial<Omit<Item, "id" | "lenderId" | "slug" | "createdAt">> & { media?: { url: string }[] },
) {
  const supabase = await db();
  const { error } = await supabase
    .from("items")
    .update(
      definedFields({
        title: input.title,
        category: input.category,
        description: input.description,
        condition: input.condition,
        price_per_day: input.pricePerDay,
        price_per_week: input.pricePerWeek,
        pickup_city: input.pickupCity,
        pickup_area: input.pickupArea,
        status: input.status,
        updated_at: new Date().toISOString(),
      }),
    )
    .eq("id", itemId)
    .eq("lender_id", lenderId);
  throwIf(error, "You can only edit your own item");
  if (input.media) {
    await supabase.from("item_media").delete().eq("item_id", itemId);
    if (input.media.length) {
      const { error: mediaError } = await supabase.from("item_media").insert(
        input.media.map((media, index) => ({ item_id: itemId, url: media.url, sort_order: index })),
      );
      throwIf(mediaError, "Could not update item photos");
    }
  }
  const item = await loadItem({ id: itemId });
  if (!item) throw new Error("You can only edit your own item");
  return item;
}

export async function createApplication(
  tenantId: string,
  input: { propertyId: string; moveInDate: string; message: string; income?: string; employment?: string },
) {
  const supabase = await db();
  const property = await getPropertyById(input.propertyId);
  if (!property || property.listingStatus !== "live") throw new Error("Listing not found");
  if (property.landlordId === tenantId) throw new Error("You cannot apply to your own listing");
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("property_id", input.propertyId)
    .eq("tenant_id", tenantId)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) throw new Error("You already have a pending application");
  await addRole(tenantId, "tenant");
  const { data, error } = await supabase
    .from("applications")
    .insert({
      property_id: input.propertyId,
      tenant_id: tenantId,
      move_in_date: input.moveInDate,
      message: input.message,
      income: input.income ?? null,
      employment: input.employment ?? null,
    })
    .select("*")
    .single();
  throwIf(error, "Could not send application");
  return mapApplication(data);
}

export async function listApplicationsForLandlord(landlordId: string) {
  const supabase = await db();
  const { data: properties } = await supabase.from("properties").select("id").eq("landlord_id", landlordId);
  const ids = (properties ?? []).map((row) => row.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("applications").select("*").in("property_id", ids).order("created_at", { ascending: false });
  throwIf(error, "Could not load applications");
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...mapApplication(row),
      property: await getPropertyById(String(row.property_id)),
      tenant: await getProfile(String(row.tenant_id)),
    })),
  );
}

export async function listApplicationsForTenant(tenantId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("applications").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
  throwIf(error, "Could not load applications");
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...mapApplication(row),
      property: await getPropertyById(String(row.property_id)),
    })),
  );
}

export async function decideApplication(landlordId: string, applicationId: string, decision: "approved" | "declined") {
  const supabase = await db();
  const { data: applicationRow, error } = await supabase.from("applications").select("*").eq("id", applicationId).single();
  throwIf(error, "Application not found");
  const property = await getPropertyById(String(applicationRow.property_id));
  if (!property || property.landlordId !== landlordId) throw new Error("Not your listing");
  if (applicationRow.status !== "pending") throw new Error("This application was already decided");
  const { error: updateError } = await supabase.from("applications").update({ status: decision }).eq("id", applicationId);
  throwIf(updateError, "Could not update application");
  if (decision === "declined") return { application: mapApplication({ ...applicationRow, status: decision }), tenancy: null };
  const { error: occError } = await supabase.from("properties").update({ occupancy_status: "occupied" }).eq("id", property.id);
  throwIf(occError, "Could not mark property occupied");
  const { data: tenancyRow, error: tenancyError } = await supabase
    .from("tenancies")
    .insert({
      property_id: property.id,
      tenant_id: applicationRow.tenant_id,
      landlord_id: landlordId,
      application_id: applicationId,
      start_date: applicationRow.move_in_date,
    })
    .select("*")
    .single();
  throwIf(tenancyError, "Could not create tenancy");
  return { application: mapApplication({ ...applicationRow, status: decision }), tenancy: mapTenancy(tenancyRow) };
}

export async function endTenancy(landlordId: string, tenancyId: string, endDate: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("tenancies").select("*").eq("id", tenancyId).eq("landlord_id", landlordId).single();
  throwIf(error, "Tenancy not found");
  const { error: updateError } = await supabase.from("tenancies").update({ end_date: endDate }).eq("id", tenancyId);
  throwIf(updateError, "Could not end tenancy");
  const { data: open } = await supabase
    .from("tenancies")
    .select("id")
    .eq("property_id", data.property_id)
    .is("end_date", null);
  if (!open?.length) {
    await supabase.from("properties").update({ occupancy_status: "vacant" }).eq("id", data.property_id);
  }
  return mapTenancy({ ...data, end_date: endDate });
}

export async function listTenanciesForLandlord(landlordId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("tenancies").select("*").eq("landlord_id", landlordId).order("created_at", { ascending: false });
  throwIf(error, "Could not load tenancies");
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...mapTenancy(row),
      property: await getPropertyById(String(row.property_id)),
      tenant: await getProfile(String(row.tenant_id)),
    })),
  );
}

export async function listTenanciesForTenant(tenantId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("tenancies").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
  throwIf(error, "Could not load tenancies");
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...mapTenancy(row),
      property: await getPropertyById(String(row.property_id)),
      landlord: await getProfile(String(row.landlord_id)),
    })),
  );
}

export async function addMaintenance(landlordId: string, input: { propertyId: string; date: string; description: string; cost: number }) {
  const property = await getPropertyById(input.propertyId);
  if (!property || property.landlordId !== landlordId) throw new Error("Not your property");
  const supabase = await db();
  const { data, error } = await supabase
    .from("maintenance_records")
    .insert({ property_id: input.propertyId, date: input.date, description: input.description, cost: input.cost })
    .select("*")
    .single();
  throwIf(error, "Could not log maintenance");
  return mapMaintenance(data);
}

export async function listMaintenance(propertyId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("maintenance_records").select("*").eq("property_id", propertyId).order("date", { ascending: false });
  throwIf(error, "Could not load maintenance");
  return (data ?? []).map(mapMaintenance);
}

export async function addRentPayment(landlordId: string, input: { tenancyId: string; date: string; amount: number; note: string }) {
  const supabase = await db();
  const { data: tenancy, error: tenancyError } = await supabase
    .from("tenancies")
    .select("id")
    .eq("id", input.tenancyId)
    .eq("landlord_id", landlordId)
    .maybeSingle();
  throwIf(tenancyError, "Not your tenancy");
  if (!tenancy) throw new Error("Not your tenancy");
  const { data, error } = await supabase
    .from("rent_payments")
    .insert({ tenancy_id: input.tenancyId, date: input.date, amount: input.amount, note: input.note })
    .select("*")
    .single();
  throwIf(error, "Could not log payment");
  return mapPayment(data);
}

export async function listPaymentsForTenancy(tenancyId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("rent_payments").select("*").eq("tenancy_id", tenancyId);
  throwIf(error, "Could not load payments");
  return (data ?? []).map(mapPayment);
}

export async function earningsForLandlord(landlordId: string) {
  const supabase = await db();
  const { data: tenancies } = await supabase.from("tenancies").select("id").eq("landlord_id", landlordId);
  const ids = (tenancies ?? []).map((row) => row.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("rent_payments").select("*").in("tenancy_id", ids);
  throwIf(error, "Could not load earnings");
  return (data ?? []).map(mapPayment);
}

async function assertItemFree(itemId: string, startDate: string, endDate: string, ignoreBookingId?: string) {
  const supabase = await db();
  const [{ data: blocks }, { data: bookings }] = await Promise.all([
    supabase.from("item_availability").select("start_date, end_date").eq("item_id", itemId),
    supabase.from("item_bookings").select("id, start_date, end_date, status").eq("item_id", itemId),
  ]);
  if ((blocks ?? []).some((row) => rangesOverlap(startDate, endDate, String(row.start_date), String(row.end_date)))) {
    throw new Error("Those dates are blocked on the lender's calendar");
  }
  const taken = (bookings ?? []).some(
    (row) =>
      row.id !== ignoreBookingId &&
      (row.status === "approved" || row.status === "pending") &&
      rangesOverlap(startDate, endDate, String(row.start_date), String(row.end_date)),
  );
  if (taken) throw new Error("Those dates are already booked");
}

export async function createBooking(
  renterId: string,
  input: { itemId: string; startDate: string; endDate: string; message: string },
) {
  const supabase = await db();
  const item = await getItemById(input.itemId);
  if (!item || item.status !== "available") throw new Error("Item not found");
  if (item.lenderId === renterId) throw new Error("You cannot book your own item");
  await assertItemFree(item.id, input.startDate, input.endDate);
  await addRole(renterId, "renter");
  const days = Math.max(1, Math.round((new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) / 86_400_000) + 1);
  const agreedPrice =
    item.pricePerWeek && days >= 7 ? Math.round((days / 7) * item.pricePerWeek) : days * item.pricePerDay;
  const { data, error } = await supabase
    .from("item_bookings")
    .insert({
      item_id: item.id,
      renter_id: renterId,
      lender_id: item.lenderId,
      start_date: input.startDate,
      end_date: input.endDate,
      agreed_price: agreedPrice,
      message: input.message,
    })
    .select("*")
    .single();
  throwIf(error, "Could not request item");
  return mapBooking(data);
}

export async function decideBooking(lenderId: string, bookingId: string, decision: "approved" | "declined") {
  const supabase = await db();
  const { data, error } = await supabase.from("item_bookings").select("*").eq("id", bookingId).eq("lender_id", lenderId).single();
  throwIf(error, "Booking not found");
  if (data.status !== "pending") throw new Error("Already decided");
  if (decision === "approved") await assertItemFree(String(data.item_id), String(data.start_date), String(data.end_date), bookingId);
  const { error: updateError } = await supabase.from("item_bookings").update({ status: decision }).eq("id", bookingId);
  throwIf(updateError, "Could not update booking");
  return mapBooking({ ...data, status: decision });
}

export async function completeBooking(lenderId: string, bookingId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("item_bookings").select("*").eq("id", bookingId).eq("lender_id", lenderId).single();
  throwIf(error, "Booking not found");
  if (data.status !== "approved") throw new Error("Only approved bookings can be completed");
  const { error: updateError } = await supabase.from("item_bookings").update({ status: "completed" }).eq("id", bookingId);
  throwIf(updateError, "Could not complete booking");
  return mapBooking({ ...data, status: "completed" });
}

export async function listBookingsForLender(lenderId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("item_bookings").select("*").eq("lender_id", lenderId).order("created_at", { ascending: false });
  throwIf(error, "Could not load bookings");
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...mapBooking(row),
      item: await getItemById(String(row.item_id)),
      renter: await getProfile(String(row.renter_id)),
    })),
  );
}

export async function listBookingsForRenter(renterId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("item_bookings").select("*").eq("renter_id", renterId).order("created_at", { ascending: false });
  throwIf(error, "Could not load bookings");
  return Promise.all(
    (data ?? []).map(async (row) => ({
      ...mapBooking(row),
      item: await getItemById(String(row.item_id)),
      lender: await getProfile(String(row.lender_id)),
    })),
  );
}

export async function addAvailability(lenderId: string, input: { itemId: string; startDate: string; endDate: string; note: string }) {
  const item = await getItemById(input.itemId);
  if (!item || item.lenderId !== lenderId) throw new Error("Not your item");
  const supabase = await db();
  const { data, error } = await supabase
    .from("item_availability")
    .insert({ item_id: input.itemId, start_date: input.startDate, end_date: input.endDate, note: input.note })
    .select("*")
    .single();
  throwIf(error, "Could not block dates");
  return mapAvailability(data);
}

export async function listAvailability(itemId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("item_availability").select("*").eq("item_id", itemId);
  throwIf(error, "Could not load availability");
  return (data ?? []).map(mapAvailability);
}

export async function createReview(
  reviewerId: string,
  input: { tenancyId?: string; itemBookingId?: string; rating: number; comment: string },
) {
  if (!!input.tenancyId === !!input.itemBookingId) {
    throw new Error("A review must be tied to one tenancy or one completed booking");
  }
  if (input.rating < 1 || input.rating > 5) throw new Error("Rating must be 1–5");
  const supabase = await db();

  if (input.tenancyId) {
    const { data: tenancy, error } = await supabase.from("tenancies").select("*").eq("id", input.tenancyId).single();
    throwIf(error, "Tenancy not found");
    const isTenant = tenancy.tenant_id === reviewerId;
    const isLandlord = tenancy.landlord_id === reviewerId;
    if (!isTenant && !isLandlord) throw new Error("You can only review someone you have a tenancy with");
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("tenancy_id", tenancy.id)
      .eq("reviewer_id", reviewerId)
      .maybeSingle();
    if (existing) throw new Error("You already reviewed this tenancy");
    const { data, error: insertError } = await supabase
      .from("reviews")
      .insert({
        reviewer_id: reviewerId,
        reviewee_id: isTenant ? tenancy.landlord_id : tenancy.tenant_id,
        tenancy_id: tenancy.id,
        rating: input.rating,
        comment: input.comment,
        direction: isTenant ? "tenant_to_landlord" : "landlord_to_tenant",
      })
      .select("*")
      .single();
    throwIf(insertError, "Could not save review");
    return data;
  }

  const { data: booking, error } = await supabase.from("item_bookings").select("*").eq("id", input.itemBookingId!).single();
  throwIf(error, "Reviews need a completed rental");
  if (booking.status !== "completed") throw new Error("Reviews need a completed rental");
  const isRenter = booking.renter_id === reviewerId;
  const isLender = booking.lender_id === reviewerId;
  if (!isRenter && !isLender) throw new Error("You can only review someone you completed a rental with");
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("item_booking_id", booking.id)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();
  if (existing) throw new Error("You already reviewed this rental");
  const { data, error: insertError } = await supabase
    .from("reviews")
    .insert({
      reviewer_id: reviewerId,
      reviewee_id: isRenter ? booking.lender_id : booking.renter_id,
      item_booking_id: booking.id,
      rating: input.rating,
      comment: input.comment,
      direction: isRenter ? "renter_to_lender" : "lender_to_renter",
    })
    .select("*")
    .single();
  throwIf(insertError, "Could not save review");
  return data;
}

export async function createReport(input: {
  reporterId: string | null;
  propertyId?: string;
  landlordId?: string;
  description: string;
  evidenceUrl?: string;
  contact?: string;
}) {
  const supabase = await db();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: input.reporterId,
      property_id: input.propertyId ?? null,
      landlord_id: input.landlordId ?? null,
      description: input.description,
      evidence_url: input.evidenceUrl ?? null,
      contact: input.contact ?? null,
    })
    .select("*")
    .single();
  throwIf(error, "Could not submit report");
  return data;
}

export async function toggleFavorite(userId: string, input: { propertyId?: string; itemId?: string }) {
  const supabase = await db();
  let query = supabase.from("favorites").select("id").eq("user_id", userId);
  query = input.propertyId ? query.eq("property_id", input.propertyId) : query.eq("item_id", input.itemId!);
  const { data: existing } = await query.maybeSingle();
  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return { saved: false };
  }
  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    property_id: input.propertyId ?? null,
    item_id: input.itemId ?? null,
  });
  throwIf(error, "Could not save favourite");
  return { saved: true };
}

export async function listFavoriteIds(userId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("favorites").select("property_id, item_id").eq("user_id", userId);
  throwIf(error, "Could not load saved listings");
  return {
    propertyIds: new Set((data ?? []).map((row) => row.property_id).filter(Boolean).map(String)),
    itemIds: new Set((data ?? []).map((row) => row.item_id).filter(Boolean).map(String)),
  };
}

export async function listFavorites(userId: string) {
  const supabase = await db();
  const { data, error } = await supabase.from("favorites").select("*").eq("user_id", userId);
  throwIf(error, "Could not load saved listings");
  const properties = await Promise.all(
    (data ?? []).filter((row) => row.property_id).map((row) => getPropertyById(String(row.property_id))),
  );
  const items = await Promise.all((data ?? []).filter((row) => row.item_id).map((row) => getItemById(String(row.item_id))));
  return { properties: properties.filter(Boolean), items: items.filter(Boolean) };
}

export async function isFavorited(userId: string | null, input: { propertyId?: string; itemId?: string }) {
  if (!userId) return false;
  const supabase = await db();
  let query = supabase.from("favorites").select("id").eq("user_id", userId);
  query = input.propertyId ? query.eq("property_id", input.propertyId) : query.eq("item_id", input.itemId!);
  const { data } = await query.maybeSingle();
  return Boolean(data);
}
