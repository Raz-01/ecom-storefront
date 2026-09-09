"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

/**
 * Product photo picker: uploads straight to Vercel Blob via
 * `/api/admin/upload-image` and stores the resulting URL in a hidden
 * field the product form submits as `imageUrl`. A "paste a URL instead"
 * fallback stays available for an image already hosted elsewhere.
 */
export function ImageUploadField({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- small admin-only preview of a dynamic, possibly-external URL; not worth next/image's remotePatterns config for this.
          <img src={url} alt="" className="h-16 w-16 rounded-md border border-stone-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-dashed border-stone-300 text-center text-[10px] text-stone-400">
            No photo
          </div>
        )}
        <div className="flex flex-col items-start gap-1">
          <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            {isUploading ? "Uploading…" : url ? "Replace photo" : "Upload photo"}
          </Button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="text-xs text-stone-500 underline">
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void uploadFile(file);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <details className="text-xs text-stone-500">
        <summary className="cursor-pointer select-none">Or paste an image URL instead</summary>
        <Input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="mt-2" />
      </details>
    </div>
  );
}
