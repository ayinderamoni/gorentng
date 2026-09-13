"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createReview } from "@/lib/store";

export async function createReviewAction(formData: FormData) {
  const user = await requireUser();
  const tenancyId = String(formData.get("tenancyId") ?? "").trim() || undefined;
  const itemBookingId = String(formData.get("itemBookingId") ?? "").trim() || undefined;
  await createReview(user.id, {
    tenancyId,
    itemBookingId,
    rating: Number(formData.get("rating")),
    comment: String(formData.get("comment") ?? "").trim(),
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/landlord");
  revalidatePath("/dashboard/tenant");
  revalidatePath("/dashboard/lender");
  revalidatePath("/dashboard/renter");
}
