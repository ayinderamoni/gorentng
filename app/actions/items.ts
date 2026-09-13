"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, isNextRedirect, type FormActionState } from "@/lib/action-state";
import { requireUser } from "@/lib/auth";
import {
  addAvailability,
  completeBooking,
  createBooking,
  createItem,
  decideBooking,
  ensureProfile,
  toggleFavorite,
  updateItem,
} from "@/lib/store";
import type { ItemCategory, ItemCondition, ItemStatus } from "@/lib/types";
import { savePhotos } from "@/lib/uploads";

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function num(formData: FormData, key: string) {
  const value = str(formData, key);
  return value ? Number(value) : 0;
}

async function collectItemMedia(formData: FormData, existing: string[] = []) {
  const photos = formData.getAll("photos").filter((value): value is File => value instanceof File);
  const uploaded = await savePhotos(photos, "items");
  return [...existing, ...uploaded].map((url) => ({ url }));
}

export async function createItemAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  try {
    const user = await ensureProfile(await requireUser());
    const media = await collectItemMedia(formData);
    const weekly = num(formData, "pricePerWeek");
    const item = await createItem(user.id, {
      title: str(formData, "title"),
      category: str(formData, "category") as ItemCategory,
      description: str(formData, "description"),
      condition: str(formData, "condition") as ItemCondition,
      pricePerDay: num(formData, "pricePerDay"),
      pricePerWeek: weekly || null,
      pickupCity: str(formData, "pickupCity"),
      pickupArea: str(formData, "pickupArea"),
      status: (str(formData, "status") as ItemStatus) || "available",
      media,
    });
    revalidatePath("/rent-items");
    revalidatePath("/dashboard/lender");
    redirect(`/rent-items/${item.slug}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return actionError(error);
  }
}

export async function updateItemAction(_prev: FormActionState, formData: FormData): Promise<FormActionState> {
  try {
    const user = await requireUser();
    const media = await collectItemMedia(formData, formData.getAll("existingPhotos").map(String).filter(Boolean));
    const weekly = num(formData, "pricePerWeek");
    const item = await updateItem(user.id, str(formData, "id"), {
      title: str(formData, "title"),
      category: str(formData, "category") as ItemCategory,
      description: str(formData, "description"),
      condition: str(formData, "condition") as ItemCondition,
      pricePerDay: num(formData, "pricePerDay"),
      pricePerWeek: weekly || null,
      pickupCity: str(formData, "pickupCity"),
      pickupArea: str(formData, "pickupArea"),
      status: (str(formData, "status") as ItemStatus) || "available",
      media,
    });
    revalidatePath(`/rent-items/${item.slug}`);
    revalidatePath("/dashboard/lender");
    redirect(`/rent-items/${item.slug}`);
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return actionError(error);
  }
}

export async function requestItemAction(formData: FormData) {
  const user = await ensureProfile(await requireUser());
  await createBooking(user.id, {
    itemId: str(formData, "itemId"),
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
    message: str(formData, "message"),
  });
  revalidatePath("/dashboard/renter");
  redirect("/dashboard/renter");
}

export async function decideBookingAction(formData: FormData) {
  const user = await requireUser();
  await decideBooking(user.id, str(formData, "bookingId"), str(formData, "decision") as "approved" | "declined");
  revalidatePath("/dashboard/lender");
}

export async function completeBookingAction(formData: FormData) {
  const user = await requireUser();
  await completeBooking(user.id, str(formData, "bookingId"));
  revalidatePath("/dashboard/lender");
}

export async function addAvailabilityAction(formData: FormData) {
  const user = await requireUser();
  await addAvailability(user.id, {
    itemId: str(formData, "itemId"),
    startDate: str(formData, "startDate"),
    endDate: str(formData, "endDate"),
    note: str(formData, "note"),
  });
  revalidatePath("/dashboard/lender");
}

export async function toggleItemFavoriteAction(formData: FormData) {
  const user = await requireUser();
  await toggleFavorite(user.id, { itemId: str(formData, "itemId") });
  revalidatePath("/rent-items");
  revalidatePath("/dashboard/renter");
}
