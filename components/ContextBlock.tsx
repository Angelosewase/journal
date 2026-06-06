"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ScreenshotUpload, type ScreenshotItem } from "@/components/ScreenshotUpload";
import { ContentCard } from "@/components/ui/content-card";
import { SectionHeading } from "@/components/ui/page-shell";
import { NarrativeBlock } from "@/components/ui/narrative-block";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type ContextBlockProps = Readonly<{
  notes: string;
  onNotesChange?: (value: string) => void;
  screenshots: ScreenshotItem[];
  onScreenshotsChange?: (items: ScreenshotItem[]) => void;
  mode?: "edit" | "read";
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxScreenshots?: number;
}>;

function ScreenshotReadItem({ item }: Readonly<{ item: ScreenshotItem }>) {
  const url = useQuery(api.trades.getStorageUrl, { storageId: item.storageId });
  return (
    <div className="space-y-1">
      <div className="aspect-video overflow-hidden rounded-lg border border-border/60 bg-muted/30">
        {url ? (
          <img src={url} alt={item.caption ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading…</div>
        )}
      </div>
      {item.caption && <p className="text-[10px] text-muted-foreground">{item.caption}</p>}
    </div>
  );
}

function ScreenshotGalleryRead({ items }: Readonly<{ items: ScreenshotItem[] }>) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <ScreenshotReadItem key={item.storageId} item={item} />
      ))}
    </div>
  );
}

export function ContextBlock({
  notes,
  onNotesChange,
  screenshots,
  onScreenshotsChange,
  mode = "edit",
  title = "Context",
  collapsible = false,
  defaultExpanded = true,
  maxScreenshots = 5,
}: ContextBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (mode === "read") {
    if (!notes?.trim() && screenshots.length === 0) return null;
    return (
      <ContentCard>
        <SectionHeading>{title}</SectionHeading>
        <NarrativeBlock content={notes} variant="callout" />
        <ScreenshotGalleryRead items={screenshots} />
      </ContentCard>
    );
  }

  const body = (
    <div className="space-y-4">
      <RichTextEditor
        value={notes}
        onChange={(v) => onNotesChange?.(v)}
        placeholder="Notes, market read, chart context…"
      />
      <ScreenshotUpload
        value={screenshots}
        onChange={(items) => onScreenshotsChange?.(items)}
        maxFiles={maxScreenshots}
      />
    </div>
  );

  if (!collapsible) {
    return (
      <ContentCard>
        <SectionHeading>{title}</SectionHeading>
        {body}
      </ContentCard>
    );
  }

  return (
    <ContentCard padding="sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <SectionHeading>{title}</SectionHeading>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div className={cn(!expanded && "hidden")}>{body}</div>
    </ContentCard>
  );
}

export type { ScreenshotItem };
