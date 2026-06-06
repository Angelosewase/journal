"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import type { Id } from "@/convex/_generated/dataModel";
import { ContentCard } from "@/components/ui/content-card";
import { NarrativeBlock } from "@/components/ui/narrative-block";
import { SectionHeading, StatInline } from "@/components/ui/page-shell";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TradeCapture } from "@/lib/review-stats";

type TradeStoryViewProps = Readonly<{
  trade: Doc<"trades">;
  dayTimelineHref?: string;
}>;

function CaptureImage({ storageId, caption }: Readonly<{ storageId: Id<"_storage">; caption?: string }>) {
  const url = useQuery(api.trades.getStorageUrl, { storageId });
  return (
    <div className="space-y-1">
      <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
        {url ? (
          <img src={url} alt={caption ?? ""} className="max-h-[480px] w-full object-contain" />
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">Loading…</div>
        )}
      </div>
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}

export function TradeStoryView({ trade, dayTimelineHref }: TradeStoryViewProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const captures: TradeCapture[] =
    trade.captures ??
    (trade.screenshots ?? []).map((storageId) => ({
      storageId,
      label: "OTHER" as const,
    }));

  const hero =
    captures.find((c) => c.label === "ENTRY") ??
    captures.find((c) => c.label === "HTF") ??
    captures[0];

  const date = new Date(trade.createdAt).toISOString().split("T")[0];
  const pnl = trade.pnl ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {trade.instrument}{" "}
            <span className="text-muted-foreground">{trade.direction}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {date} · {trade.session}
            {dayTimelineHref && (
              <>
                {" · "}
                <Link href={dayTimelineHref} className="underline hover:text-foreground">
                  Day Timeline
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-4">
          <StatInline
            label="P&L"
            value={`${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`}
            valueClassName={pnl >= 0 ? "text-emerald-600" : "text-red-500"}
          />
          {trade.finalRR !== undefined && (
            <StatInline label="R" value={trade.finalRR.toFixed(1)} />
          )}
        </div>
      </div>

      {hero && (
        <ContentCard padding="sm">
          <CaptureImage storageId={hero.storageId} caption={hero.caption} />
        </ContentCard>
      )}

      <div className="space-y-4">
        <NarrativeBlock title="Why I entered" content={trade.whyEntered} variant="callout" />
        <NarrativeBlock title="What happened" content={trade.expansionDescription ?? trade.surpriseDescription} variant="callout" />
        <NarrativeBlock title="Lessons" content={trade.institutionalLessons ?? trade.whatWentRight ?? trade.whatWentWrong} variant="callout" />
      </div>

      {captures.length > 0 && (
        <ContentCard>
          <SectionHeading>Chart timeline</SectionHeading>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {["HTF", "ENTRY", "EXIT", "OTHER"].map((label) => {
              const labeled = captures.filter((c) => c.label === label);
              return labeled.map((cap) => (
                <div key={cap.storageId} className="w-40 shrink-0 space-y-1">
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">{cap.label}</span>
                  <CaptureImage storageId={cap.storageId} caption={cap.caption} />
                </div>
              ));
            })}
          </div>
        </ContentCard>
      )}

      <div className="flex flex-wrap gap-2">
        {trade.followedTrinity !== undefined && (
          <Badge variant="outline" className="gap-1 font-normal">
            <span className={cn("h-1.5 w-1.5 rounded-full", trade.followedTrinity ? "bg-emerald-500" : "bg-red-400")} />
            Trinity
          </Badge>
        )}
        {trade.correctKillzone !== undefined && (
          <Badge variant="outline" className="gap-1 font-normal">
            <span className={cn("h-1.5 w-1.5 rounded-full", trade.correctKillzone ? "bg-emerald-500" : "bg-red-400")} />
            Killzone
          </Badge>
        )}
        <Badge variant="outline" className="font-normal">{trade.poiType} POI</Badge>
        <Badge variant="outline" className="font-normal">{trade.tradeModel}</Badge>
      </div>

      <ContentCard padding="sm">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="flex w-full items-center justify-between text-sm font-medium"
        >
          Trade details
          {detailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {detailsOpen && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              ["Entry", trade.entryPrice],
              ["Exit", trade.exitPrice ?? "—"],
              ["Stop", trade.stopLossPrice],
              ["Size", trade.positionSize],
              ["Risk $", trade.riskAmount],
              ["SL pips", trade.stopLossPips],
              ["Quality", trade.tradeQualityScore ?? "—"],
              ["Closure", trade.tradeClosureReason],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
                <p className="font-mono text-sm">{String(val)}</p>
              </div>
            ))}
          </div>
        )}
      </ContentCard>
    </div>
  );
}
