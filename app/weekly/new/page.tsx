"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const steps = [
  { id: "numbers", label: "Numbers", short: "Numbers" },
  { id: "compliance", label: "Compliance", short: "Compliance" },
  { id: "analysis", label: "Analysis", short: "Analysis" },
  { id: "action", label: "Action Items", short: "Action" },
];

export default function NewWeeklyReviewPage() {
  const router = useRouter();
  const createReview = useMutation(api.weeklyReviews.create);
  const trades = useQuery(api.trades.list);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const weekTrades = trades?.filter((t) => {
    const tradeDate = new Date(t.createdAt).toISOString().split("T")[0];
    return tradeDate >= weekStartStr && tradeDate <= weekEndStr;
  }) || [];

  const autoStats = {
    totalTrades: weekTrades.length,
    winningTrades: weekTrades.filter((t) => t.winLossStatus === "WIN").length,
    losingTrades: weekTrades.filter((t) => t.winLossStatus === "LOSS").length,
    totalPnl: weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
    biggestWin: Math.max(0, ...weekTrades.filter((t) => t.winLossStatus === "WIN").map((t) => t.pnl || 0)),
    biggestLoss: Math.min(0, ...weekTrades.filter((t) => t.winLossStatus === "LOSS").map((t) => t.pnl || 0)),
    avgWin: weekTrades.filter((t) => t.winLossStatus === "WIN").length > 0
      ? weekTrades.filter((t) => t.winLossStatus === "WIN").reduce((sum, t) => sum + (t.pnl || 0), 0) / weekTrades.filter((t) => t.winLossStatus === "WIN").length
      : 0,
    avgLoss: weekTrades.filter((t) => t.winLossStatus === "LOSS").length > 0
      ? Math.abs(weekTrades.filter((t) => t.winLossStatus === "LOSS").reduce((sum, t) => sum + (t.pnl || 0), 0) / weekTrades.filter((t) => t.winLossStatus === "LOSS").length)
      : 0,
  };

  const profitFactor = autoStats.avgLoss > 0 ? autoStats.avgWin / autoStats.avgLoss : 0;

  const [activeStep, setActiveStep] = useState("numbers");
  const [formData, setFormData] = useState({
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    totalTrades: String(autoStats.totalTrades),
    winningTrades: String(autoStats.winningTrades),
    losingTrades: String(autoStats.losingTrades),
    totalPnl: String(autoStats.totalPnl.toFixed(2)),
    biggestWin: String(autoStats.biggestWin.toFixed(2)),
    biggestLoss: String(autoStats.biggestLoss.toFixed(2)),
    avgWin: String(autoStats.avgWin.toFixed(2)),
    avgLoss: String(autoStats.avgLoss.toFixed(2)),
    profitFactor: String(profitFactor.toFixed(2)),
    inducementPercentage: "100",
    ltcPercentage: "100",
    killzonePercentage: "100",
    avgTrinityScore: "8",
    tradesAgainstHtf: "0",
    thoseLostMore: false,
    narrativeAbilityScore: "8",
    avgPoiQualityScore: "7",
    pristineCleanSetups: "0",
    questionableSetups: "0",
    lossesOnLowQuality: false,
    inducementRecognitionScore: "7",
    prematureEntries: "0",
    prematureEntryCost: "0",
    forcedTrades: "0",
    waitedTrades: String(autoStats.totalTrades),
    forcedTradesLostMore: false,
    patienceScore: "8",
    skippedObviousSetups: false,
    bestTradeDescription: "",
    whyBestWorked: "",
    worstTradeDescription: "",
    whyWorstFailed: "",
    biggestLessonMarket: "",
    biggestLessonSelf: "",
    adjustmentNextWeek: "",
    poiIdentificationScore: "7",
    inducementRecognitionScore2: "7",
    entryExecutionScore: "7",
    riskManagementScore: "7",
    overallSetupQualityScore: "7",
    topPriorityImprovement: "",
    specificActionToImprove: "",
    successMetric: "",
    confidenceNextWeek: "8",
    howFeeling: "",
    emotionsAffectedTrading: false,
    readinessScore: "8",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview({
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
        totalTrades: Number(formData.totalTrades),
        winningTrades: Number(formData.winningTrades),
        losingTrades: Number(formData.losingTrades),
        totalPnl: Number(formData.totalPnl),
        biggestWin: Number(formData.biggestWin),
        biggestLoss: Number(formData.biggestLoss),
        avgWin: Number(formData.avgWin),
        avgLoss: Number(formData.avgLoss),
        profitFactor: Number(formData.profitFactor),
        inducementPercentage: Number(formData.inducementPercentage),
        ltcPercentage: Number(formData.ltcPercentage),
        killzonePercentage: Number(formData.killzonePercentage),
        avgTrinityScore: Number(formData.avgTrinityScore),
        tradesAgainstHtf: Number(formData.tradesAgainstHtf),
        thoseLostMore: formData.thoseLostMore,
        narrativeAbilityScore: Number(formData.narrativeAbilityScore),
        avgPoiQualityScore: Number(formData.avgPoiQualityScore),
        pristineCleanSetups: Number(formData.pristineCleanSetups),
        questionableSetups: Number(formData.questionableSetups),
        lossesOnLowQuality: formData.lossesOnLowQuality,
        inducementRecognitionScore: Number(formData.inducementRecognitionScore),
        prematureEntries: Number(formData.prematureEntries),
        prematureEntryCost: Number(formData.prematureEntryCost),
        forcedTrades: Number(formData.forcedTrades),
        waitedTrades: Number(formData.waitedTrades),
        forcedTradesLostMore: formData.forcedTradesLostMore,
        patienceScore: Number(formData.patienceScore),
        skippedObviousSetups: formData.skippedObviousSetups,
        bestTradeDescription: formData.bestTradeDescription || undefined,
        whyBestWorked: formData.whyBestWorked || undefined,
        worstTradeDescription: formData.worstTradeDescription || undefined,
        whyWorstFailed: formData.whyWorstFailed || undefined,
        biggestLessonMarket: formData.biggestLessonMarket || undefined,
        biggestLessonSelf: formData.biggestLessonSelf || undefined,
        adjustmentNextWeek: formData.adjustmentNextWeek || undefined,
        poiIdentificationScore: Number(formData.poiIdentificationScore),
        inducementRecognitionScore2: Number(formData.inducementRecognitionScore2),
        entryExecutionScore: Number(formData.entryExecutionScore),
        riskManagementScore: Number(formData.riskManagementScore),
        overallSetupQualityScore: Number(formData.overallSetupQualityScore),
        topPriorityImprovement: formData.topPriorityImprovement,
        specificActionToImprove: formData.specificActionToImprove,
        successMetric: formData.successMetric,
        confidenceNextWeek: Number(formData.confidenceNextWeek),
        howFeeling: formData.howFeeling || undefined,
        emotionsAffectedTrading: formData.emotionsAffectedTrading || undefined,
        readinessScore: Number(formData.readinessScore),
      });
      toast.success("Weekly review saved!");
      router.push("/weekly");
    } catch (error) {
      toast.error("Failed to save weekly review");
    }
  };

  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/weekly">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Weekly Review</h1>
          <p className="text-sm text-muted-foreground">
            Week of {new Date(weekStartStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(weekEndStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        <nav className="hidden lg:flex flex-col gap-1 w-48 shrink-0">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                activeStep === step.id
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                activeStep === step.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
              }`}>
                {index + 1}
              </span>
              {step.short}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeStep === step.id
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {index + 1}. {step.short}
                </button>
              ))}
            </div>

            {activeStep === "numbers" && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Numbers</CardTitle>
                  <CardDescription>Auto-calculated from your trades this week</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total Trades</Label>
                    <Input type="number" value={formData.totalTrades} onChange={(e) => update("totalTrades", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Total P&L ($)</Label>
                    <Input type="number" step="0.01" value={formData.totalPnl} onChange={(e) => update("totalPnl", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Winning Trades</Label>
                    <Input type="number" value={formData.winningTrades} onChange={(e) => update("winningTrades", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Losing Trades</Label>
                    <Input type="number" value={formData.losingTrades} onChange={(e) => update("losingTrades", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Biggest Win ($)</Label>
                    <Input type="number" step="0.01" value={formData.biggestWin} onChange={(e) => update("biggestWin", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Biggest Loss ($)</Label>
                    <Input type="number" step="0.01" value={formData.biggestLoss} onChange={(e) => update("biggestLoss", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Win ($)</Label>
                    <Input type="number" step="0.01" value={formData.avgWin} onChange={(e) => update("avgWin", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Avg Loss ($)</Label>
                    <Input type="number" step="0.01" value={formData.avgLoss} onChange={(e) => update("avgLoss", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeStep === "compliance" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trinity Compliance</CardTitle>
                    <CardDescription>How well did you follow the WWA Trinity?</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Clear Inducement %</Label>
                      <Input type="number" min="0" max="100" value={formData.inducementPercentage} onChange={(e) => update("inducementPercentage", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>LTC Confirmation %</Label>
                      <Input type="number" min="0" max="100" value={formData.ltcPercentage} onChange={(e) => update("ltcPercentage", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>In Killzone %</Label>
                      <Input type="number" min="0" max="100" value={formData.killzonePercentage} onChange={(e) => update("killzonePercentage", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Avg Trinity Score (1-10)</Label>
                      <Input type="number" min="1" max="10" value={formData.avgTrinityScore} onChange={(e) => update("avgTrinityScore", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>POI Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Avg POI Score (1-10)</Label>
                      <Input type="number" min="1" max="10" value={formData.avgPoiQualityScore} onChange={(e) => update("avgPoiQualityScore", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Pristine/Clean Setups</Label>
                      <Input type="number" value={formData.pristineCleanSetups} onChange={(e) => update("pristineCleanSetups", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Questionable Setups</Label>
                      <Input type="number" value={formData.questionableSetups} onChange={(e) => update("questionableSetups", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Patience Score (1-10)</Label>
                      <Input type="number" min="1" max="10" value={formData.patienceScore} onChange={(e) => update("patienceScore", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Forced Trades</Label>
                      <Input type="number" value={formData.forcedTrades} onChange={(e) => update("forcedTrades", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Waited Trades</Label>
                      <Input type="number" value={formData.waitedTrades} onChange={(e) => update("waitedTrades", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeStep === "analysis" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Best Trade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={formData.bestTradeDescription} onChange={(e) => update("bestTradeDescription", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Why it worked</Label>
                      <Textarea value={formData.whyBestWorked} onChange={(e) => update("whyBestWorked", e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Worst Trade</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={formData.worstTradeDescription} onChange={(e) => update("worstTradeDescription", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Why it failed</Label>
                      <Textarea value={formData.whyWorstFailed} onChange={(e) => update("whyWorstFailed", e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lessons & Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Biggest lesson about the market</Label>
                      <Textarea value={formData.biggestLessonMarket} onChange={(e) => update("biggestLessonMarket", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Biggest lesson about yourself</Label>
                      <Textarea value={formData.biggestLessonSelf} onChange={(e) => update("biggestLessonSelf", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Adjustment for next week</Label>
                      <Textarea value={formData.adjustmentNextWeek} onChange={(e) => update("adjustmentNextWeek", e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Setup Quality Scores (1-10)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-5">
                    <div className="space-y-2">
                      <Label>POI ID</Label>
                      <Input type="number" min="1" max="10" value={formData.poiIdentificationScore} onChange={(e) => update("poiIdentificationScore", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Inducement</Label>
                      <Input type="number" min="1" max="10" value={formData.inducementRecognitionScore2} onChange={(e) => update("inducementRecognitionScore2", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Entry</Label>
                      <Input type="number" min="1" max="10" value={formData.entryExecutionScore} onChange={(e) => update("entryExecutionScore", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Risk Mgmt</Label>
                      <Input type="number" min="1" max="10" value={formData.riskManagementScore} onChange={(e) => update("riskManagementScore", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Overall</Label>
                      <Input type="number" min="1" max="10" value={formData.overallSetupQualityScore} onChange={(e) => update("overallSetupQualityScore", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeStep === "action" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Action Items</CardTitle>
                    <CardDescription>Focus areas for next week</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Top Priority</Label>
                      <Input value={formData.topPriorityImprovement} onChange={(e) => update("topPriorityImprovement", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Specific Action</Label>
                      <Textarea value={formData.specificActionToImprove} onChange={(e) => update("specificActionToImprove", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Success Metric</Label>
                      <Input value={formData.successMetric} onChange={(e) => update("successMetric", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Confidence for Next Week (1-10)</Label>
                      <Input type="number" min="1" max="10" value={formData.confidenceNextWeek} onChange={(e) => update("confidenceNextWeek", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mental & Emotional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>How are you feeling?</Label>
                      <Input value={formData.howFeeling} onChange={(e) => update("howFeeling", e.target.value)} placeholder="disciplined / frustrated / calm" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="emotionsAffectedTrading" checked={formData.emotionsAffectedTrading} onCheckedChange={(checked) => update("emotionsAffectedTrading", !!checked)} />
                      <Label htmlFor="emotionsAffectedTrading">Emotions affected trading</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Readiness Score (1-10)</Label>
                      <Input type="number" min="1" max="10" value={formData.readinessScore} onChange={(e) => update("readinessScore", e.target.value)} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div>
                {canGoBack && (
                  <Button type="button" variant="outline" onClick={() => setActiveStep(steps[currentStepIndex - 1].id)}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href="/weekly">Cancel</Link>
                </Button>
                {canGoForward ? (
                  <Button type="button" onClick={() => setActiveStep(steps[currentStepIndex + 1].id)}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Review
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
