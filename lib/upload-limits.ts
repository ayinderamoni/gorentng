export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MAX_UPLOAD_TOTAL_BYTES = 110 * 1024 * 1024;

export function formatMegabytes(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export function validateUploadSizes(photos: File[], video?: File | null) {
  const oversizedPhoto = photos.find((file) => file.size > MAX_PHOTO_BYTES);
  if (oversizedPhoto) {
    return `${oversizedPhoto.name} is larger than ${formatMegabytes(MAX_PHOTO_BYTES)}. Compress it or pick a smaller photo.`;
  }

  if (video && video.size > 0 && video.size > MAX_VIDEO_BYTES) {
    return `That video is larger than ${formatMegabytes(MAX_VIDEO_BYTES)}. Trim it or upload a shorter clip.`;
  }

  const total = photos.reduce((sum, file) => sum + file.size, 0) + (video && video.size > 0 ? video.size : 0);
  if (total > MAX_UPLOAD_TOTAL_BYTES) {
    return `Photos and video together must stay under ${formatMegabytes(MAX_UPLOAD_TOTAL_BYTES)} so the listing can save on a phone connection.`;
  }

  return null;
}
