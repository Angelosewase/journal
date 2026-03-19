"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ScreenshotUploadProps {
  value: Id<"_storage">[];
  onChange: (ids: Id<"_storage">[]) => void;
  maxFiles?: number;
}

export function ScreenshotUpload({
  value,
  onChange,
  maxFiles = 5,
}: ScreenshotUploadProps) {
  const generateUploadUrl = useMutation(api.trades.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<
    Record<string, string>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = maxFiles - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxFiles} screenshots allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const newIds: Id<"_storage">[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { storageId } = await result.json();
        newIds.push(storageId);

        // Create local preview
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrls((prev) => ({
          ...prev,
          [storageId]: previewUrl,
        }));
      }

      if (newIds.length > 0) {
        onChange([...value, ...newIds]);
        toast.success(
          `${newIds.length} screenshot${newIds.length > 1 ? "s" : ""} uploaded`
        );
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeScreenshot = (index: number) => {
    const removedId = value[index];
    onChange(value.filter((_, i) => i !== index));
    // Clean up preview URL
    if (previewUrls[removedId]) {
      URL.revokeObjectURL(previewUrls[removedId]);
      setPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Screenshots
        </p>
        <p className="text-xs text-zinc-400">
          {value.length}/{maxFiles}
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {value.map((storageId, index) => (
            <div
              key={storageId}
              className="relative group rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 aspect-video"
            >
              {previewUrls[storageId] ? (
                <img
                  src={previewUrls[storageId]}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeScreenshot(index)}
                className="absolute top-1.5 right-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxFiles && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 py-6 flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 dark:hover:text-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs font-medium">
              {uploading ? "Uploading..." : "Upload screenshots"}
            </span>
            <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
              PNG, JPG up to 10MB
            </span>
          </button>
        </>
      )}
    </div>
  );
}
