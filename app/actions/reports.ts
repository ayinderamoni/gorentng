"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createReport } from "@/lib/store";
import { savePublicUpload } from "@/lib/uploads";

export async function createReportAction(formData: FormData) {
  const user = await getCurrentUser();
  const evidence = formData.get("evidence");
  const evidenceUrl = evidence instanceof File && evidence.size > 0 ? await savePublicUpload(evidence, "reports") : null;
  await createReport({
    reporterId: user?.id ?? null,
    propertyId: String(formData.get("propertyId") ?? "").trim() || undefined,
    landlordId: String(formData.get("landlordId") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim(),
    evidenceUrl: evidenceUrl ?? undefined,
    contact: String(formData.get("contact") ?? "").trim() || undefined,
  });
  redirect("/report?submitted=1");
}
