"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { ContentCard } from "@/components/ui/content-card";
import { EmptyPlaceholder } from "@/components/ui/page-shell";
import { getTradeThumbnail, describeTrade } from "@/lib/review-stats";
import { stripMarkdown } from "@/lib/markdown-render";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

type TradeCardProps = Readonly<{
  trade: Doc<"trades">;
  compact?: boolean;
}>;

function Thumbnail({ storageId }: Readonly<{ storageId?: Id<"_storage"> }>) {
  const url = useQuery(
    api.trades.getStorageUrl,
    storageId ? { storageId } : "skip",
  );

  if (!storageId) {
    return <EmptyPlaceholder className="h-[120px] w-[120px] shrink-0 rounded-xl" />;
  }
  if (!url) {
    return (
      <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-[10px] text-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/50">
        …
      </div>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="h-[120px] w-[120px] shrink-0 rounded-xl border border-zinc-100 object-cover dark:border-zinc-800"
    />
  );
}

export function TradeCard({ trade, compact }: TradeCardProps) {
  const pnl = trade.pnl ?? 0;
  const preview = stripMarkdown(trade.whyEntered) || describeTrade(trade);
  const thumb = getTradeThumbnail(trade);
  const date = new Date(trade.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/trades/${trade._id}`}>
      <ContentCard
        className={cn(
          "flex gap-4 mb-1 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
          compact && "flex-col",
        )}
        padding="sm"
      >
        {!compact && <Thumbnail storageId={thumb as Id<"_storage"> | undefined} />}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">{trade.instrument}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{trade.direction}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{trade.session}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{date}</span>
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">{preview}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={cn("font-semibold tabular-nums", pnl >= 0 ? "text-emerald-600" : "text-red-500")}>
              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
            </span>
            {trade.finalRR !== undefined && (
              <span className="text-muted-foreground">{trade.finalRR.toFixed(1)}R</span>
            )}
            <span className="text-muted-foreground">{trade.winLossStatus}</span>
            {trade.poiQualityRating && (
              <span className="rounded border border-border/60 px-1.5 py-0.5 text-[10px]">{trade.poiQualityRating}</span>
            )}
          </div>
        </div>
      </ContentCard>
    </Link>
  );
}
