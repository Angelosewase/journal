"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, TrendingUp, TrendingDown, Minus, Sun, Moon, ArrowRight, Target, DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function TodayPage() {
  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);
  const todayTrades = trades?.filter(
    (t) => new Date(t.createdAt).toISOString().split("T")[0] === today
  );

  const todayPnl = todayTrades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
  const wins = todayTrades?.filter((t) => t.winLossStatus === "WIN").length || 0;
  const losses = todayTrades?.filter((t) => t.winLossStatus === "LOSS").length || 0;

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case "BULLISH":
        return <TrendingUp className="h-4 w-4" />;
      case "BEARISH":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case "BULLISH":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "BEARISH":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </h1>
        </div>
        <Button asChild>
          <Link href="/trades/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Link>
        </Button>
      </div>

      {todayTrades && todayTrades.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayTrades.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {wins}W / {losses}L
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Trades Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${todayPnl >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  <DollarSign className={`h-5 w-5 ${todayPnl >= 0 ? "text-emerald-600" : "text-red-600"}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${todayPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    ${todayPnl.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">P&L Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${todayBias?.currentDailyBias === "BULLISH" ? "bg-emerald-100 dark:bg-emerald-900/30" : todayBias?.currentDailyBias === "BEARISH" ? "bg-red-100 dark:bg-red-900/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                  {getBiasIcon(todayBias?.currentDailyBias || "NEUTRAL")}
                </div>
                <div>
                  <p className="text-lg font-semibold">{todayBias?.currentDailyBias || "Not Set"}</p>
                  {todayBias && <p className="text-xs text-muted-foreground">{todayBias.biasConfidence}/10</p>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Morning Bias</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Target className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{todayBias?.sessionToTrade || "Not Set"}</p>
                  <p className="text-xs text-muted-foreground">{todayBias?.modelToFocus || "—"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Session & Model</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Morning Bias</CardTitle>
            </div>
            <CardDescription>Pre-market analysis & trading plan</CardDescription>
          </CardHeader>
          <CardContent>
            {todayBias ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={`gap-1 text-sm px-3 py-1 ${getBiasColor(todayBias.currentDailyBias)}`}>
                    {getBiasIcon(todayBias.currentDailyBias)}
                    {todayBias.currentDailyBias}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Confidence: {todayBias.biasConfidence}/10</span>
                </div>
                {todayBias.biasReason && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{todayBias.biasReason}</p>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Session</p>
                    <p className="font-medium">{todayBias.sessionToTrade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instrument</p>
                    <p className="font-medium">{todayBias.bestInstrument || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium">{todayBias.modelToFocus}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <p className="font-medium">{todayBias.confidenceForToday}/10</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <Link href="/daily-bias/morning">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sun className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No morning bias set yet</p>
                <Button asChild>
                  <Link href="/daily-bias/morning">Set Morning Bias</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg">Evening Review</CardTitle>
            </div>
            <CardDescription>Post-market analysis & lessons learned</CardDescription>
          </CardHeader>
          <CardContent>
            {todayBias?.actualMovement ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Morning Bias</p>
                    <Badge className={`gap-1 mt-1 ${getBiasColor(todayBias.currentDailyBias)}`}>
                      {getBiasIcon(todayBias.currentDailyBias)}
                      {todayBias.currentDailyBias}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <Badge className={`gap-1 mt-1 ${getBiasColor(todayBias.actualMovement)}`}>
                      {getBiasIcon(todayBias.actualMovement)}
                      {todayBias.actualMovement}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="font-semibold">{todayBias.accuracyScore}/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Discipline</p>
                    <p className="font-semibold">{todayBias.overallDiscipline}/10</p>
                  </div>
                </div>
                {todayBias.tradesTaken !== undefined && (
                  <>
                    <Separator />
                    <p className="text-sm text-muted-foreground">
                      Trades: {todayBias.tradesWorked || 0} worked / {todayBias.tradesFailed || 0} failed
                    </p>
                  </>
                )}
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <Link href="/daily-bias/evening">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Moon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-4">Complete your evening review</p>
                <Button variant="outline" asChild>
                  <Link href="/daily-bias/evening">Complete Evening Review</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today&apos;s Trades</CardTitle>
              <CardDescription>
                {todayTrades?.length || 0} trade{(todayTrades?.length || 0) !== 1 ? "s" : ""} recorded
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/trades">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayTrades && todayTrades.length > 0 ? (
            <div className="space-y-2">
              {todayTrades.map((trade) => (
                <Link
                  key={trade._id}
                  href={`/trades/${trade._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={trade.direction === "LONG"
                        ? "border-emerald-500 text-emerald-600"
                        : "border-red-500 text-red-600"
                      }
                    >
                      {trade.direction}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{trade.instrument}</p>
                      <p className="text-xs text-muted-foreground">
                        {trade.entryPrice} → {trade.exitPrice || "Open"} | SL: {trade.stopLossPrice}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${(trade.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "Open"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {trade.winLossStatus || "Pending"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No trades recorded today</p>
              <Button asChild>
                <Link href="/trades/new">Log Your First Trade</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
