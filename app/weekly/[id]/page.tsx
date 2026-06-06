"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { PageShell, SectionHeading, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { ContextBlock } from "@/components/ContextBlock";
import { NarrativeBlock } from "@/components/ui/narrative-block";
import { TradeCard } from "@/components/TradeCard";
import {
  computeWeekReviewStats,
  getWeekEnd,
} from "@/lib/review-stats";
import { cn } from "@/lib/utils";

function weekDays(weekStart: string): string[] {
  const days: string[] = [];
  const start = new Date(weekStart);
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

export default function WeekDetailPage() {
  const params = useParams();
  const weekStart = params.id as string;
  const weekEnd = getWeekEnd(weekStart);

  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);
  const review = useQuery(api.weeklyReviews.getByWeekStart, { weekStart });
  const gameplan = useQuery(api.weeklyGameplans.getByWeekStart, { weekStart });

  const stats = computeWeekReviewStats(trades, weekStart);
  const days = weekDays(weekStart);

  const tradesByDay = useMemo(() => {
    const map = new Map<string, typeof stats.rows>();
    stats.rows.forEach((row) => {
      const list = map.get(row.date) ?? [];
      list.push(row);
      map.set(row.date, list);
    });
    return map;
  }, [stats.rows]);

  return (
    <PageShell
      title={formatRange(weekStart, weekEnd)}
      subtitle="Weekly story — gameplan, trades, review"
      maxWidth="xl"
      actions={
        <div className="flex gap-2">
          <Link href="/weekly">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Planning</Button>
          </Link>
          <Link href={`/weekly/review/new?week=${weekStart}`}>
            <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /> Edit review</Button>
          </Link>
        </div>
      }
    >
      <ContentCard>
        <div className="flex flex-wrap gap-4">
          <StatInline label="P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`} valueClassName={stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
          <StatInline label="Trades" value={stats.totalTrades} />
          <StatInline label="Win rate" value={`${stats.winRate}%`} />
          <Badge variant={gameplan ? "default" : "outline"}>Pre-Gameplan {gameplan ? "✓" : "—"}</Badge>
          <Badge variant={review ? "default" : "outline"}>Review {review ? "✓" : "—"}</Badge>
        </div>
      </ContentCard>

      {gameplan && (
        <section className="space-y-3">
          <SectionHeading>Pre-Gameplan</SectionHeading>
          <ContentCard>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-medium">{gameplan.weeklyBias}</span>
              <span className="text-muted-foreground">· {gameplan.sessionFocus}</span>
              {gameplan.instrumentsToFocus && <span className="text-muted-foreground">· Focus: {gameplan.instrumentsToFocus}</span>}
            </div>
            <NarrativeBlock content={gameplan.biasReason} className="mt-3" />
          </ContentCard>
          <ContextBlock
            mode="read"
            title="Plan context"
            notes={gameplan.contextNotes ?? ""}
            screenshots={gameplan.screenshots ?? []}
          />
        </section>
      )}

      <section className="space-y-3">
        <SectionHeading>Days</SectionHeading>
        <div className="grid gap-2 sm:grid-cols-5">
          {days.map((date) => {
            const bias = dailyBiases?.find((b) => b.date === date);
            const dayTrades = tradesByDay.get(date)?.length ?? 0;
            const hasContext = !!(bias?.morningScreenshots?.length || bias?.morningContextNotes);
            return (
              <Link key={date} href={`/calendar/${date}`}>
                <ContentCard padding="sm" className="hover:bg-muted/30">
                  <p className="text-xs font-medium">{new Date(date).toLocaleDateString("en-US", { weekday: "short" })}</p>
                  <p className="text-[10px] text-muted-foreground">{date.slice(5)}</p>
                  <div className="mt-2 flex gap-1">
                    {bias && <span className={cn("h-1.5 w-1.5 rounded-full", bias.currentDailyBias === "BULLISH" ? "bg-emerald-500" : bias.currentDailyBias === "BEARISH" ? "bg-red-400" : "bg-muted-foreground")} />}
                    {dayTrades > 0 && <span className="text-[10px] text-muted-foreground">{dayTrades}T</span>}
                    {hasContext && <span className="text-[10px] text-muted-foreground">📷</span>}
                  </div>
                </ContentCard>
              </Link>
            );
          })}
        </div>
      </section>

      {stats.rows.length > 0 && (
        <section className="space-y-3">
          <SectionHeading>Trades</SectionHeading>
          <div className="space-y-2">
            {trades?.filter((t) => {
              const d = new Date(t.createdAt).toISOString().split("T")[0];
              return d >= weekStart && d <= weekEnd;
            }).map((trade) => (
              <TradeCard key={trade._id} trade={trade} />
            ))}
          </div>
        </section>
      )}

      {review && (
        <section className="space-y-3">
          <SectionHeading>Review</SectionHeading>
          <ContentCard className="space-y-3">
            <NarrativeBlock title="Priority" content={review.topPriorityImprovement} variant="callout" />
            <NarrativeBlock title="Action" content={review.specificActionToImprove} variant="callout" />
            <NarrativeBlock title="Lesson" content={review.biggestLessonSelf ?? review.biggestLessonMarket} variant="callout" />
          </ContentCard>
          <ContextBlock mode="read" title="Review context" notes={review.contextNotes ?? ""} screenshots={review.screenshots ?? []} />
        </section>
      )}
    </PageShell>
  );
}

function formatRange(weekStart: string, weekEnd: string): string {
  const s = new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const e = new Date(weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${s} – ${e}`;
}
