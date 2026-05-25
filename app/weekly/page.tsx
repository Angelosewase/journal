"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useState, useMemo } from "react";
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
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Circle,
  Target,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type WeeklyReview = Doc<"weeklyReviews">;
type WeeklyFundamental = Doc<"weeklyFundamentalAnalysis">;

type MergedWeek = {
  weekStart: string;
  review?: WeeklyReview;
  fundamental?: WeeklyFundamental;
};

type StatusFilter = "all" | "complete" | "incomplete" | "review" | "fundamental";

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

function formatWeekRange(weekStart: string, weekEnd: string): string {
  const start = new Date(weekStart);
  const end = new Date(weekEnd);
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

function getWeekLabel(weekStart: string): string {
  const date = new Date(weekStart);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `Week ${weekNum}`;
}

function formatPnl(value: number, compact = false): string {
  const prefix = value >= 0 ? "+" : "";
  if (compact && Math.abs(value) >= 1000) {
    return `${prefix}$${(value / 1000).toFixed(1)}k`;
  }
  return `${prefix}$${value.toFixed(compact ? 0 : 2)}`;
}

function getBiasStyles(bias: string) {
  switch (bias) {
    case "BULLISH":
    case "RISK_ON":
      return {
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-500",
      };
    case "BEARISH":
    case "RISK_OFF":
      return {
        badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        dot: "bg-red-500",
      };
    default:
      return {
        badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
        dot: "bg-zinc-400",
      };
  }
}

function formatSentiment(value: string): string {
  return value.replace(/_/g, " ");
}

function getCompletionCount(week: MergedWeek): number {
  return (week.review ? 1 : 0) + (week.fundamental ? 1 : 0);
}

function MiniBar({
  value,
  max,
  color = "bg-emerald-500",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
        <p className={cn("mt-0.5 text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50", valueClass)}>
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
      </div>
    </div>
  );
}

function PnlTrendChart({ weeks }: { weeks: MergedWeek[] }) {
  const data = weeks
    .filter((w) => w.review)
    .slice(0, 12)
    .reverse()
    .map((w) => ({
      weekStart: w.weekStart,
      pnl: w.review!.totalPnl,
    }));

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Weekly P&L trend</p>
          <p className="text-xs text-zinc-400">
            {data.length > 0
              ? `Last ${data.length} weeks with reviews`
              : "No reviewed weeks in current filter"}
          </p>
        </div>
        <Activity className="h-4 w-4 text-zinc-400" />
      </div>
      {data.length > 0 ? (
        <div className="flex h-24 items-end gap-1.5">
          {data.map((d) => {
            const height = Math.max((Math.abs(d.pnl) / Math.max(...data.map((x) => Math.abs(x.pnl)), 1)) * 100, 8);
            const positive = d.pnl >= 0;
            return (
              <div key={d.weekStart} className="group flex flex-1 flex-col items-center gap-1">
                <div className="relative flex h-20 w-full items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-md transition-all group-hover:opacity-80",
                      positive ? "bg-emerald-500" : "bg-red-400",
                    )}
                    style={{ height: `${height}%` }}
                    title={`${formatWeekRange(d.weekStart, d.weekStart)}: ${formatPnl(d.pnl)}`}
                  />
                </div>
                <span className="text-[9px] text-zinc-400">
                  {new Date(d.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-400">Adjust filters to see weekly P&L history</p>
        </div>
      )}
    </div>
  );
}

function CompletionRing({ filled, total }: { filled: number; total: number }) {
  const pct = total > 0 ? (filled / total) * 100 : 0;
  const complete = filled === total;
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${pct * 0.88} 88`}
          strokeLinecap="round"
          className={complete ? "text-emerald-500" : "text-primary"}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
        {filled}/{total}
      </span>
    </div>
  );
}

function ReviewPanel({ review }: { review?: WeeklyReview }) {
  if (!review) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
        <BarChart3 className="h-4 w-4 text-zinc-300" />
        <div>
          <p className="text-xs font-medium text-zinc-500">Weekly review</p>
          <p className="text-[11px] text-zinc-400">Not recorded</p>
        </div>
      </div>
    );
  }

  const winRate =
    review.totalTrades > 0 ? (review.winningTrades / review.totalTrades) * 100 : 0;

  return (
    <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2.5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Review</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-400">P&L</p>
          <p
            className={cn(
              "text-sm font-bold",
              review.totalPnl >= 0 ? "text-emerald-600" : "text-red-500",
            )}
          >
            {formatPnl(review.totalPnl, true)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-400">Trades</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{review.totalTrades}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-400">Win rate</p>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{winRate.toFixed(0)}%</p>
        </div>
      </div>
      {review.totalTrades > 0 && (
        <MiniBar
          value={winRate}
          max={100}
          color={winRate >= 50 ? "bg-emerald-500" : "bg-red-400"}
        />
      )}
    </div>
  );
}

function FundamentalPanel({ fundamental }: { fundamental?: WeeklyFundamental }) {
  if (!fundamental) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
        <Sparkles className="h-4 w-4 text-zinc-300" />
        <div>
          <p className="text-xs font-medium text-zinc-500">Fundamental analysis</p>
          <p className="text-[11px] text-zinc-400">Not recorded</p>
        </div>
      </div>
    );
  }

  const sentimentStyle = getBiasStyles(fundamental.overallRiskSentiment);
  const usdStyle = getBiasStyles(fundamental.usdBias);

  return (
    <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 px-3 py-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Fundamentals</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className={cn("text-[10px] font-semibold", sentimentStyle.badge)}>
          {formatSentiment(fundamental.overallRiskSentiment)}
        </Badge>
        <Badge variant="outline" className={cn("text-[10px] font-semibold", usdStyle.badge)}>
          USD {fundamental.usdBias}
        </Badge>
        <Badge variant="outline" className="border-zinc-500/20 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
          DXY {fundamental.dxyWeeklyBias}
        </Badge>
      </div>
      {fundamental.highestImpactEvent && (
        <p className="mt-2 truncate text-[11px] text-zinc-500" title={fundamental.highestImpactEvent}>
          Key event: {fundamental.highestImpactEvent}
        </p>
      )}
    </div>
  );
}

function WeekCard({ week, isCurrent }: { week: MergedWeek; isCurrent?: boolean }) {
  const review = week.review;
  const fundamental = week.fundamental;
  const weekEnd = review?.weekEnd ?? fundamental?.weekEnd ?? week.weekStart;
  const completion = getCompletionCount(week);
  const complete = completion === 2;

  return (
    <Link href={`/weekly/${week.weekStart}`} className="group block">
      <article
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-white transition-all dark:bg-zinc-900",
          "border-zinc-100 hover:border-primary/30 hover:shadow-md dark:border-zinc-800 dark:hover:border-primary/40",
          isCurrent && "ring-2 ring-primary/20 border-primary/30",
        )}
      >
        {isCurrent && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/60 via-primary to-primary/60" />
        )}

        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <CompletionRing filled={completion} total={2} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {isCurrent && (
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">This week</Badge>
                )}
                <span className="text-xs font-medium text-zinc-400">{getWeekLabel(week.weekStart)}</span>
                {complete ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                    <Circle className="h-3 w-3" /> Incomplete
                  </span>
                )}
              </div>

              <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {formatWeekRange(week.weekStart, weekEnd)}
              </h3>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ReviewPanel review={review} />
                <FundamentalPanel fundamental={fundamental} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-4 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0 dark:border-zinc-800">
            {review ? (
              <div className="text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-wide text-zinc-400">Net P&L</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    review.totalPnl >= 0 ? "text-emerald-600" : "text-red-500",
                  )}
                >
                  {formatPnl(review.totalPnl)}
                </p>
                {review.avgTrinityScore > 0 && (
                  <p className="mt-0.5 text-xs text-zinc-400">
                    Trinity {review.avgTrinityScore.toFixed(1)}/9
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No performance data</p>
            )}

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 transition-colors group-hover:bg-primary/10 dark:bg-zinc-800">
              <ChevronRight className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-primary" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl" />
      ))}
    </div>
  );
}

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All weeks" },
  { value: "complete", label: "Complete" },
  { value: "incomplete", label: "Incomplete" },
  { value: "review", label: "Has review" },
  { value: "fundamental", label: "Has fundamentals" },
];

export default function WeeklyPage() {
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const weeklyFundamentals = useQuery(api.weeklyFundamentalAnalysis.list);
  const [selectedYear, setSelectedYear] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showNewWeekDialog, setShowNewWeekDialog] = useState(false);

  const currentWeekStart = useMemo(() => getCurrentWeekStart(), []);

  const mergedWeeks = useMemo((): MergedWeek[] => {
    if (!weeklyReviews || !weeklyFundamentals) return [];

    const reviewMap = new Map(weeklyReviews.map((r) => [r.weekStart, r]));
    const fundamentalMap = new Map(weeklyFundamentals.map((f) => [f.weekStart, f]));

    const allWeeks = new Set([
      ...weeklyReviews.map((r) => r.weekStart),
      ...weeklyFundamentals.map((f) => f.weekStart),
    ]);

    return Array.from(allWeeks)
      .sort((a, b) => b.localeCompare(a))
      .map((weekStart) => ({
        weekStart,
        review: reviewMap.get(weekStart),
        fundamental: fundamentalMap.get(weekStart),
      }));
  }, [weeklyReviews, weeklyFundamentals]);

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    mergedWeeks.forEach((w) => yearSet.add(w.weekStart.substring(0, 4)));
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [mergedWeeks]);

  const filteredWeeks = useMemo(() => {
    return mergedWeeks.filter((w) => {
      if (selectedYear !== "all" && !w.weekStart.startsWith(selectedYear)) return false;

      const completion = getCompletionCount(w);
      switch (statusFilter) {
        case "complete":
          return completion === 2;
        case "incomplete":
          return completion < 2;
        case "review":
          return !!w.review;
        case "fundamental":
          return !!w.fundamental;
        default:
          return true;
      }
    });
  }, [mergedWeeks, selectedYear, statusFilter]);

  const currentWeekEntry = useMemo(
    () => mergedWeeks.find((w) => w.weekStart === currentWeekStart),
    [mergedWeeks, currentWeekStart],
  );

  const summary = useMemo(() => {
    const totalTrades = filteredWeeks.reduce((sum, w) => sum + (w.review?.totalTrades ?? 0), 0);
    const totalPnl = filteredWeeks.reduce((sum, w) => sum + (w.review?.totalPnl ?? 0), 0);
    const weeksWithTrades = filteredWeeks.filter((w) => (w.review?.totalTrades ?? 0) > 0);
    const avgWinRate =
      weeksWithTrades.length > 0
        ? weeksWithTrades.reduce((sum, w) => {
            const trades = w.review!.totalTrades;
            return sum + (w.review!.winningTrades / trades) * 100;
          }, 0) / weeksWithTrades.length
        : 0;
    const completeWeeks = filteredWeeks.filter((w) => getCompletionCount(w) === 2).length;
    const completionRate =
      filteredWeeks.length > 0 ? (completeWeeks / filteredWeeks.length) * 100 : 0;

    return {
      totalTrades,
      totalPnl,
      avgWinRate,
      weeks: filteredWeeks.length,
      completeWeeks,
      completionRate,
      isEmpty: filteredWeeks.length === 0,
    };
  }, [filteredWeeks]);

  const groupedWeeks = useMemo(() => {
    const groups = new Map<string, MergedWeek[]>();
    filteredWeeks.forEach((week) => {
      const year = week.weekStart.substring(0, 4);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(week);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredWeeks]);

  const isLoading = !weeklyReviews || !weeklyFundamentals;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 pb-16">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-zinc-400">
              <Layers className="h-3.5 w-3.5" />
              <span>Performance & macro planning</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Weekly Journal
            </h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Review your trading results and fundamental outlook week by week. Each week can include
              a performance review and a macro analysis.
            </p>
          </div>
          <Button
            onClick={() => setShowNewWeekDialog(true)}
            className="h-10 shrink-0 rounded-full px-5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New week
          </Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Current week spotlight */}
            {currentWeekEntry ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Current week
                </p>
                <WeekCard week={currentWeekEntry} isCurrent />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 dark:bg-primary/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Start tracking this week
                      </p>
                      <p className="text-sm text-zinc-500">
                        Week of{" "}
                        {formatWeekRange(
                          currentWeekStart,
                          new Date(
                            new Date(currentWeekStart).getTime() + 6 * 86400000,
                          )
                            .toISOString()
                            .split("T")[0],
                        )}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowNewWeekDialog(true)} className="rounded-full">
                    <Plus className="h-4 w-4" />
                    Begin this week
                  </Button>
                </div>
              </div>
            )}

            {/* Summary stats — always visible once data exists to prevent layout shift */}
            {mergedWeeks.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  label="Total P&L"
                  value={formatPnl(summary.totalPnl)}
                  sub={
                    summary.isEmpty
                      ? "No weeks match current filters"
                      : `Across ${summary.weeks} week${summary.weeks !== 1 ? "s" : ""}`
                  }
                  icon={summary.totalPnl >= 0 ? TrendingUp : TrendingDown}
                  valueClass={summary.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}
                />
                <StatTile
                  label="Total trades"
                  value={summary.totalTrades}
                  sub={summary.isEmpty ? "No weeks match current filters" : "From weekly reviews"}
                  icon={BarChart3}
                />
                <StatTile
                  label="Avg win rate"
                  value={`${summary.avgWinRate.toFixed(1)}%`}
                  sub={summary.isEmpty ? "No weeks match current filters" : "Per active week"}
                  icon={Target}
                />
                <StatTile
                  label="Completion"
                  value={`${summary.completionRate.toFixed(0)}%`}
                  sub={
                    summary.isEmpty
                      ? "No weeks match current filters"
                      : `${summary.completeWeeks} of ${summary.weeks} weeks fully logged`
                  }
                  icon={CheckCircle2}
                />
              </div>
            )}

            {/* P&L trend — fixed height placeholder when empty */}
            {mergedWeeks.length > 0 && <PnlTrendChart weeks={filteredWeeks} />}

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      statusFilter === filter.value
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9 w-36 rounded-lg border-zinc-200 bg-white text-xs dark:border-zinc-700 dark:bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Week list */}
            {filteredWeeks.length > 0 ? (
              <div className="space-y-8">
                {groupedWeeks.map(([year, weeks]) => (
                  <section key={year} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{year}</h2>
                      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                      <span className="text-xs text-zinc-400">
                        {weeks.length} week{weeks.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {weeks.map((week) => (
                        <WeekCard
                          key={week.weekStart}
                          week={week}
                          isCurrent={week.weekStart === currentWeekStart}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <Calendar className="h-7 w-7 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {mergedWeeks.length === 0 ? "No weeks tracked yet" : "No weeks match your filters"}
                </h3>
                <p className="mt-1 max-w-sm text-center text-sm text-zinc-500">
                  {mergedWeeks.length === 0
                    ? "Start your first weekly review or fundamental analysis to build your trading journal."
                    : "Try adjusting the year or status filters to see more results."}
                </p>
                {mergedWeeks.length === 0 && (
                  <Button
                    onClick={() => setShowNewWeekDialog(true)}
                    className="mt-6 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                    Start your first week
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* New week dialog */}
        <Dialog open={showNewWeekDialog} onOpenChange={setShowNewWeekDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start a new week</DialogTitle>
              <DialogDescription>
                Choose what to log first. You can always add the other section later from the week
                detail page.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              <Link
                href="/weekly/fundamental/new"
                onClick={() => setShowNewWeekDialog(false)}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    Fundamental analysis
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Macro outlook, currency biases, key events, and trade ideas for the week.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-zinc-300 transition-colors group-hover:text-blue-500" />
              </Link>

              <Link
                href="/weekly/review/new"
                onClick={() => setShowNewWeekDialog(false)}
                className="group flex items-start gap-4 rounded-xl border border-zinc-200 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-zinc-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">Weekly review</p>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Performance stats, WWA compliance, lessons learned, and action items.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-zinc-300 transition-colors group-hover:text-emerald-500" />
              </Link>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowNewWeekDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
