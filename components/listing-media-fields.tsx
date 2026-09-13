"use client";

import { useEffect, useRef, useState } from "react";

import { formatMegabytes, MAX_PHOTO_BYTES, MAX_VIDEO_BYTES, validateUploadSizes } from "@/lib/upload-limits";

function filesFrom(form: HTMLFormElement) {
  const photos = [...form.querySelectorAll<HTMLInputElement>('input[name="photos"]')].flatMap((input) => [
    ...(input.files ?? []),
  ]);
  const video = form.querySelector<HTMLInputElement>('input[name="video"]')?.files?.[0] ?? null;
  return { photos, video };
}

export function ListingMediaFields({ includeVideo = false }: { includeVideo?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  function onFilesChange(event: React.FormEvent<HTMLDivElement>) {
    const form = event.currentTarget.closest("form");
    if (!form) return;
    const { photos, video } = filesFrom(form);
    setError(validateUploadSizes(photos, video));
  }

  return (
    <div ref={rootRef} className="space-y-5" onChange={onFilesChange}>
      <label className="block">
        <span className="mb-1.5 block font-head text-sm font-semibold">Photos</span>
        <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple />
        <span className="mt-1 block text-xs text-ink-soft">
          JPEG or WebP, up to {formatMegabytes(MAX_PHOTO_BYTES)} each. A few clear room shots are enough.
        </span>
      </label>
      {includeVideo ? (
        <label className="block">
          <span className="mb-1.5 block font-head text-sm font-semibold">Video (optional)</span>
          <input type="file" name="video" accept="video/mp4,video/webm" />
          <span className="mt-1 block text-xs text-ink-soft">
            Short walkthrough under {formatMegabytes(MAX_VIDEO_BYTES)}. Skip this if the file is a large phone recording.
          </span>
        </label>
      ) : null}
      {error ? <p className="text-sm font-medium text-persimmon" role="alert">{error}</p> : null}
    </div>
  );
}
