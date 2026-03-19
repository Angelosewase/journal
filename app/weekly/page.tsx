"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Mini progress bar component
function MiniBar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
      <div className={`h-full rounded-full ${color} transition-all duration-500`}
           style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function WeeklyPage() {
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const [selectedYear, setSelectedYear] = useState("all");

  const sortedReviews = useMemo(() => {
    if (!weeklyReviews) return [];
    return [...weeklyReviews].sort((a, b) =>
      b.weekStart.localeCompare(a.weekStart),
    );
  }, [weeklyReviews]);

  const years = useMemo(() => {
    const yearSet = new Set<string>();
    sortedReviews.forEach((r) => yearSet.add(r.weekStart.substring(0, 4)));
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [sortedReviews]);

  const filteredReviews = useMemo(() => {
    if (selectedYear === "all") return sortedReviews;
    return sortedReviews.filter((r) => r.weekStart.startsWith(selectedYear));
  }, [sortedReviews, selectedYear]);

  const summary = useMemo(() => {
    if (filteredReviews.length === 0) return null;
    const totalTrades = filteredReviews.reduce(
      (sum, r) => sum + r.totalTrades,
      0,
    );
    const totalPnl = filteredReviews.reduce((sum, r) => sum + r.totalPnl, 0);
    const avgWinRate =
      filteredReviews.reduce((sum, r) => {
        const wr =
          r.totalTrades > 0 ? (r.winningTrades / r.totalTrades) * 100 : 0;
        return sum + wr;
      }, 0) / filteredReviews.length;
    const avgTrinity =
      filteredReviews.reduce((sum, r) => sum + r.avgTrinityScore, 0) /
      filteredReviews.length;
    return {
      totalTrades,
      totalPnl,
      avgWinRate,
      avgTrinity,
      weeks: filteredReviews.length,
    };
  }, [filteredReviews]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Weekly Reviews
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Track your weekly trading performance
            </p>
          </div>
          <Button asChild className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary  text-white text-sm font-medium shadow-sm transition-colors">
            <Link href="/weekly/new">
              <Plus className="h-3.5 w-3.5" />
              Add Review
            </Link>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
              <div className="pr-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    TOTAL TRADES
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.totalTrades}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    Across {summary.weeks} week{summary.weeks !== 1 ? "s" : ""}
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
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    {">"}50% is profitable
                  </p>
                </div>
              </div>
              <div className="pl-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    AVG TRINITY
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.avgTrinity.toFixed(1)}/10
                  </p>
                  <MiniBar value={summary.avgTrinity} max={10} color={summary.avgTrinity >= 7 ? "bg-sky-500" : summary.avgTrinity >= 5 ? "bg-amber-500" : "bg-red-400"} />
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    /10 scale
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 dark:bg-zinc-800/60 border-0">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                  Week
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center">
                  Trades
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center">
                  W/L
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-right">
                  P&L
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center">
                  Win Rate
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center">
                  Trinity
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center">
                  Patience
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-right">
                  Profit Factor
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => {
                const winRate =
                  review.totalTrades > 0
                    ? Math.round((review.winningTrades / review.totalTrades) * 100)
                    : 0;
                return (
                  <TableRow
                    key={review._id}
                    className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/weekly/${review._id}`)}
                  >
                    <TableCell className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 py-3">
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(review.weekStart).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(review.weekEnd).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {new Date(review.weekEnd).getFullYear()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-zinc-800 dark:text-zinc-100 py-3">
                      {review.totalTrades}
                    </TableCell>
                    <TableCell className="text-center text-zinc-800 dark:text-zinc-100 py-3">
                      <span className="text-emerald-600 font-bold">
                        {review.winningTrades}
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500">/</span>
                      <span className="text-red-500 font-bold">{review.losingTrades}</span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold py-3 ${review.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      ${review.totalPnl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        winRate >= 50 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {winRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <span
                        className={`font-bold ${
                          review.avgTrinityScore >= 7
                            ? "text-sky-500"
                            : review.avgTrinityScore >= 5
                              ? "text-amber-500"
                              : "text-red-500"
                        }`}
                      >
                        {review.avgTrinityScore}/10
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <span
                        className={`font-bold ${
                          review.patienceScore >= 7
                            ? "text-emerald-600"
                            : review.patienceScore >= 5
                              ? "text-amber-500"
                              : "text-red-500"
                        }`}
                      >
                        {review.patienceScore}/10
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-zinc-800 dark:text-zinc-100 py-3">
                      {review.profitFactor.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3">
                      <ArrowRight className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredReviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500">
                        No weekly reviews yet
                      </p>
                      <Button asChild className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold transition-colors">
                        <Link href="/weekly/new">Create your first review</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
