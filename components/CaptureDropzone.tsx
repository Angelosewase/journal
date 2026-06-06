"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { TradeCapture } from "@/lib/review-stats";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LABELS: TradeCapture["label"][] = ["HTF", "ENTRY", "EXIT", "OTHER"];

type CaptureDropzoneProps = Readonly<{
  value: TradeCapture[];
  onChange: (captures: TradeCapture[]) => void;
  maxFiles?: number;
  className?: string;
}>;

function CapturePreview({ storageId }: Readonly<{ storageId: Id<"_storage"> }>) {
  const url = useQuery(api.trades.getStorageUrl, { storageId });
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">…</div>
    );
  }
  return <img src={url} alt="" className="h-full w-full object-cover" />;
}

export function CaptureDropzone({ value, onChange, maxFiles = 8, className }: CaptureDropzoneProps) {
  const generateUploadUrl = useMutation(api.trades.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxFiles} captures allowed`);
        return;
      }
      setUploading(true);
      try {
        const newCaptures: TradeCapture[] = [];
        const labelOrder: TradeCapture["label"][] = ["HTF", "ENTRY", "EXIT", "OTHER"];
        const usedLabels = new Set(value.map((c) => c.label));

        for (const file of files.slice(0, remaining)) {
          if (!file.type.startsWith("image/")) continue;
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!result.ok) continue;
          const { storageId } = await result.json();
          const label =
            labelOrder.find((l) => !usedLabels.has(l) && !newCaptures.some((c) => c.label === l)) ??
            "OTHER";
          usedLabels.add(label);
          newCaptures.push({
            storageId,
            label,
            capturedAt: Date.now(),
          });
          setPreviews((p) => ({ ...p, [storageId]: URL.createObjectURL(file) }));
        }
        if (newCaptures.length) onChange([...value, ...newCaptures]);
      } finally {
        setUploading(false);
      }
    },
    [generateUploadUrl, maxFiles, onChange, value],
  );

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const files: File[] = [];
      for (const item of e.clipboardData?.items ?? []) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        void uploadFiles(files);
      }
    };
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [uploadFiles]);

  const remove = (index: number) => {
    const cap = value[index];
    onChange(value.filter((_, i) => i !== index));
    if (previews[cap.storageId]) URL.revokeObjectURL(previews[cap.storageId]);
  };

  const setLabel = (index: number, label: TradeCapture["label"]) => {
    onChange(value.map((c, i) => (i === index ? { ...c, label } : c)));
  };

  return (
    <div
      className={cn("space-y-3", className)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void uploadFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <div
        className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center transition-colors hover:bg-muted/40"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = () => void uploadFiles(Array.from(input.files ?? []));
          input.click();
        }}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading ? "Uploading…" : "Drop or paste screenshots (Ctrl+V)"}
        </p>
        <p className="text-[10px] text-muted-foreground/70">HTF · Entry · Exit slots auto-assigned</p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((cap, index) => (
            <div key={cap.storageId} className="group relative space-y-1">
              <div className="aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                {previews[cap.storageId] ? (
                  <img src={previews[cap.storageId]} alt={cap.label} className="h-full w-full object-cover" />
                ) : (
                  <CapturePreview storageId={cap.storageId} />
                )}
              </div>
              <select
                value={cap.label}
                onChange={(e) => setLabel(index, e.target.value as TradeCapture["label"])}
                className="w-full rounded-md border border-border/60 bg-background px-1 py-0.5 text-[10px]"
              >
                {LABELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute right-1 top-1 rounded-md bg-foreground/80 p-0.5 text-background opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
