"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { Calendar, TrendingUp, TrendingDown, BarChart3, Sparkles, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

function MiniBar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
      <div className={`h-full rounded-full ${color} transition-all duration-500`}
           style={{ width: `${pct}%` }} />
    </div>
  );
}

function getBiasBadge(bias: string) {
  switch (bias) {
    case "BULLISH":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "BEARISH":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function EmptySlot({ type }: { type: "review" | "fundamental" }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
      <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        {type === "review" ? (
          <BarChart3 className="h-3 w-3 text-zinc-400" />
        ) : (
          <Sparkles className="h-3 w-3 text-zinc-400" />
        )}
      </div>
      <span className="text-xs text-zinc-400">Not added</span>
    </div>
  );
}

function StatusPill({ type, data }: { type: "review" | "fundamental"; data?: any }) {
  if (!data) return <EmptySlot type={type} />;
  
  if (type === "review") {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <BarChart3 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {data.totalTrades} trades · ${data.totalPnl.toFixed(0)}
          </span>
          <span className="text-[10px] text-emerald-500/70">
            {Math.round((data.winningTrades / data.totalTrades) * 100)}% win rate
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
        <Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
          {data.overallRiskSentiment} · {data.usdBias}
        </span>
        <span className="text-[10px] text-blue-500/70">
          DXY: {data.dxyWeeklyBias}
        </span>
      </div>
    </div>
  );
}

export default function WeeklyPage() {
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const weeklyFundamentals = useQuery(api.weeklyFundamentalAnalysis.list);
  const [selectedYear, setSelectedYear] = useState("all");
  const [showNewWeekDialog, setShowNewWeekDialog] = useState(false);

  const mergedWeeks = useMemo(() => {
    if (!weeklyReviews || !weeklyFundamentals) return [];
    
    const reviewMap = new Map(weeklyReviews.map(r => [r.weekStart, r]));
    const fundamentalMap = new Map(weeklyFundamentals.map(f => [f.weekStart, f]));
    
    const allWeeks = new Set([
      ...weeklyReviews.map(r => r.weekStart),
      ...weeklyFundamentals.map(f => f.weekStart)
    ]);
    
    return Array.from(allWeeks).sort((a, b) => b.localeCompare(a)).map(weekStart => ({
      weekStart,
      review: reviewMap.get(weekStart),
      fundamental: fundamentalMap.get(weekStart)
    }));
  }, [weeklyReviews, weeklyFundamentals]);

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    mergedWeeks.forEach((w) => yearSet.add(w.weekStart.substring(0, 4)));
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [mergedWeeks]);

  const filteredWeeks = useMemo(() => {
    if (selectedYear === "all") return mergedWeeks;
    return mergedWeeks.filter((w) => w.weekStart.startsWith(selectedYear));
  }, [mergedWeeks, selectedYear]);

  const summary = useMemo(() => {
    if (filteredWeeks.length === 0) return null;
    const totalTrades = filteredWeeks.reduce((sum, w) => sum + (w.review?.totalTrades ?? 0), 0);
    const totalPnl = filteredWeeks.reduce((sum, w) => sum + (w.review?.totalPnl ?? 0), 0);
    const weeksWithTrades = filteredWeeks.filter(w => {
      const trades = w.review?.totalTrades;
      return trades != null && trades > 0;
    }).length;
    const avgWinRate = weeksWithTrades > 0 
      ? filteredWeeks.reduce((sum, w) => {
          const trades = w.review?.totalTrades ?? 0;
          if (!trades) return sum;
          const wr = (w.review!.winningTrades / trades) * 100;
          return sum + wr;
        }, 0) / weeksWithTrades
      : 0;
    const weeksWithFundamental = filteredWeeks.filter(w => w.fundamental).length;
    return {
      totalTrades,
      totalPnl,
      avgWinRate,
      weeks: filteredWeeks.length,
      weeksWithFundamental,
      weeksWithReview: weeksWithTrades,
    };
  }, [filteredWeeks]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Weekly
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Track your weekly trading performance and fundamental analysis
            </p>
          </div>
          <Button asChild className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors">
            <button onClick={() => setShowNewWeekDialog(true)}>
              <Plus className="h-3.5 w-3.5" />
              New Week
            </button>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {summary && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {summary.weeks} week{summary.weeks !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {summary && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-zinc-100 dark:divide-zinc-800">
              <div className="pr-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    TOTAL TRADES
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.totalTrades}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    {summary.weeksWithReview} weeks with trades
                  </p>
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    TOTAL P&L
                  </p>
                  <p className={`text-4xl font-bold leading-none ${summary.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    ${summary.totalPnl.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    Net profit / loss
                  </p>
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    AVG WIN RATE
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.avgWinRate.toFixed(1)}%
                  </p>
                  <MiniBar value={summary.avgWinRate} max={100} color={summary.avgWinRate >= 50 ? "bg-emerald-500" : "bg-red-400"} />
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    FUNDAMENTAL
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.weeksWithFundamental}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    analyses recorded
                  </p>
                </div>
              </div>
              <div className="pl-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    WEEKS
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.weeks}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    total tracked
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredWeeks.map((week) => {
                const review = week.review;
                const fundamental = week.fundamental;
                const weekEnd = review?.weekEnd || fundamental?.weekEnd || week.weekStart;
                const hasReview = !!review;
                const hasFundamental = !!fundamental;
                
                return (
                  <Link
                    key={week.weekStart}
                    href={`/weekly/${week.weekStart}`}
                    className="block group"
                  >
                    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                              {new Date(week.weekStart).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })} - {new Date(weekEnd).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-xs text-zinc-400">{new Date(weekEnd).getFullYear()}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <StatusPill type="review" data={review} />
                            <StatusPill type="fundamental" data={fundamental} />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {hasReview && (
                            <div className="text-right">
                              <p className={`text-lg font-bold ${review.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                ${review.totalPnl.toFixed(0)}
                              </p>
                              <p className="text-[10px] text-zinc-400">{review.totalTrades} trades</p>
                            </div>
                          )}
                          <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {filteredWeeks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    No weekly data yet
                  </p>
                  <Button onClick={() => setShowNewWeekDialog(true)} className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                    Start your first week
                  </Button>
                </div>
              )}

        <Dialog open={showNewWeekDialog} onOpenChange={setShowNewWeekDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Week</DialogTitle>
              <DialogDescription>
                How would you like to begin tracking this week?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                asChild 
                className="w-full h-12 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowNewWeekDialog(false)}
              >
                <Link href="/weekly/fundamental/new">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add Fundamental Analysis
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="w-full h-12 rounded-lg"
                onClick={() => setShowNewWeekDialog(false)}
              >
                <Link href="/weekly/review/new">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Add Weekly Review
                </Link>
              </Button>
              <p className="text-xs text-zinc-400 text-center pt-2">
                You can add the other section later
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}