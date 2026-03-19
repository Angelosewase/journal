"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, TrendingUp, TrendingDown, Minus, Sun } from "lucide-react";
import Link from "next/link";
import { DailyBiasForm } from "@/components/DailyBiasForm";

export default function TodayPage() {
  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);
  const [showBiasForm, setShowBiasForm] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);
  const todayTrades = trades?.filter(
    (t) => new Date(t.createdAt).toISOString().split("T")[0] === today
  );

  const todayPnl = todayTrades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button asChild>
          <Link href="/trades/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Link>
        </Button>
      </div>

      {todayTrades && todayTrades.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trades Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTrades.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayTrades.filter(t => t.winLossStatus === "WIN").length}W / {todayTrades.filter(t => t.winLossStatus === "LOSS").length}L
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">P&L Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${todayPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                ${todayPnl.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Morning Bias</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={todayBias?.currentDailyBias === "BULLISH" ? "default" : todayBias?.currentDailyBias === "BEARISH" ? "destructive" : "secondary"} className="gap-1">
                {getBiasIcon(todayBias?.currentDailyBias || "NEUTRAL")}
                {todayBias?.currentDailyBias || "Not Set"}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Session Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">{todayBias?.sessionToTrade || "Not Set"}</div>
              <p className="text-xs text-muted-foreground">
                {todayBias?.modelToFocus || "Not Set"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-amber-500" />
                <CardTitle>Morning Bias</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowBiasForm(true)}>
                {todayBias ? "Edit" : "Set"}
              </Button>
            </div>
            <CardDescription>Your pre-market analysis and trading plan</CardDescription>
          </CardHeader>
          <CardContent>
            {todayBias ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={todayBias.currentDailyBias === "BULLISH" ? "default" : todayBias.currentDailyBias === "BEARISH" ? "destructive" : "secondary"} className="text-sm px-3 py-1">
                    {getBiasIcon(todayBias.currentDailyBias)}
                    {todayBias.currentDailyBias}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {todayBias.biasConfidence}/10
                  </span>
                </div>
                <p className="text-sm">{todayBias.biasReason}</p>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Session</p>
                    <p className="font-medium">{todayBias.sessionToTrade}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium">{todayBias.modelToFocus}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Instrument</p>
                    <p className="font-medium">{todayBias.bestInstrument || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <p className="font-medium">{todayBias.confidenceForToday}/10</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No morning bias set for today yet.</p>
                <Button variant="outline" onClick={() => setShowBiasForm(true)}>
                  Set Morning Bias
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Evening Review</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowEveningReview(true)}>
                {todayBias?.actualMovement ? "Edit" : "Complete"}
              </Button>
            </div>
            <CardDescription>Post-market analysis and lessons learned</CardDescription>
          </CardHeader>
          <CardContent>
            {todayBias?.actualMovement ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Morning Bias</p>
                    <p className="font-medium">{todayBias.currentDailyBias}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual</p>
                    <p className="font-medium">{todayBias.actualMovement}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="font-medium">{todayBias.wasCorrect} ({todayBias.accuracyScore}/10)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Discipline</p>
                    <p className="font-medium">{todayBias.overallDiscipline}/10</p>
                  </div>
                </div>
                {todayBias.tradesTaken && (
                  <>
                    <Separator />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Trades: {todayBias.tradesWorked} worked / {todayBias.tradesFailed} failed</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Complete your evening review to analyze today&apos;s performance.</p>
                <Button variant="outline" onClick={() => setShowEveningReview(true)}>
                  Complete Evening Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Trades</CardTitle>
          <CardDescription>
            {todayTrades?.length || 0} trade{(todayTrades?.length || 0) !== 1 ? "s" : ""} recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayTrades && todayTrades.length > 0 ? (
            <div className="space-y-3">
              {todayTrades.map((trade) => (
                <div
                  key={trade._id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Badge variant={trade.direction === "LONG" ? "default" : "destructive"} className={trade.direction === "LONG" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {trade.direction}
                    </Badge>
                    <div>
                      <p className="font-medium">{trade.instrument}</p>
                      <p className="text-sm text-muted-foreground">
                        Entry: {trade.entryPrice} | SL: {trade.stopLossPrice}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${(trade.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "Open"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trade.winLossStatus || "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No trades recorded today.</p>
              <Button asChild>
                <Link href="/trades/new">Log Your First Trade</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {(showBiasForm || showEveningReview) && (
        <DailyBiasForm
          onClose={() => {
            setShowBiasForm(false);
            setShowEveningReview(false);
          }}
          mode={showEveningReview ? "evening" : "morning"}
        />
      )}
    </div>
  );
}
