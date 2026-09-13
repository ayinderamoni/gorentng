"use client";

import { useEffect, useId, useRef, useState } from "react";

import { MAX_HOUSING_PHOTOS, PHOTO_LABELS } from "@/lib/constants";
import { formatMegabytes, MAX_PHOTO_BYTES, MAX_VIDEO_BYTES, validateUploadSizes } from "@/lib/upload-limits";
import type { ListingMedia } from "@/lib/types";

type ExistingPhoto = { id: string; url: string; label: string };

function newRowKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function filesFrom(form: HTMLFormElement) {
  const photos = [...form.querySelectorAll<HTMLInputElement>('input[name="photo"]')].flatMap((input) =>
    [...(input.files ?? [])].filter((file) => file.size > 0),
  );
  const video = form.querySelector<HTMLInputElement>('input[name="video"]')?.files?.[0] ?? null;
  return { photos, video };
}

export function HousingMediaFields({ media = [] }: { media?: ListingMedia[] }) {
  const headingId = useId();
  const rootRef = useRef<HTMLFieldSetElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>(
    media
      .filter((row) => row.kind === "photo")
      .map((row) => ({ id: row.id, url: row.url, label: row.label ?? "Living" })),
  );
  const [newRows, setNewRows] = useState<{ key: string; label: string }[]>(
    media.some((row) => row.kind === "photo") ? [] : [{ key: newRowKey(), label: "Living" }],
  );
  const existingVideo = media.find((row) => row.kind === "video") ?? null;
  const [keepVideo, setKeepVideo] = useState(Boolean(existingVideo));

  const photoCount = existingPhotos.length + newRows.length;

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    function onSubmit(event: Event) {
      const { photos, video } = filesFrom(form!);
      const problem = validateUploadSizes(photos, video);
      if (problem) {
        event.preventDefault();
        setError(problem);
      }
    }

    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);

  function onFilesChange(event: React.FormEvent<HTMLFieldSetElement>) {
    const form = event.currentTarget.closest("form");
    if (!form) return;
    const { photos, video } = filesFrom(form);
    setError(validateUploadSizes(photos, video));
  }

  return (
    <fieldset ref={rootRef} className="space-y-4" onChange={onFilesChange}>
      <legend id={headingId} className="font-head text-sm font-semibold">
        Photos
      </legend>
      <p className="text-xs text-ink-soft">
        Add several room shots and tag each one — Bedroom, Dining, Living. Up to {MAX_HOUSING_PHOTOS} photos,
        JPEG or WebP, {formatMegabytes(MAX_PHOTO_BYTES)} each.
      </p>

      {existingPhotos.map((photo) => (
        <div key={photo.id} className="grid gap-3 rounded-2xl border border-ink/10 bg-cream-deep/40 p-3 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center">
          <input type="hidden" name="existingPhotoUrl" value={photo.url} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.label} className="aspect-[4/3] w-full rounded-xl object-cover sm:h-16 sm:w-20" />
          <label className="block text-sm">
            <span className="mb-1 block font-head text-xs font-semibold text-ink-soft">Tag</span>
            <select
              name="existingPhotoLabel"
              value={photo.label}
              onChange={(event) => {
                const label = event.target.value;
                setExistingPhotos((rows) => rows.map((row) => (row.id === photo.id ? { ...row, label } : row)));
              }}
              className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm"
            >
              {PHOTO_LABELS.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setExistingPhotos((rows) => rows.filter((row) => row.id !== photo.id))}
            className="justify-self-start text-sm font-semibold text-persimmon underline sm:justify-self-end"
          >
            Remove
          </button>
        </div>
      ))}

      {newRows.map((row, index) => (
        <div key={row.key} className="grid gap-3 rounded-2xl border border-ink/10 bg-cream p-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
          <label className="block text-sm">
            <span className="mb-1 block font-head text-xs font-semibold text-ink-soft">
              Photo {existingPhotos.length + index + 1}
            </span>
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-head text-xs font-semibold text-ink-soft">Tag</span>
            <select
              name="photoLabel"
              value={row.label}
              onChange={(event) => {
                const label = event.target.value;
                setNewRows((rows) => rows.map((item) => (item.key === row.key ? { ...item, label } : item)));
              }}
              className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-sm"
            >
              {PHOTO_LABELS.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </label>
          {newRows.length > 1 || existingPhotos.length > 0 ? (
            <button
              type="button"
              onClick={() => setNewRows((rows) => rows.filter((item) => item.key !== row.key))}
              className="justify-self-start pb-2 text-sm font-semibold text-persimmon underline sm:justify-self-end"
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}

      {photoCount < MAX_HOUSING_PHOTOS ? (
        <button
          type="button"
          onClick={() => setNewRows((rows) => [...rows, { key: newRowKey(), label: "Bedroom" }])}
          className="font-head text-sm font-semibold text-teal underline"
        >
          Add another photo
        </button>
      ) : (
        <p className="text-xs text-ink-soft">That’s the {MAX_HOUSING_PHOTOS}-photo limit for a listing.</p>
      )}

      <div className="pt-2">
        <p className="font-head text-sm font-semibold">Video (optional, one only)</p>
        <p className="mt-1 text-xs text-ink-soft">
          One short walkthrough under {formatMegabytes(MAX_VIDEO_BYTES)}. A new file replaces the current video.
        </p>
        {existingVideo && keepVideo ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-cream-deep/40 px-3 py-2.5">
            <input type="hidden" name="existingVideo" value={existingVideo.url} />
            <p className="text-sm text-ink-soft">Current walkthrough saved.</p>
            <button type="button" onClick={() => setKeepVideo(false)} className="text-sm font-semibold text-persimmon underline">
              Remove video
            </button>
          </div>
        ) : null}
        <label className="mt-3 block">
          <span className="sr-only">Listing video</span>
          <input type="file" name="video" accept="video/mp4,video/webm" />
        </label>
      </div>
      {error ? <p className="text-sm font-medium text-persimmon" role="alert">{error}</p> : null}
    </fieldset>
  );
}
