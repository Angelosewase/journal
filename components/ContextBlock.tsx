"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ScreenshotUpload, type ScreenshotItem } from "@/components/ScreenshotUpload";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
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
  variant?: "default" | "sidebar";
}>;

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
  variant = "default",
}: ContextBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isSidebar = variant === "sidebar";

  if (mode === "read") {
    const isEmpty = !notes?.trim() && screenshots.length === 0;
    if (isEmpty && !isSidebar) return null;

    return (
      <ContentCard
        padding={isSidebar ? "md" : "lg"}
        className={cn(
          isSidebar && "max-h-[calc(100dvh-8rem)] overflow-y-auto",
        )}
      >
        <SectionHeading>{title}</SectionHeading>
        <div className={cn("mt-2 space-y-3")}>
          {isEmpty ? (
            <p className="text-sm text-muted-foreground">No context added.</p>
          ) : (
            <>
              {notes?.trim() ? (
                <NarrativeBlock content={notes} variant="callout" />
              ) : null}
              {screenshots.length > 0 && (
                <ScreenshotGallery storageIds={screenshots.map((item) => item.storageId)} />
              )}
            </>
          )}
        </div>
      </ContentCard>
    );
  }

  const body = (
    <div className={cn(isSidebar ? "space-y-3" : "space-y-4")}>
      <RichTextEditor
        value={notes}
        onChange={(v) => onNotesChange?.(v)}
        placeholder="Notes, market read, chart context…"
        rows={isSidebar ? 5 : 4}
      />
      <ScreenshotUpload
        value={screenshots}
        onChange={(items) => onScreenshotsChange?.(items)}
        maxFiles={maxScreenshots}
        className={cn(isSidebar && "[&_button]:py-3")}
      />
    </div>
  );

  if (isSidebar) {
    return (
      <ContentCard padding="md" className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
        <SectionHeading>{title}</SectionHeading>
        <div className="mt-2">{body}</div>
      </ContentCard>
    );
  }

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
