import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateUploadSizes } from "@/lib/upload-limits";

const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const BUCKETS = {
  listings: "listing-media",
  items: "item-media",
  reports: "report-evidence",
} as const;

export async function savePublicUpload(file: File, folder: "listings" | "items" | "reports") {
  if (!file || file.size === 0) return null;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
  const filename = `${Date.now()}-${safeName}`;

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const bucket = BUCKETS[folder];
    const { error } = await supabase.storage.from(bucket).upload(filename, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  const relative = path.posix.join("uploads", folder, filename);
  const dest = path.join(process.cwd(), "public", relative);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/${relative}`;
}

export async function savePhotos(files: File[], folder: "listings" | "items") {
  const photos = files.filter((file) => file && file.size > 0 && PHOTO_TYPES.has(file.type));
  const problem = validateUploadSizes(photos);
  if (problem) throw new Error(problem);
  const urls: string[] = [];
  for (const file of photos) {
    const url = await savePublicUpload(file, folder);
    if (url) urls.push(url);
  }
  return urls;
}

export async function saveVideo(file: File | null) {
  if (!file || file.size === 0) return null;
  if (!VIDEO_TYPES.has(file.type)) return null;
  const problem = validateUploadSizes([], file);
  if (problem) throw new Error(problem);
  return savePublicUpload(file, "listings");
}
