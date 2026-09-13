"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, isNextRedirect, type FormActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import {
  addMaintenance,
  addRentPayment,
  createApplication,
  createProperty,
  decideApplication,
  endTenancy,
  ensureProfile,
  toggleFavorite,
  updateProperty,
} from "@/lib/store";
import { MAX_HOUSING_PHOTOS, PHOTO_LABELS } from "@/lib/constants";
import type { ListingMediaInput, ListingStatus, PropertyType } from "@/lib/types";
import { validateUploadSizes } from "@/lib/upload-limits";
import { savePhotos, saveVideo } from "@/lib/uploads";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string) {
  return Number(str(formData, key));
}

function photoLabel(value: string) {
  const label = value.trim();
  if ((PHOTO_LABELS as readonly string[]).includes(label)) return label;
  return label.slice(0, 40) || "Other";
}

async function collectHousingMedia(formData: FormData): Promise<ListingMediaInput[]> {
  const existingUrls = formData.getAll("existingPhotoUrl").map(String).filter(Boolean);
  const existingLabels = formData.getAll("existingPhotoLabel").map(String);
  const photoFiles = formData.getAll("photo");
  const photoLabels = formData.getAll("photoLabel").map(String);
  const incoming: { file: File; label: string }[] = [];
  photoFiles.forEach((value, index) => {
    if (value instanceof File && value.size > 0) {
      incoming.push({ file: value, label: photoLabel(photoLabels[index] ?? "Other") });
    }
  });

  if (existingUrls.length + incoming.length > MAX_HOUSING_PHOTOS) {
    throw new Error(`A listing can have at most ${MAX_HOUSING_PHOTOS} photos.`);
  }

  const videoFile = formData.get("video");
  const videoCandidate = videoFile instanceof File && videoFile.size > 0 ? videoFile : null;
  const problem = validateUploadSizes(incoming.map((row) => row.file), videoCandidate);
  if (problem) throw new Error(problem);

  const uploaded = await savePhotos(incoming.map((row) => row.file), "listings");
  const photos: ListingMediaInput[] = [
    ...existingUrls.map((url, index) => ({
      url,
      kind: "photo" as const,
      label: photoLabel(existingLabels[index] ?? "Other"),
    })),
    ...uploaded.map((url, index) => ({
      url,
      kind: "photo" as const,
      label: incoming[index]?.label ?? "Other",
    })),
  ];

  const uploadedVideo = await saveVideo(videoCandidate);
  const existingVideo = uploadedVideo ? null : str(formData, "existingVideo") || null;
  const videoUrl = uploadedVideo ?? existingVideo;
  return [...photos, ...(videoUrl ? [{ url: videoUrl, kind: "video" as const, label: null }] : [])];
}

export async function createPropertyAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  try {
    const user = await ensureProfile(await requireUser());
    const media = await collectHousingMedia(formData);
    const property = await createProperty(user.id, {
      title: str(formData, "title"),
      description: str(formData, "description"),
      address: str(formData, "address"),
      city: str(formData, "city"),
      area: str(formData, "area"),
      propertyType: str(formData, "propertyType") as PropertyType,
      priceYearly: num(formData, "priceYearly"),
      bedrooms: num(formData, "bedrooms"),
      bathrooms: num(formData, "bathrooms"),
      amenities: formData.getAll("amenities").map(String),
      listingStatus: (str(formData, "listingStatus") as ListingStatus) || "live",
      media,
    });
    revalidatePath("/listings");
    revalidatePath("/dashboard/landlord");
    redirect(`/listings/${property.slug}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return actionError(error);
  }
}

export async function updatePropertyAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  try {
    const user = await requireUser();
    const id = str(formData, "id");
    const media = await collectHousingMedia(formData);
    const property = await updateProperty(user.id, id, {
      title: str(formData, "title"),
      description: str(formData, "description"),
      address: str(formData, "address"),
      city: str(formData, "city"),
      area: str(formData, "area"),
      propertyType: str(formData, "propertyType") as PropertyType,
      priceYearly: num(formData, "priceYearly"),
      bedrooms: num(formData, "bedrooms"),
      bathrooms: num(formData, "bathrooms"),
      amenities: formData.getAll("amenities").map(String),
      listingStatus: (str(formData, "listingStatus") as ListingStatus) || "live",
      media,
    });
    revalidatePath(`/listings/${property.slug}`);
    revalidatePath("/dashboard/landlord");
    redirect(`/listings/${property.slug}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return actionError(error);
  }
}

export async function applyToPropertyAction(formData: FormData) {
  const user = await ensureProfile(await requireUser());
  const propertyId = str(formData, "propertyId");
  const slug = str(formData, "slug");
  await createApplication(user.id, {
    propertyId,
    moveInDate: str(formData, "moveInDate"),
    message: str(formData, "message"),
    income: str(formData, "income") || undefined,
    employment: str(formData, "employment") || undefined,
  });
  revalidatePath("/dashboard/tenant");
  revalidatePath(`/listings/${slug}`);
  redirect("/dashboard/tenant");
}

export async function decideApplicationAction(formData: FormData) {
  const user = await requireUser();
  await decideApplication(user.id, str(formData, "applicationId"), str(formData, "decision") as "approved" | "declined");
  revalidatePath("/dashboard/landlord");
}

export async function endTenancyAction(formData: FormData) {
  const user = await requireUser();
  await endTenancy(user.id, str(formData, "tenancyId"), str(formData, "endDate"));
  revalidatePath("/dashboard/landlord");
}

export async function addMaintenanceAction(formData: FormData) {
  const user = await requireUser();
  await addMaintenance(user.id, {
    propertyId: str(formData, "propertyId"),
    date: str(formData, "date"),
    description: str(formData, "description"),
    cost: num(formData, "cost"),
  });
  revalidatePath("/dashboard/landlord");
}

export async function addRentPaymentAction(formData: FormData) {
  const user = await requireUser();
  await addRentPayment(user.id, {
    tenancyId: str(formData, "tenancyId"),
    date: str(formData, "date"),
    amount: num(formData, "amount"),
    note: str(formData, "note"),
  });
  revalidatePath("/dashboard/landlord");
}

export async function togglePropertyFavoriteAction(formData: FormData) {
  const user = await requireUser();
  await toggleFavorite(user.id, { propertyId: str(formData, "propertyId") });
  revalidatePath("/listings");
  revalidatePath("/dashboard/tenant");
}
