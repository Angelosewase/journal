"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Plus, Sun, Moon, ArrowRight, ChevronRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/ui/content-card";
import { PageShell, StatInline } from "@/components/ui/page-shell";
import { TradeCard } from "@/components/TradeCard";
import { computeDayReviewStats, deriveDayReviewFields } from "@/lib/review-stats";

function MorningThumb({ storageId }: Readonly<{ storageId?: Id<"_storage"> }>) {
  const url = useQuery(api.trades.getStorageUrl, storageId ? { storageId } : "skip");
  if (!url) return null;
  return (
    <img src={url} alt="" className="mt-2 h-16 w-24 rounded-md border border-border/60 object-cover" />
  );
}

export default function TodayPage() {
  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);
  const todayTrades = trades?.filter(
    (t) => new Date(t.createdAt).toISOString().split("T")[0] === today,
  );
  const stats = computeDayReviewStats(trades, today);
  const derived = deriveDayReviewFields(stats);
  const morningThumb = todayBias?.morningScreenshots?.[0]?.storageId;

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <PageShell
      title={fullDate}
      subtitle={dayName}
      maxWidth="xl"
      actions={
        <div className="flex gap-2">
          <Link href={`/calendar/${today}`}>
            <Button variant="outline" size="sm" className="rounded-md">
              <CalendarDays className="h-4 w-4" /> Day Timeline
            </Button>
          </Link>
          <Link href="/trades/new">
            <Button size="sm" className="rounded-md"><Plus className="h-4 w-4" /> Quick Log</Button>
          </Link>
        </div>
      }
    >
      <ContentCard>
        <div className="flex flex-wrap gap-6">
          <StatInline label="Trades" value={stats.totalTrades} />
          <StatInline label="P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`} valueClassName={stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
          <StatInline label="Win rate" value={`${stats.winRate}%`} />
        </div>
      </ContentCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Pre-Gameplan</p>
            </div>
            <Link href="/daily-bias/morning" className="text-xs text-muted-foreground hover:text-foreground">
              Edit <ChevronRight className="inline h-3 w-3" />
            </Link>
          </div>
          {todayBias ? (
            <>
              <p className="text-sm font-semibold">{todayBias.currentDailyBias} · {todayBias.sessionToTrade}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{todayBias.biasReason}</p>
              <MorningThumb storageId={morningThumb} />
            </>
          ) : (
            <Link href="/daily-bias/morning" className="text-sm text-muted-foreground underline">Set pre-gameplan</Link>
          )}
        </ContentCard>

        <ContentCard>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Daily Review</p>
            </div>
            <Link href="/daily-bias/evening" className="text-xs text-muted-foreground hover:text-foreground">
              Edit <ChevronRight className="inline h-3 w-3" />
            </Link>
          </div>
          {todayBias?.actualMovement ? (
            <div className="space-y-2 text-sm">
              <p>Actual: <span className="font-medium">{todayBias.actualMovement}</span></p>
              <div className="flex gap-4">
                <StatInline label="Worked" value={derived.tradesWorked} />
                <StatInline label="Failed" value={derived.tradesFailed} />
                <StatInline label="Discipline" value={`${derived.overallDiscipline}/10`} />
              </div>
            </div>
          ) : (
            <Link href="/daily-bias/evening" className="text-sm text-muted-foreground underline">Complete daily review</Link>
          )}
        </ContentCard>
      </div>

      <ContentCard>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Today&apos;s trades</p>
          <Link href="/trades" className="text-xs text-muted-foreground">View all <ArrowRight className="inline h-3 w-3" /></Link>
        </div>
        {todayTrades && todayTrades.length > 0 ? (
          <div className="space-y-2">{todayTrades.map((t) => <TradeCard key={t._id} trade={t} compact />)}</div>
        ) : (
          <p className="text-sm text-muted-foreground">No trades yet — paste a chart in Quick Log.</p>
        )}
      </ContentCard>
    </PageShell>
  );
}
