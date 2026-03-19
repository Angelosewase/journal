"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const steps = [
  { id: "numbers", label: "Numbers", short: "Numbers" },
  { id: "compliance", label: "Compliance", short: "Compliance" },
  { id: "analysis", label: "Analysis", short: "Analysis" },
  { id: "action", label: "Action Items", short: "Action" },
];

export default function EditWeeklyReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as Id<"weeklyReviews">;
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const review = weeklyReviews?.find((r) => r._id === reviewId);
  const updateReview = useMutation(api.weeklyReviews.update);

  const [activeStep, setActiveStep] = useState("numbers");
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (review) {
      setFormData({
        weekStart: review.weekStart,
        weekEnd: review.weekEnd,
        totalTrades: String(review.totalTrades),
        winningTrades: String(review.winningTrades),
        losingTrades: String(review.losingTrades),
        totalPnl: String(review.totalPnl),
        biggestWin: String(review.biggestWin),
        biggestLoss: String(review.biggestLoss),
        avgWin: String(review.avgWin),
        avgLoss: String(review.avgLoss),
        profitFactor: String(review.profitFactor),
        inducementPercentage: String(review.inducementPercentage),
        ltcPercentage: String(review.ltcPercentage),
        killzonePercentage: String(review.killzonePercentage),
        avgTrinityScore: String(review.avgTrinityScore),
        tradesAgainstHtf: String(review.tradesAgainstHtf),
        thoseLostMore: review.thoseLostMore,
        narrativeAbilityScore: String(review.narrativeAbilityScore),
        avgPoiQualityScore: String(review.avgPoiQualityScore),
        pristineCleanSetups: String(review.pristineCleanSetups),
        questionableSetups: String(review.questionableSetups),
        lossesOnLowQuality: review.lossesOnLowQuality,
        inducementRecognitionScore: String(review.inducementRecognitionScore),
        prematureEntries: String(review.prematureEntries),
        prematureEntryCost: String(review.prematureEntryCost),
        forcedTrades: String(review.forcedTrades),
        waitedTrades: String(review.waitedTrades),
        forcedTradesLostMore: review.forcedTradesLostMore,
        patienceScore: String(review.patienceScore),
        skippedObviousSetups: review.skippedObviousSetups,
        bestTradeDescription: review.bestTradeDescription || "",
        whyBestWorked: review.whyBestWorked || "",
        worstTradeDescription: review.worstTradeDescription || "",
        whyWorstFailed: review.whyWorstFailed || "",
        biggestLessonMarket: review.biggestLessonMarket || "",
        biggestLessonSelf: review.biggestLessonSelf || "",
        adjustmentNextWeek: review.adjustmentNextWeek || "",
        poiIdentificationScore: String(review.poiIdentificationScore),
        inducementRecognitionScore2: String(review.inducementRecognitionScore2),
        entryExecutionScore: String(review.entryExecutionScore),
        riskManagementScore: String(review.riskManagementScore),
        overallSetupQualityScore: String(review.overallSetupQualityScore),
        topPriorityImprovement: review.topPriorityImprovement || "",
        specificActionToImprove: review.specificActionToImprove || "",
        successMetric: review.successMetric || "",
        confidenceNextWeek: String(review.confidenceNextWeek),
        howFeeling: review.howFeeling || "",
        emotionsAffectedTrading: review.emotionsAffectedTrading || false,
        readinessScore: String(review.readinessScore),
      });
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateReview({
        id: reviewId,
        updates: {
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
        },
      });
      toast.success("Weekly review updated!");
      router.push(`/weekly/${reviewId}`);
    } catch (error) {
      toast.error("Failed to update weekly review");
    }
  };

  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  if (!review || Object.keys(formData).length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading review...</p>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/weekly/${reviewId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Weekly Review</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(review.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(review.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                    <CardTitle>POI Quality & Patience</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Avg POI Score (1-10)</Label>
                      <Input type="number" min="1" max="10" value={formData.avgPoiQualityScore} onChange={(e) => update("avgPoiQualityScore", e.target.value)} />
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
                    <CardTitle>Lessons & Setup Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Biggest lesson - market</Label>
                      <Textarea value={formData.biggestLessonMarket} onChange={(e) => update("biggestLessonMarket", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Biggest lesson - yourself</Label>
                      <Textarea value={formData.biggestLessonSelf} onChange={(e) => update("biggestLessonSelf", e.target.value)} rows={2} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="space-y-2"><Label>POI ID (1-10)</Label><Input type="number" min="1" max="10" value={formData.poiIdentificationScore} onChange={(e) => update("poiIdentificationScore", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Inducement (1-10)</Label><Input type="number" min="1" max="10" value={formData.inducementRecognitionScore2} onChange={(e) => update("inducementRecognitionScore2", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Entry (1-10)</Label><Input type="number" min="1" max="10" value={formData.entryExecutionScore} onChange={(e) => update("entryExecutionScore", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Risk (1-10)</Label><Input type="number" min="1" max="10" value={formData.riskManagementScore} onChange={(e) => update("riskManagementScore", e.target.value)} /></div>
                      <div className="space-y-2"><Label>Overall (1-10)</Label><Input type="number" min="1" max="10" value={formData.overallSetupQualityScore} onChange={(e) => update("overallSetupQualityScore", e.target.value)} /></div>
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
                      <Input value={formData.howFeeling} onChange={(e) => update("howFeeling", e.target.value)} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="emotionsAffected" checked={formData.emotionsAffectedTrading} onCheckedChange={(checked) => update("emotionsAffectedTrading", !!checked)} />
                      <Label htmlFor="emotionsAffected">Emotions affected trading</Label>
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
                  <Link href={`/weekly/${reviewId}`}>Cancel</Link>
                </Button>
                {canGoForward ? (
                  <Button type="button" onClick={() => setActiveStep(steps[currentStepIndex + 1].id)}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Update Review
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
