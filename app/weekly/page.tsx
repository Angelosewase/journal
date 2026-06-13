"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Plus, CheckCircle2, Circle, ChevronRight, Target, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageShell, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import {
  computeWeekReviewStats,
  getCurrentWeekStart,
  getWeekEnd,
} from "@/lib/review-stats";

type WeeklyReview = Doc<"weeklyReviews">;
type WeeklyGameplan = Doc<"weeklyGameplans">;

type MergedWeek = {
  weekStart: string;
  review?: WeeklyReview;
  gameplan?: WeeklyGameplan;
  livePnl: number;
  liveTrades: number;
};

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", {
    month: start.getMonth() === end.getMonth() ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

function formatPnl(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}$${value.toFixed(2)}`;
}

function WeekCard({ week, isCurrent }: { week: MergedWeek; isCurrent?: boolean }) {
  const completion = (week.gameplan ? 1 : 0) + (week.review ? 1 : 0);
  const weekEnd = week.review?.weekEnd ?? week.gameplan?.weekEnd ?? getWeekEnd(week.weekStart);

  return (
    <Link href={`/weekly/${week.weekStart}`} className="">
      <ContentCard className={cn("transition-colors hover:bg-muted/30 mt-1", isCurrent && "ring-1 ring-border")}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isCurrent && <Badge variant="outline">This week</Badge>}
              <span className="text-xs text-muted-foreground">{formatWeekRange(week.weekStart, weekEnd)}</span>
              {completion === 2 ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Circle className="h-3 w-3" /> {completion}/2
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={week.gameplan ? "default" : "outline"} className="font-normal">
                Pre-Gameplan {week.gameplan ? "✓" : "—"}
              </Badge>
              <Badge variant={week.review ? "default" : "outline"} className="font-normal">
                Review {week.review ? "✓" : "—"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StatInline
              label="Live P&L"
              value={formatPnl(week.livePnl)}
              valueClassName={week.livePnl >= 0 ? "text-emerald-600" : "text-red-500"}
            />
            <StatInline label="Trades" value={week.liveTrades} />
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </ContentCard>
    </Link>
  );
}

export default function PlanningPage() {
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const weeklyGameplans = useQuery(api.weeklyGameplans.list);
  const trades = useQuery(api.trades.list);
  const [selectedYear, setSelectedYear] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);

  const currentWeekStart = useMemo(() => getCurrentWeekStart(), []);

  const mergedWeeks = useMemo((): MergedWeek[] => {
    if (!weeklyReviews || !weeklyGameplans) return [];
    const reviewMap = new Map(weeklyReviews.map((r) => [r.weekStart, r]));
    const gameplanMap = new Map(weeklyGameplans.map((g) => [g.weekStart, g]));
    const allWeeks = new Set([
      ...weeklyReviews.map((r) => r.weekStart),
      ...weeklyGameplans.map((g) => g.weekStart),
    ]);

    return Array.from(allWeeks)
      .sort((a, b) => b.localeCompare(a))
      .map((weekStart) => {
        const stats = computeWeekReviewStats(trades, weekStart);
        return {
          weekStart,
          review: reviewMap.get(weekStart),
          gameplan: gameplanMap.get(weekStart),
          livePnl: stats.totalPnl,
          liveTrades: stats.totalTrades,
        };
      });
  }, [weeklyReviews, weeklyGameplans, trades]);

  const filteredWeeks = useMemo(() => {
    if (selectedYear === "all") return mergedWeeks;
    return mergedWeeks.filter((w) => w.weekStart.startsWith(selectedYear));
  }, [mergedWeeks, selectedYear]);

  const years = useMemo(() => {
    const set = new Set(mergedWeeks.map((w) => w.weekStart.substring(0, 4)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [mergedWeeks]);

  const currentWeek = mergedWeeks.find((w) => w.weekStart === currentWeekStart);
  const currentStats = computeWeekReviewStats(trades, currentWeekStart);

  const isLoading = !weeklyReviews || !weeklyGameplans;

  return (
    <PageShell
      title="Planning"
      subtitle="Weekly pre-gameplan and review — stats computed live from your trades."
      maxWidth="xl"
      actions={
        <Button onClick={() => setShowNewDialog(true)} size="sm" className="rounded-md">
          <Plus className="h-4 w-4" />
          New
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : (
        <>
          <ContentCard padding="none" className="px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">This week</p>
            <div className="mt-4 grid grid-cols-1 divide-y divide-zinc-100 dark:divide-zinc-800 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
              <div className="py-4 sm:py-0 sm:pr-6">
                <StatInline label="P&L" value={formatPnl(currentStats.totalPnl)} valueClassName={currentStats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
              </div>
              <div className="py-4 sm:px-6 sm:py-0">
                <StatInline label="Trades" value={currentStats.totalTrades} />
              </div>
              <div className="py-4 sm:px-6 sm:py-0">
                <StatInline label="Win rate" value={`${currentStats.winRate}%`} />
              </div>
              <div className="py-4 sm:px-6 sm:py-0">
                <StatInline label="Gameplan" value={currentWeek?.gameplan ? "Done" : "Pending"} />
              </div>
              <div className="pt-4 sm:pl-6 sm:pt-0">
                <StatInline label="Review" value={currentWeek?.review ? "Done" : "Pending"} />
              </div>
            </div>
          </ContentCard>

          <div className="flex items-center justify-between">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/statistics" className="text-xs text-muted-foreground underline hover:text-foreground">
              Weekly P&L chart → Statistics
            </Link>
          </div>

          {filteredWeeks.length > 0 ? (
            <div className="space-y-3">
              {filteredWeeks.map((week) => (
                <WeekCard key={week.weekStart} week={week} isCurrent={week.weekStart === currentWeekStart} />
              ))}
            </div>
          ) : (
            <ContentCard className="text-center">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No weeks tracked yet</p>
              <Button onClick={() => setShowNewDialog(true)} className="mt-4 rounded-md" size="sm">
                Start planning
              </Button>
            </ContentCard>
          )}
        </>
      )}

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a new week</DialogTitle>
            <DialogDescription>Create a pre-gameplan or write your weekly review.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Link
              href="/weekly/gameplan/new"
              onClick={() => setShowNewDialog(false)}
              className="flex items-start gap-3 rounded-lg border border-border/60 p-4 hover:bg-muted/30"
            >
              <Target className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Pre-Gameplan</p>
                <p className="text-sm text-muted-foreground">Bias, focus instruments, rules, chart context</p>
              </div>
            </Link>
            <Link
              href="/weekly/review/new"
              onClick={() => setShowNewDialog(false)}
              className="flex items-start gap-3 rounded-lg border border-border/60 p-4 hover:bg-muted/30"
            >
              <ClipboardList className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-medium">Weekly Review</p>
                <p className="text-sm text-muted-foreground">Live stats + reflection notes</p>
              </div>
            </Link>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
