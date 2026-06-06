"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ScreenshotItem = {
  storageId: Id<"_storage">;
  caption?: string;
};

type ScreenshotUploadProps = Readonly<{
  value: ScreenshotItem[] | Id<"_storage">[];
  onChange: (items: ScreenshotItem[]) => void;
  maxFiles?: number;
  className?: string;
  enablePaste?: boolean;
}>;

function normalizeValue(value: ScreenshotItem[] | Id<"_storage">[]): ScreenshotItem[] {
  if (value.length === 0) return [];
  if (typeof value[0] === "string") {
    return (value as Id<"_storage">[]).map((storageId) => ({ storageId }));
  }
  return value as ScreenshotItem[];
}

export function ScreenshotUpload({
  value,
  onChange,
  maxFiles = 5,
  className,
  enablePaste = true,
}: ScreenshotUploadProps) {
  const items = normalizeValue(value);
  const generateUploadUrl = useMutation(api.trades.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxFiles - items.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxFiles} screenshots allowed`);
        return;
      }

      const filesToUpload = files.slice(0, remaining);
      setUploading(true);

      try {
        const newItems: ScreenshotItem[] = [];

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
          newItems.push({ storageId });

          const previewUrl = URL.createObjectURL(file);
          setPreviewUrls((prev) => ({ ...prev, [storageId]: previewUrl }));
        }

        if (newItems.length > 0) {
          onChange([...items, ...newItems]);
          toast.success(
            `${newItems.length} screenshot${newItems.length > 1 ? "s" : ""} uploaded`,
          );
        }
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [generateUploadUrl, items, maxFiles, onChange],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    void uploadFiles(Array.from(files));
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (!enablePaste) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        void uploadFiles(imageFiles);
      }
    },
    [enablePaste, uploadFiles],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    if (!enablePaste) return;
    const handler = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [enablePaste, handlePaste]);

  const removeScreenshot = (index: number) => {
    const removed = items[index];
    onChange(items.filter((_, i) => i !== index));
    if (previewUrls[removed.storageId]) {
      URL.revokeObjectURL(previewUrls[removed.storageId]);
      setPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[removed.storageId];
        return next;
      });
    }
  };

  const updateCaption = (index: number, caption: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, caption } : item)));
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn("space-y-3 outline-none", className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Screenshots
        </p>
        <p className="text-xs text-muted-foreground">
          {items.length}/{maxFiles}
          {enablePaste && " · Ctrl+V to paste"}
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.storageId}
              className="group relative aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30"
            >
              {previewUrls[item.storageId] ? (
                <img
                  src={previewUrls[item.storageId]}
                  alt={`Screenshot ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeScreenshot(index)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-foreground/80 text-background opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <input
                type="text"
                value={item.caption ?? ""}
                onChange={(e) => updateCaption(index, e.target.value)}
                placeholder="Caption"
                className="absolute inset-x-0 bottom-0 border-t border-border/40 bg-background/90 px-2 py-1 text-[10px] outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {items.length < maxFiles && (
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
            className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 py-6 text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs font-medium">
              {uploading ? "Uploading..." : "Drop, paste, or click to upload"}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
