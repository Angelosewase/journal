"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Weekly Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your weekly trading performance
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/weekly/new">
            <Plus className="h-4 w-4" />
            Add Review
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
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
          <p className="text-sm text-muted-foreground">
            {summary.weeks} week{summary.weeks !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">
                Total Trades
              </p>
              <p className="text-2xl font-bold mt-1">{summary.totalTrades}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">
                Total P&L
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${summary.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                ${summary.totalPnl.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">
                Avg Win Rate
              </p>
              <p className="text-2xl font-bold mt-1">
                {summary.avgWinRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground uppercase">
                Avg Trinity
              </p>
              <p className="text-2xl font-bold mt-1">
                {summary.avgTrinity.toFixed(1)}/10
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead className="text-center">Trades</TableHead>
            <TableHead className="text-center">W/L</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead className="text-center">Win Rate</TableHead>
            <TableHead className="text-center">Trinity</TableHead>
            <TableHead className="text-center">Patience</TableHead>
            <TableHead className="text-right">Profit Factor</TableHead>
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
                className="cursor-pointer"
                onClick={() => (window.location.href = `/weekly/${review._id}`)}
              >
                <TableCell>
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
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.weekEnd).getFullYear()}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {review.totalTrades}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-emerald-600">
                    {review.winningTrades}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-red-600">{review.losingTrades}</span>
                </TableCell>
                <TableCell
                  className={`text-right font-semibold ${review.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  ${review.totalPnl.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={winRate >= 50 ? "default" : "secondary"}
                    className={
                      winRate >= 50 ? "bg-emerald-100 text-emerald-700" : ""
                    }
                  >
                    {winRate}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      review.avgTrinityScore >= 7
                        ? "text-emerald-600"
                        : review.avgTrinityScore >= 5
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {review.avgTrinityScore}/10
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      review.patienceScore >= 7
                        ? "text-emerald-600"
                        : review.patienceScore >= 5
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {review.patienceScore}/10
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {review.profitFactor.toFixed(2)}
                </TableCell>
                <TableCell>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            );
          })}
          {filteredReviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No weekly reviews yet
                </p>
                <Button asChild>
                  <Link href="/weekly/new">Create your first review</Link>
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
