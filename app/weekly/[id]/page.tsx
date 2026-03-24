"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Pencil, Trash2, TrendingUp, TrendingDown, Plus, Sparkles, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

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

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function StatCard({ label, value, subValue, color }: { label: string; value: string | number; subValue?: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </p>
      <p className={`text-2xl font-bold leading-none ${color || "text-zinc-900 dark:text-zinc-50"}`}>
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
          {subValue}
        </p>
      )}
    </div>
  );
}

function BiasRow({ currency, bias, reason }: { currency: string; bias: string; reason?: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 w-12">{currency}</span>
        {reason && <span className="text-xs text-zinc-500">{reason}</span>}
      </div>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getBiasBadge(bias)}`}>
        {bias}
      </span>
    </div>
  );
}

function TradeIdeaCard({ num, pair, direction, reason, keyLevel, invalidation }: { 
  num: number; pair?: string; direction?: string; reason?: string; keyLevel?: string; invalidation?: string 
}) {
  if (!pair) return null;
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{pair}</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          direction === "LONG" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}>
          {direction}
        </span>
      </div>
      {reason && <p className="text-sm text-zinc-600 dark:text-zinc-400">{reason}</p>}
      {keyLevel && <p className="text-xs text-zinc-500">Key level: {keyLevel}</p>}
      {invalidation && <p className="text-xs text-zinc-400">Invalidation: {invalidation}</p>}
    </div>
  );
}

export default function WeeklyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const weekStart = params.id as string;

  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const weeklyFundamentals = useQuery(api.weeklyFundamentalAnalysis.list);

  const review = useMemo(() => 
    weeklyReviews?.find(r => r.weekStart === weekStart), 
  [weeklyReviews, weekStart]);
  
  const fundamental = useMemo(() => 
    weeklyFundamentals?.find(f => f.weekStart === weekStart),
  [weeklyFundamentals, weekStart]);

  const removeReview = useMutation(api.weeklyReviews.remove);
  const removeFundamental = useMutation(api.weeklyFundamentalAnalysis.remove);
  
  const [activeTab, setActiveTab] = useState<"fundamental" | "review">("fundamental");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = async () => {
    if (review) await removeReview({ id: review._id });
    if (fundamental) await removeFundamental({ id: fundamental._id });
    router.push("/weekly");
  };

  if (!weeklyReviews || !weeklyFundamentals) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const hasReview = !!review;
  const hasFundamental = !!fundamental;
  const weekEnd = review?.weekEnd || fundamental?.weekEnd || weekStart;

  useEffect(() => {
    if (hasFundamental) setActiveTab("fundamental");
    else if (hasReview) setActiveTab("review");
  }, [hasFundamental, hasReview]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/weekly">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Week of {new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                {hasReview && hasFundamental ? "Review + Fundamental Analysis" : hasReview ? "Weekly Review" : "Fundamental Analysis"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(hasReview || hasFundamental) && (
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Week
              </Button>
            )}
            {hasReview && hasFundamental && (
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {(!hasReview || !hasFundamental) && (
              <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add {hasFundamental ? "Review" : "Analysis"}
              </Button>
            )}
            {hasFundamental && !hasReview && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/weekly/${weekStart}/edit?mode=fundamental`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {hasReview && hasFundamental && (
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("fundamental")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "fundamental"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Analysis
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "review"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Review
            </button>
          </div>
        )}

        {/* Show which tabs are missing */}
        {(!hasReview || !hasFundamental) && (
          <div className="flex gap-3">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${hasFundamental ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800" : "bg-zinc-50 dark:bg-zinc-800/50 border-dashed border-zinc-200 dark:border-zinc-700"}`}>
              {hasFundamental ? <Sparkles className="h-4 w-4 text-emerald-500" /> : <Sparkles className="h-4 w-4 text-zinc-400" />}
              <span className={`text-sm ${hasFundamental ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-400"}`}>
                Analysis {hasFundamental ? "✓" : "— missing"}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${hasReview ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800" : "bg-zinc-50 dark:bg-zinc-800/50 border-dashed border-zinc-200 dark:border-zinc-700"}`}>
              {hasReview ? <BarChart3 className="h-4 w-4 text-emerald-500" /> : <BarChart3 className="h-4 w-4 text-zinc-400" />}
              <span className={`text-sm ${hasReview ? "text-emerald-700 dark:text-emerald-300" : "text-zinc-400"}`}>
                Review {hasReview ? "✓" : "— missing"}
              </span>
            </div>
          </div>
        )}

        {/* Fundamental Analysis Section */}
        {hasFundamental && (activeTab === "fundamental" || !hasReview) && (
          <>
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
                <div className="pr-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      RISK SENTIMENT
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit ${
                      fundamental.overallRiskSentiment === "RISK_ON"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : fundamental.overallRiskSentiment === "RISK_OFF"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {fundamental.overallRiskSentiment}
                    </span>
                  </div>
                </div>
                <div className="px-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      DXY BIAS
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit ${getBiasBadge(fundamental.dxyWeeklyBias)}`}>
                      {fundamental.dxyWeeklyBias}
                    </span>
                  </div>
                </div>
                <div className="px-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      VIX LEVEL
                    </p>
                    <p className="text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                      {fundamental.vixLevel ? Number(fundamental.vixLevel).toFixed(1) : "—"}
                    </p>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                      {fundamental.vixDirection === "ABOVE_20" ? "Elevated" : "Calm"}
                    </p>
                  </div>
                </div>
                <div className="pl-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      10YR YIELD
                    </p>
                    <p className="text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                      {fundamental.us10yrYield ? `${Number(fundamental.us10yrYield).toFixed(2)}%` : "—"}
                    </p>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                      {fundamental.us10yrDirection}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Currency Bias</h2>
                <div className="grid gap-2">
                  <BiasRow currency="USD" bias={fundamental.usdBias} reason={fundamental.usdReason} />
                  <BiasRow currency="EUR" bias={fundamental.eurBias} reason={fundamental.eurReason} />
                  <BiasRow currency="GBP" bias={fundamental.gbpBias} reason={fundamental.gbpReason} />
                  <BiasRow currency="JPY" bias={fundamental.jpyBias} reason={fundamental.jpyReason} />
                  <BiasRow currency="CAD" bias={fundamental.cadBias} reason={fundamental.cadReason} />
                  <BiasRow currency="AUD" bias={fundamental.audBias} reason={fundamental.audReason} />
                  <BiasRow currency="CHF" bias={fundamental.chfBias} reason={fundamental.chfReason} />
                  <BiasRow currency="NZD" bias={fundamental.nzdBias} reason={fundamental.nzdReason} />
                </div>
              </div>
            </div>

            {(fundamental.highestImpactEvent || fundamental.mondayEvents || fundamental.tuesdayEvents || fundamental.wednesdayEvents || fundamental.thursdayEvents || fundamental.fridayEvents) && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Key Events This Week</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {fundamental.mondayEvents && <InfoRow label="Monday" value={fundamental.mondayEvents} />}
                    {fundamental.tuesdayEvents && <InfoRow label="Tuesday" value={fundamental.tuesdayEvents} />}
                    {fundamental.wednesdayEvents && <InfoRow label="Wednesday" value={fundamental.wednesdayEvents} />}
                    {fundamental.thursdayEvents && <InfoRow label="Thursday" value={fundamental.thursdayEvents} />}
                    {fundamental.fridayEvents && <InfoRow label="Friday" value={fundamental.fridayEvents} />}
                  </div>
                  {fundamental.highestImpactEvent && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <InfoRow label="Highest Impact Event" value={fundamental.highestImpactEvent} />
                      {fundamental.expectedMarketReaction && <InfoRow label="Expected Reaction" value={fundamental.expectedMarketReaction} />}
                    </div>
                  )}
                </div>
              </div>
            )}

            {(fundamental.trade1Pair || fundamental.trade2Pair) && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Trade Ideas</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <TradeIdeaCard 
                    num={1} 
                    pair={fundamental.trade1Pair} 
                    direction={fundamental.trade1Direction} 
                    reason={fundamental.trade1Reason}
                    keyLevel={fundamental.trade1KeyLevel}
                    invalidation={fundamental.trade1Invalidation}
                  />
                  <TradeIdeaCard 
                    num={2} 
                    pair={fundamental.trade2Pair} 
                    direction={fundamental.trade2Direction} 
                    reason={fundamental.trade2Reason}
                    keyLevel={fundamental.trade2KeyLevel}
                    invalidation={fundamental.trade2Invalidation}
                  />
                </div>
              </div>
            )}

            {fundamental.confirmationOfBias && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">End of Week Review</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {fundamental.confirmationOfBias && <InfoRow label="Did data confirm your bias?" value={fundamental.confirmationOfBias} />}
                  {fundamental.surprisingData && <InfoRow label="Surprising Data" value={fundamental.surprisingData} />}
                  {fundamental.missedAnalysis && <InfoRow label="What did you miss?" value={fundamental.missedAnalysis} />}
                  {fundamental.adjustmentsNextWeek && <InfoRow label="Adjustments for next week" value={fundamental.adjustmentsNextWeek} />}
                </div>
              </div>
            )}
          </>
        )}

        {/* Weekly Review Section */}
        {hasReview && (activeTab === "review" || !hasFundamental) && (
          <>
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
                <div className="pr-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      TOTAL TRADES
                    </p>
                    <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                      {review.totalTrades}
                    </p>
                    <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                      {review.winningTrades}W / {review.losingTrades}L
                    </p>
                  </div>
                </div>
                <div className="px-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      TOTAL P&L
                    </p>
                    <p className={`text-4xl font-bold leading-none ${review.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      ${review.totalPnl.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="px-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      WIN RATE
                    </p>
                    <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                      {review.totalTrades > 0 ? Math.round((review.winningTrades / review.totalTrades) * 100) : 0}%
                    </p>
                    <MiniBar value={review.totalTrades > 0 ? (review.winningTrades / review.totalTrades) * 100 : 0} max={100} color={review.totalTrades > 0 && review.winningTrades / review.totalTrades >= 0.5 ? "bg-emerald-500" : "bg-red-400"} />
                  </div>
                </div>
                <div className="pl-6">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      TRINITY SCORE
                    </p>
                    <p className="text-4xl font-bold leading-none text-sky-500">
                      {review.avgTrinityScore}/10
                    </p>
                    <MiniBar value={review.avgTrinityScore} max={10} color="bg-sky-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Performance Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="Profit Factor" value={review.profitFactor.toFixed(2)} />
                  <StatCard label="Patience Score" value={`${review.patienceScore}/10`} color={review.patienceScore >= 7 ? "text-emerald-600" : review.patienceScore >= 5 ? "text-amber-500" : "text-red-500"} />
                  <StatCard label="Avg Win" value={`$${review.avgWin.toFixed(2)}`} subValue="per trade" />
                  <StatCard label="Avg Loss" value={`$${review.avgLoss.toFixed(2)}`} subValue="per trade" />
                  <StatCard label="Inducement %" value={`${review.inducementPercentage}%`} />
                  <StatCard label="Killzone %" value={`${review.killzonePercentage}%`} />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Setup Quality</h2>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard label="POI ID Score" value={`${review.poiIdentificationScore}/10`} />
                  <StatCard label="Inducement Score" value={`${review.inducementRecognitionScore}/10`} />
                  <StatCard label="Entry Score" value={`${review.entryExecutionScore}/10`} />
                  <StatCard label="Risk Mgmt Score" value={`${review.riskManagementScore}/10`} />
                  <StatCard label="Pristine Setups" value={review.pristineCleanSetups} />
                  <StatCard label="Questionable Setups" value={review.questionableSetups} />
                </div>
              </div>
            </div>

            {(review.bestTradeDescription || review.adjustmentNextWeek) && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Lessons & Insights</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {review.bestTradeDescription && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">Best Trade</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{review.bestTradeDescription}</p>
                      {review.whyBestWorked && <p className="text-xs text-zinc-400">Why: {review.whyBestWorked}</p>}
                    </div>
                  )}
                  {review.worstTradeDescription && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500">Worst Trade</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{review.worstTradeDescription}</p>
                      {review.whyWorstFailed && <p className="text-xs text-zinc-400">Why: {review.whyWorstFailed}</p>}
                    </div>
                  )}
                  {review.adjustmentNextWeek && (
                    <div className="md:col-span-2 space-y-2 pt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Adjustment for Next Week</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{review.adjustmentNextWeek}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!hasReview && !hasFundamental && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-12 text-center">
            <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">
              No data for this week yet
            </p>
            <Button asChild className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
              <Link href={`/weekly/${weekStart}/edit`}>Add Weekly Data</Link>
            </Button>
          </div>
        )}

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Weekly Data</DialogTitle>
              <DialogDescription>This will delete both the review and fundamental analysis for this week. This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to This Week</DialogTitle>
              <DialogDescription>
                What would you like to add for this week?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              {!hasFundamental && (
                <Button 
                  asChild 
                  className="w-full h-12 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowAddDialog(false)}
                >
                  <Link href={`/weekly/${weekStart}/edit?mode=fundamental`}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add Fundamental Analysis
                  </Link>
                </Button>
              )}
              {!hasReview && (
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full h-12 rounded-lg"
                  onClick={() => setShowAddDialog(false)}
                >
                  <Link href={`/weekly/${weekStart}/edit?mode=review`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Add Weekly Review
                  </Link>
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit This Week</DialogTitle>
              <DialogDescription>
                What would you like to edit?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button 
                asChild 
                className="w-full h-12 rounded-lg bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setShowEditDialog(false)}
              >
                <Link href={`/weekly/${weekStart}/edit?mode=fundamental`}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Edit Fundamental Analysis
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="w-full h-12 rounded-lg"
                onClick={() => setShowEditDialog(false)}
              >
                <Link href={`/weekly/${weekStart}/edit?mode=review`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Edit Weekly Review
                </Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function Calendar(props: any) {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}