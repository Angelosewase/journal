"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const reviewSteps = [
  { id: "numbers", label: "Numbers", short: "Numbers" },
  { id: "compliance", label: "Compliance", short: "Compliance" },
  { id: "narrative", label: "Narrative", short: "Narrative" },
  { id: "quality", label: "Quality", short: "Quality" },
  { id: "patience", label: "Patience", short: "Patience" },
  { id: "scores", label: "Scores", short: "Scores" },
  { id: "analysis", label: "Analysis", short: "Analysis" },
  { id: "action", label: "Action Items", short: "Action" },
];

const fundamentalSteps = [
  { id: "macro", label: "Macro Overview", short: "Macro" },
  { id: "events", label: "Key Events", short: "Events" },
  { id: "bias", label: "Currency Bias", short: "Bias" },
  { id: "trades", label: "Trade Ideas", short: "Trades" },
  { id: "review", label: "End of Week", short: "Review" },
];

const biasOptions = [
  { value: "BULLISH", label: "Bullish" },
  { value: "BEARISH", label: "Bearish" },
  { value: "NEUTRAL", label: "Neutral" },
];

function EditPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const weekStart = params.id as string;
  const mode = searchParams.get("mode") || "fundamental";
  const isReview = mode === "review";
  
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const weeklyFundamentals = useQuery(api.weeklyFundamentalAnalysis.list);
  const createReview = useMutation(api.weeklyReviews.create);
  const updateReview = useMutation(api.weeklyReviews.update);
  const createFundamental = useMutation(api.weeklyFundamentalAnalysis.create);
  const updateFundamental = useMutation(api.weeklyFundamentalAnalysis.update);

  const existingReview = useMemo(() => weeklyReviews?.find(r => r.weekStart === weekStart), [weeklyReviews, weekStart]);
  const existingFundamental = useMemo(() => weeklyFundamentals?.find(f => f.weekStart === weekStart), [weeklyFundamentals, weekStart]);

  const steps = isReview ? reviewSteps : fundamentalSteps;
  const [activeStep, setActiveStep] = useState(steps[0].id);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isReview && existingReview) {
      setFormData({
        weekStart: existingReview.weekStart,
        weekEnd: existingReview.weekEnd,
        totalTrades: String(existingReview.totalTrades),
        winningTrades: String(existingReview.winningTrades),
        losingTrades: String(existingReview.losingTrades),
        totalPnl: String(existingReview.totalPnl),
        biggestWin: String(existingReview.biggestWin),
        biggestLoss: String(existingReview.biggestLoss),
        avgWin: String(existingReview.avgWin),
        avgLoss: String(existingReview.avgLoss),
        profitFactor: String(existingReview.profitFactor),
        inducementPercentage: String(existingReview.inducementPercentage),
        ltcPercentage: String(existingReview.ltcPercentage),
        killzonePercentage: String(existingReview.killzonePercentage),
        avgTrinityScore: String(existingReview.avgTrinityScore),
        tradesAgainstHtf: String(existingReview.tradesAgainstHtf),
        thoseLostMore: existingReview.thoseLostMore,
        narrativeAbilityScore: String(existingReview.narrativeAbilityScore),
        avgPoiQualityScore: String(existingReview.avgPoiQualityScore),
        pristineCleanSetups: String(existingReview.pristineCleanSetups),
        questionableSetups: String(existingReview.questionableSetups),
        lossesOnLowQuality: existingReview.lossesOnLowQuality,
        inducementRecognitionScore: String(existingReview.inducementRecognitionScore),
        prematureEntries: String(existingReview.prematureEntries),
        prematureEntryCost: String(existingReview.prematureEntryCost),
        forcedTrades: String(existingReview.forcedTrades),
        waitedTrades: String(existingReview.waitedTrades),
        forcedTradesLostMore: existingReview.forcedTradesLostMore,
        patienceScore: String(existingReview.patienceScore),
        skippedObviousSetups: existingReview.skippedObviousSetups,
        howFeeling: existingReview.howFeeling || "",
        emotionsAffectedTrading: existingReview.emotionsAffectedTrading || false,
        readinessScore: String(existingReview.readinessScore),
        bestTradeDescription: existingReview.bestTradeDescription || "",
        whyBestWorked: existingReview.whyBestWorked || "",
        patternToLookFor: existingReview.patternToLookFor || "",
        patternConfidence: existingReview.patternConfidence != null ? String(existingReview.patternConfidence) : "",
        worstTradeDescription: existingReview.worstTradeDescription || "",
        whyWorstFailed: existingReview.whyWorstFailed || "",
        howToAvoidNextWeek: existingReview.howToAvoidNextWeek || "",
        biggestLessonMarket: existingReview.biggestLessonMarket || "",
        biggestLessonSelf: existingReview.biggestLessonSelf || "",
        adjustmentNextWeek: existingReview.adjustmentNextWeek || "",
        poiIdentificationScore: String(existingReview.poiIdentificationScore),
        inducementRecognitionScore2: String(existingReview.inducementRecognitionScore2),
        entryExecutionScore: String(existingReview.entryExecutionScore),
        riskManagementScore: String(existingReview.riskManagementScore),
        overallSetupQualityScore: String(existingReview.overallSetupQualityScore),
        topPriorityImprovement: existingReview.topPriorityImprovement || "",
        specificActionToImprove: existingReview.specificActionToImprove || "",
        successMetric: existingReview.successMetric || "",
        confidenceNextWeek: String(existingReview.confidenceNextWeek),
      });
    } else if (!isReview && existingFundamental) {
      setFormData({
        weekStart: existingFundamental.weekStart,
        weekEnd: existingFundamental.weekEnd,
        overallRiskSentiment: existingFundamental.overallRiskSentiment,
        riskSentimentDirection: existingFundamental.riskSentimentDirection,
        dxyWeeklyBias: existingFundamental.dxyWeeklyBias,
        dxyDirection: existingFundamental.dxyDirection,
        us10yrYield: existingFundamental.us10yrYield ? String(existingFundamental.us10yrYield) : "",
        us10yrDirection: existingFundamental.us10yrDirection,
        vixLevel: existingFundamental.vixLevel ? String(existingFundamental.vixLevel) : "",
        vixDirection: existingFundamental.vixDirection,
        goldDirection: existingFundamental.goldDirection,
        wtiOil: existingFundamental.wtiOil ? String(existingFundamental.wtiOil) : "",
        wtiDirection: existingFundamental.wtiDirection,
        mondayEvents: existingFundamental.mondayEvents || "",
        tuesdayEvents: existingFundamental.tuesdayEvents || "",
        wednesdayEvents: existingFundamental.wednesdayEvents || "",
        thursdayEvents: existingFundamental.thursdayEvents || "",
        fridayEvents: existingFundamental.fridayEvents || "",
        highestImpactEvent: existingFundamental.highestImpactEvent || "",
        expectedMarketReaction: existingFundamental.expectedMarketReaction || "",
        usdBias: existingFundamental.usdBias,
        usdReason: existingFundamental.usdReason || "",
        eurBias: existingFundamental.eurBias,
        eurReason: existingFundamental.eurReason || "",
        gbpBias: existingFundamental.gbpBias,
        gbpReason: existingFundamental.gbpReason || "",
        jpyBias: existingFundamental.jpyBias,
        jpyReason: existingFundamental.jpyReason || "",
        cadBias: existingFundamental.cadBias,
        cadReason: existingFundamental.cadReason || "",
        audBias: existingFundamental.audBias,
        audReason: existingFundamental.audReason || "",
        chfBias: existingFundamental.chfBias,
        chfReason: existingFundamental.chfReason || "",
        nzdBias: existingFundamental.nzdBias,
        nzdReason: existingFundamental.nzdReason || "",
        trade1Pair: existingFundamental.trade1Pair || "",
        trade1Direction: existingFundamental.trade1Direction || "",
        trade1Reason: existingFundamental.trade1Reason || "",
        trade1KeyLevel: existingFundamental.trade1KeyLevel || "",
        trade1Invalidation: existingFundamental.trade1Invalidation || "",
        trade2Pair: existingFundamental.trade2Pair || "",
        trade2Direction: existingFundamental.trade2Direction || "",
        trade2Reason: existingFundamental.trade2Reason || "",
        trade2KeyLevel: existingFundamental.trade2KeyLevel || "",
        trade2Invalidation: existingFundamental.trade2Invalidation || "",
        activeRisks: existingFundamental.activeRisks || "",
        potentialShockEvents: existingFundamental.potentialShockEvents || "",
        safeHavenBias: existingFundamental.safeHavenBias || "",
        confirmationOfBias: existingFundamental.confirmationOfBias || "",
        surprisingData: existingFundamental.surprisingData || "",
        missedAnalysis: existingFundamental.missedAnalysis || "",
        adjustmentsNextWeek: existingFundamental.adjustmentsNextWeek || "",
      });
    } else {
      const today = new Date();
      const ws = new Date(today);
      ws.setDate(today.getDate() - today.getDay());
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);
      
      setFormData({
        weekStart: ws.toISOString().split("T")[0],
        weekEnd: we.toISOString().split("T")[0],
        ...getDefaultFormData(isReview)
      });
    }
  }, [existingReview, existingFundamental, isReview, weekStart]);

  const getDefaultFormData = (isR: boolean) => {
    if (isR) {
      return {
        totalTrades: "0", winningTrades: "0", losingTrades: "0", totalPnl: "0",
        biggestWin: "0", biggestLoss: "0", avgWin: "0", avgLoss: "0", profitFactor: "0",
        inducementPercentage: "100", ltcPercentage: "100", killzonePercentage: "100",
        avgTrinityScore: "8", tradesAgainstHtf: "0", thoseLostMore: false, narrativeAbilityScore: "8",
        avgPoiQualityScore: "7", pristineCleanSetups: "0", questionableSetups: "0", lossesOnLowQuality: false,
        inducementRecognitionScore: "7", prematureEntries: "0", prematureEntryCost: "0",
        forcedTrades: "0", waitedTrades: "0", forcedTradesLostMore: false, patienceScore: "8",
        skippedObviousSetups: false, howFeeling: "", emotionsAffectedTrading: false, readinessScore: "8",
        confidenceNextWeek: "8", topPriorityImprovement: "", specificActionToImprove: "", successMetric: "",
        poiIdentificationScore: "7", inducementRecognitionScore2: "7", entryExecutionScore: "7", riskManagementScore: "7", overallSetupQualityScore: "7",
      };
    }
    return {
      overallRiskSentiment: "NEUTRAL", riskSentimentDirection: "SIDEWAYS", dxyWeeklyBias: "NEUTRAL",
      dxyDirection: "SIDEWAYS", us10yrYield: "", us10yrDirection: "SIDEWAYS", vixLevel: "",
      vixDirection: "BELOW_20", goldDirection: "FLAT", wtiOil: "", wtiDirection: "UP",
      usdBias: "NEUTRAL", usdReason: "", eurBias: "NEUTRAL", eurReason: "", gbpBias: "NEUTRAL",
      gbpReason: "", jpyBias: "NEUTRAL", jpyReason: "", cadBias: "NEUTRAL", cadReason: "",
      audBias: "NEUTRAL", audReason: "", chfBias: "NEUTRAL", chfReason: "", nzdBias: "NEUTRAL", nzdReason: "",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isReview) {
        if (existingReview) {
          await updateReview({
            id: existingReview._id,
            updates: {
              weekStart: formData.weekStart, weekEnd: formData.weekEnd,
              totalTrades: Number(formData.totalTrades), winningTrades: Number(formData.winningTrades),
              losingTrades: Number(formData.losingTrades), totalPnl: Number(formData.totalPnl),
              biggestWin: Number(formData.biggestWin), biggestLoss: Number(formData.biggestLoss),
              avgWin: Number(formData.avgWin), avgLoss: Number(formData.avgLoss),
              profitFactor: Number(formData.profitFactor),
              inducementPercentage: Number(formData.inducementPercentage),
              ltcPercentage: Number(formData.ltcPercentage), killzonePercentage: Number(formData.killzonePercentage),
              avgTrinityScore: Number(formData.avgTrinityScore), tradesAgainstHtf: Number(formData.tradesAgainstHtf),
              thoseLostMore: formData.thoseLostMore, narrativeAbilityScore: Number(formData.narrativeAbilityScore),
              avgPoiQualityScore: Number(formData.avgPoiQualityScore),
              pristineCleanSetups: Number(formData.pristineCleanSetups),
              questionableSetups: Number(formData.questionableSetups), lossesOnLowQuality: formData.lossesOnLowQuality,
              inducementRecognitionScore: Number(formData.inducementRecognitionScore),
              prematureEntries: Number(formData.prematureEntries), prematureEntryCost: Number(formData.prematureEntryCost),
              forcedTrades: Number(formData.forcedTrades), waitedTrades: Number(formData.waitedTrades),
              forcedTradesLostMore: formData.forcedTradesLostMore, patienceScore: Number(formData.patienceScore),
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
          toast.success("Weekly review saved!");
        } else {
          await createReview({
            weekStart: formData.weekStart, weekEnd: formData.weekEnd,
            totalTrades: Number(formData.totalTrades), winningTrades: Number(formData.winningTrades),
            losingTrades: Number(formData.losingTrades), totalPnl: Number(formData.totalPnl),
            biggestWin: Number(formData.biggestWin), biggestLoss: Number(formData.biggestLoss),
            avgWin: Number(formData.avgWin), avgLoss: Number(formData.avgLoss),
            profitFactor: Number(formData.profitFactor),
            inducementPercentage: Number(formData.inducementPercentage),
            ltcPercentage: Number(formData.ltcPercentage), killzonePercentage: Number(formData.killzonePercentage),
            avgTrinityScore: Number(formData.avgTrinityScore), tradesAgainstHtf: Number(formData.tradesAgainstHtf),
            thoseLostMore: formData.thoseLostMore, narrativeAbilityScore: Number(formData.narrativeAbilityScore),
            avgPoiQualityScore: Number(formData.avgPoiQualityScore),
            pristineCleanSetups: Number(formData.pristineCleanSetups),
            questionableSetups: Number(formData.questionableSetups), lossesOnLowQuality: formData.lossesOnLowQuality,
            inducementRecognitionScore: Number(formData.inducementRecognitionScore),
            prematureEntries: Number(formData.prematureEntries), prematureEntryCost: Number(formData.prematureEntryCost),
            forcedTrades: Number(formData.forcedTrades), waitedTrades: Number(formData.waitedTrades),
            forcedTradesLostMore: formData.forcedTradesLostMore, patienceScore: Number(formData.patienceScore),
            skippedObviousSetups: formData.skippedObviousSetups,
            poiIdentificationScore: Number(formData.poiIdentificationScore),
            inducementRecognitionScore2: Number(formData.inducementRecognitionScore2),
            entryExecutionScore: Number(formData.entryExecutionScore),
            riskManagementScore: Number(formData.riskManagementScore),
            overallSetupQualityScore: Number(formData.overallSetupQualityScore),
            topPriorityImprovement: formData.topPriorityImprovement || "Test",
            specificActionToImprove: formData.specificActionToImprove || "Test",
            successMetric: formData.successMetric || "Test",
            confidenceNextWeek: Number(formData.confidenceNextWeek),
            readinessScore: Number(formData.readinessScore),
          });
          toast.success("Weekly review created!");
        }
      } else {
        if (existingFundamental) {
          await updateFundamental({
            id: existingFundamental._id,
            updates: {
              overallRiskSentiment: formData.overallRiskSentiment,
              riskSentimentDirection: formData.riskSentimentDirection,
              dxyWeeklyBias: formData.dxyWeeklyBias,
              dxyDirection: formData.dxyDirection,
              us10yrYield: formData.us10yrYield ? Number(formData.us10yrYield) : undefined,
              us10yrDirection: formData.us10yrDirection,
              vixLevel: formData.vixLevel ? Number(formData.vixLevel) : undefined,
              vixDirection: formData.vixDirection,
              goldDirection: formData.goldDirection,
              wtiOil: formData.wtiOil ? Number(formData.wtiOil) : undefined,
              wtiDirection: formData.wtiDirection,
              mondayEvents: formData.mondayEvents || undefined,
              tuesdayEvents: formData.tuesdayEvents || undefined,
              wednesdayEvents: formData.wednesdayEvents || undefined,
              thursdayEvents: formData.thursdayEvents || undefined,
              fridayEvents: formData.fridayEvents || undefined,
              highestImpactEvent: formData.highestImpactEvent || undefined,
              expectedMarketReaction: formData.expectedMarketReaction || undefined,
              usdBias: formData.usdBias,
              usdReason: formData.usdReason || undefined,
              eurBias: formData.eurBias,
              eurReason: formData.eurReason || undefined,
              gbpBias: formData.gbpBias,
              gbpReason: formData.gbpReason || undefined,
              jpyBias: formData.jpyBias,
              jpyReason: formData.jpyReason || undefined,
              cadBias: formData.cadBias,
              cadReason: formData.cadReason || undefined,
              audBias: formData.audBias,
              audReason: formData.audReason || undefined,
              chfBias: formData.chfBias,
              chfReason: formData.chfReason || undefined,
              nzdBias: formData.nzdBias,
              nzdReason: formData.nzdReason || undefined,
              trade1Pair: formData.trade1Pair || undefined,
              trade1Direction: formData.trade1Direction as "LONG" | "SHORT" | undefined,
              trade1Reason: formData.trade1Reason || undefined,
              trade1KeyLevel: formData.trade1KeyLevel || undefined,
              trade1Invalidation: formData.trade1Invalidation || undefined,
              trade2Pair: formData.trade2Pair || undefined,
              trade2Direction: formData.trade2Direction as "LONG" | "SHORT" | undefined,
              trade2Reason: formData.trade2Reason || undefined,
              trade2KeyLevel: formData.trade2KeyLevel || undefined,
              trade2Invalidation: formData.trade2Invalidation || undefined,
              activeRisks: formData.activeRisks || undefined,
              potentialShockEvents: formData.potentialShockEvents || undefined,
              safeHavenBias: formData.safeHavenBias || undefined,
              confirmationOfBias: formData.confirmationOfBias || undefined,
              surprisingData: formData.surprisingData || undefined,
              missedAnalysis: formData.missedAnalysis || undefined,
              adjustmentsNextWeek: formData.adjustmentsNextWeek || undefined,
            },
          });
          toast.success("Fundamental analysis saved!");
        } else {
          await createFundamental({
            weekStart: formData.weekStart, weekEnd: formData.weekEnd,
            overallRiskSentiment: formData.overallRiskSentiment,
            riskSentimentDirection: formData.riskSentimentDirection,
            dxyWeeklyBias: formData.dxyWeeklyBias,
            dxyDirection: formData.dxyDirection,
            us10yrYield: formData.us10yrYield ? Number(formData.us10yrYield) : undefined,
            us10yrDirection: formData.us10yrDirection,
            vixLevel: formData.vixLevel ? Number(formData.vixLevel) : undefined,
            vixDirection: formData.vixDirection,
            goldDirection: formData.goldDirection,
            wtiOil: formData.wtiOil ? Number(formData.wtiOil) : undefined,
            wtiDirection: formData.wtiDirection,
            usdBias: formData.usdBias,
            usdReason: formData.usdReason || undefined,
            eurBias: formData.eurBias,
            eurReason: formData.eurReason || undefined,
            gbpBias: formData.gbpBias,
            gbpReason: formData.gbpReason || undefined,
            jpyBias: formData.jpyBias,
            jpyReason: formData.jpyReason || undefined,
            cadBias: formData.cadBias,
            cadReason: formData.cadReason || undefined,
            audBias: formData.audBias,
            audReason: formData.audReason || undefined,
            chfBias: formData.chfBias,
            chfReason: formData.chfReason || undefined,
            nzdBias: formData.nzdBias,
            nzdReason: formData.nzdReason || undefined,
          });
          toast.success("Fundamental analysis created!");
        }
      }
      router.push(`/weekly/${weekStart}`);
    } catch {
      toast.error("Failed to save");
    }
  };

  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });
  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  if (!formData.weekStart) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>;
  }

  const weekEnd = formData.weekEnd || formData.weekStart;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/weekly/${weekStart}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isReview ? "Weekly Review" : "Fundamental Analysis"}
            </h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {new Date(formData.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button key={step.id} type="button" onClick={() => setActiveStep(step.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeStep === step.id ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}>
              {index + 1}. {step.short}
            </button>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isReview && activeStep === "numbers" && (
            <Card>
              <CardHeader><CardTitle>Weekly Numbers</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Total Trades</Label><Input type="number" value={formData.totalTrades || ""} onChange={(e) => update("totalTrades", e.target.value)} /></div>
                <div className="space-y-2"><Label>Total P&L ($)</Label><Input type="number" step="0.01" value={formData.totalPnl || ""} onChange={(e) => update("totalPnl", e.target.value)} /></div>
                <div className="space-y-2"><Label>Winning Trades</Label><Input type="number" value={formData.winningTrades || ""} onChange={(e) => update("winningTrades", e.target.value)} /></div>
                <div className="space-y-2"><Label>Losing Trades</Label><Input type="number" value={formData.losingTrades || ""} onChange={(e) => update("losingTrades", e.target.value)} /></div>
                <div className="space-y-2"><Label>Biggest Win ($)</Label><Input type="number" step="0.01" value={formData.biggestWin || ""} onChange={(e) => update("biggestWin", e.target.value)} /></div>
                <div className="space-y-2"><Label>Biggest Loss ($)</Label><Input type="number" step="0.01" value={formData.biggestLoss || ""} onChange={(e) => update("biggestLoss", e.target.value)} /></div>
                <div className="space-y-2"><Label>Avg Win ($)</Label><Input type="number" step="0.01" value={formData.avgWin || ""} onChange={(e) => update("avgWin", e.target.value)} /></div>
                <div className="space-y-2"><Label>Avg Loss ($)</Label><Input type="number" step="0.01" value={formData.avgLoss || ""} onChange={(e) => update("avgLoss", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "compliance" && (
            <Card>
              <CardHeader><CardTitle>Compliance</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Inducement %</Label><Input type="number" value={formData.inducementPercentage || ""} onChange={(e) => update("inducementPercentage", e.target.value)} /></div>
                <div className="space-y-2"><Label>LTC %</Label><Input type="number" value={formData.ltcPercentage || ""} onChange={(e) => update("ltcPercentage", e.target.value)} /></div>
                <div className="space-y-2"><Label>Killzone %</Label><Input type="number" value={formData.killzonePercentage || ""} onChange={(e) => update("killzonePercentage", e.target.value)} /></div>
                <div className="space-y-2"><Label>Trinity Score (1-10)</Label><Input type="number" value={formData.avgTrinityScore || ""} onChange={(e) => update("avgTrinityScore", e.target.value)} /></div>
                <div className="space-y-2"><Label>Profit Factor</Label><Input type="number" step="0.01" value={formData.profitFactor || ""} onChange={(e) => update("profitFactor", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "narrative" && (
            <Card>
              <CardHeader><CardTitle>Narrative Alignment</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Trades Against HTF</Label><Input type="number" value={formData.tradesAgainstHtf || ""} onChange={(e) => update("tradesAgainstHtf", e.target.value)} /></div>
                <div className="space-y-2"><Label>Narrative Ability Score (1-10)</Label><Input type="number" value={formData.narrativeAbilityScore || ""} onChange={(e) => update("narrativeAbilityScore", e.target.value)} /></div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="thoseLostMore" checked={formData.thoseLostMore || false} onChange={(e) => update("thoseLostMore", e.target.checked)} className="rounded" />
                    <Label htmlFor="thoseLostMore">Those trades lost more than winners?</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "quality" && (
            <Card>
              <CardHeader><CardTitle>POI Quality</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Avg POI Quality Score (1-10)</Label><Input type="number" value={formData.avgPoiQualityScore || ""} onChange={(e) => update("avgPoiQualityScore", e.target.value)} /></div>
                <div className="space-y-2"><Label>Pristine/Clean Setups</Label><Input type="number" value={formData.pristineCleanSetups || ""} onChange={(e) => update("pristineCleanSetups", e.target.value)} /></div>
                <div className="space-y-2"><Label>Questionable Setups</Label><Input type="number" value={formData.questionableSetups || ""} onChange={(e) => update("questionableSetups", e.target.value)} /></div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="lossesOnLowQuality" checked={formData.lossesOnLowQuality || false} onChange={(e) => update("lossesOnLowQuality", e.target.checked)} className="rounded" />
                    <Label htmlFor="lossesOnLowQuality">Losses on low quality setups?</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "patience" && (
            <Card>
              <CardHeader><CardTitle>Patience & Discipline</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Premature Entries</Label><Input type="number" value={formData.prematureEntries || ""} onChange={(e) => update("prematureEntries", e.target.value)} /></div>
                <div className="space-y-2"><Label>Premature Entry Cost ($)</Label><Input type="number" step="0.01" value={formData.prematureEntryCost || ""} onChange={(e) => update("prematureEntryCost", e.target.value)} /></div>
                <div className="space-y-2"><Label>Forced Trades</Label><Input type="number" value={formData.forcedTrades || ""} onChange={(e) => update("forcedTrades", e.target.value)} /></div>
                <div className="space-y-2"><Label>Waited Trades</Label><Input type="number" value={formData.waitedTrades || ""} onChange={(e) => update("waitedTrades", e.target.value)} /></div>
                <div className="space-y-2"><Label>Patience Score (1-10)</Label><Input type="number" value={formData.patienceScore || ""} onChange={(e) => update("patienceScore", e.target.value)} /></div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="forcedTradesLostMore" checked={formData.forcedTradesLostMore || false} onChange={(e) => update("forcedTradesLostMore", e.target.checked)} className="rounded" />
                    <Label htmlFor="forcedTradesLostMore">Forced trades lost more than waited?</Label>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="skippedObviousSetups" checked={formData.skippedObviousSetups || false} onChange={(e) => update("skippedObviousSetups", e.target.checked)} className="rounded" />
                    <Label htmlFor="skippedObviousSetups">Skipped obvious setups?</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "analysis" && (
            <Card>
              <CardHeader><CardTitle>Edge Assessment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Best Trade Description</Label><Textarea value={formData.bestTradeDescription || ""} onChange={(e) => update("bestTradeDescription", e.target.value)} /></div>
                <div className="space-y-2"><Label>Why it worked</Label><Textarea value={formData.whyBestWorked || ""} onChange={(e) => update("whyBestWorked", e.target.value)} /></div>
                <div className="space-y-2"><Label>Pattern to look for</Label><Input value={formData.patternToLookFor || ""} onChange={(e) => update("patternToLookFor", e.target.value)} /></div>
                <div className="space-y-2"><Label>Pattern Confidence (1-10)</Label><Input type="number" value={formData.patternConfidence || ""} onChange={(e) => update("patternConfidence", e.target.value)} /></div>
                <div className="space-y-2"><Label>Worst Trade Description</Label><Textarea value={formData.worstTradeDescription || ""} onChange={(e) => update("worstTradeDescription", e.target.value)} /></div>
                <div className="space-y-2"><Label>Why it failed</Label><Textarea value={formData.whyWorstFailed || ""} onChange={(e) => update("whyWorstFailed", e.target.value)} /></div>
                <div className="space-y-2"><Label>How to avoid next week</Label><Textarea value={formData.howToAvoidNextWeek || ""} onChange={(e) => update("howToAvoidNextWeek", e.target.value)} /></div>
                <div className="space-y-2"><Label>Biggest lesson - Market</Label><Textarea value={formData.biggestLessonMarket || ""} onChange={(e) => update("biggestLessonMarket", e.target.value)} /></div>
                <div className="space-y-2"><Label>Biggest lesson - Self</Label><Textarea value={formData.biggestLessonSelf || ""} onChange={(e) => update("biggestLessonSelf", e.target.value)} /></div>
                <div className="space-y-2"><Label>Adjustment for next week</Label><Textarea value={formData.adjustmentNextWeek || ""} onChange={(e) => update("adjustmentNextWeek", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "scores" && (
            <Card>
              <CardHeader><CardTitle>Setup Quality Scores</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>POI Identification (1-10)</Label><Input type="number" value={formData.poiIdentificationScore || ""} onChange={(e) => update("poiIdentificationScore", e.target.value)} /></div>
                <div className="space-y-2"><Label>Inducement Recognition (1-10)</Label><Input type="number" value={formData.inducementRecognitionScore2 || ""} onChange={(e) => update("inducementRecognitionScore2", e.target.value)} /></div>
                <div className="space-y-2"><Label>Entry Execution (1-10)</Label><Input type="number" value={formData.entryExecutionScore || ""} onChange={(e) => update("entryExecutionScore", e.target.value)} /></div>
                <div className="space-y-2"><Label>Risk Management (1-10)</Label><Input type="number" value={formData.riskManagementScore || ""} onChange={(e) => update("riskManagementScore", e.target.value)} /></div>
                <div className="space-y-2"><Label>Overall Setup Quality (1-10)</Label><Input type="number" value={formData.overallSetupQualityScore || ""} onChange={(e) => update("overallSetupQualityScore", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {isReview && activeStep === "action" && (
            <Card>
              <CardHeader><CardTitle>Action Items</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Top Priority</Label><Input value={formData.topPriorityImprovement || ""} onChange={(e) => update("topPriorityImprovement", e.target.value)} /></div>
                <div className="space-y-2"><Label>Specific Action</Label><Textarea value={formData.specificActionToImprove || ""} onChange={(e) => update("specificActionToImprove", e.target.value)} /></div>
                <div className="space-y-2"><Label>Confidence (1-10)</Label><Input type="number" value={formData.confidenceNextWeek || ""} onChange={(e) => update("confidenceNextWeek", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {!isReview && activeStep === "macro" && (
            <Card>
              <CardHeader><CardTitle>Macro Overview</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Risk Sentiment</Label>
                  <Select value={formData.overallRiskSentiment || "NEUTRAL"} onValueChange={(v) => update("overallRiskSentiment", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RISK_ON">Risk-On</SelectItem>
                      <SelectItem value="RISK_OFF">Risk-Off</SelectItem>
                      <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>DXY Bias</Label>
                  <Select value={formData.dxyWeeklyBias || "NEUTRAL"} onValueChange={(v) => update("dxyWeeklyBias", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{biasOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>10yr Yield %</Label><Input type="number" step="0.01" value={formData.us10yrYield || ""} onChange={(e) => update("us10yrYield", e.target.value)} /></div>
                <div className="space-y-2"><Label>VIX Level</Label><Input type="number" step="0.1" value={formData.vixLevel || ""} onChange={(e) => update("vixLevel", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {!isReview && activeStep === "events" && (
            <Card>
              <CardHeader><CardTitle>Key Events</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {["monday", "tuesday", "wednesday", "thursday", "friday"].map(day => (
                  <div key={day} className="space-y-2">
                    <Label className="uppercase text-xs font-semibold text-zinc-500">{day}</Label>
                    <Input value={(formData as any)[`${day}Events`] || ""} onChange={(e) => update(`${day}Events`, e.target.value)} />
                  </div>
                ))}
                <div className="space-y-2"><Label>Highest Impact Event</Label><Input value={formData.highestImpactEvent || ""} onChange={(e) => update("highestImpactEvent", e.target.value)} /></div>
                <div className="space-y-2"><Label>Expected Market Reaction</Label><Textarea value={formData.expectedMarketReaction || ""} onChange={(e) => update("expectedMarketReaction", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          {!isReview && activeStep === "bias" && (
            <Card>
              <CardHeader><CardTitle>Currency Bias</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "USD", bias: "usdBias", reason: "usdReason" },
                  { label: "EUR", bias: "eurBias", reason: "eurReason" },
                  { label: "GBP", bias: "gbpBias", reason: "gbpReason" },
                  { label: "JPY", bias: "jpyBias", reason: "jpyReason" },
                  { label: "CAD", bias: "cadBias", reason: "cadReason" },
                  { label: "AUD", bias: "audBias", reason: "audReason" },
                  { label: "CHF", bias: "chfBias", reason: "chfReason" },
                  { label: "NZD", bias: "nzdBias", reason: "nzdReason" },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{item.label}</Label>
                    <Select value={(formData as any)[item.bias] || "NEUTRAL"} onValueChange={(v) => update(item.bias, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{biasOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Reason" value={(formData as any)[item.reason] || ""} onChange={(e) => update(item.reason, e.target.value)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {!isReview && activeStep === "trades" && (
            <div className="space-y-6">
              {[1, 2].map(n => (
                <Card key={n}>
                  <CardHeader><CardTitle>Trade Idea {n}</CardTitle></CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Pair</Label><Input value={(formData as any)[`trade${n}Pair`] || ""} onChange={(e) => update(`trade${n}Pair`, e.target.value)} /></div>
                    <div className="space-y-2">
                      <Label>Direction</Label>
                      <Select value={(formData as any)[`trade${n}Direction`] || ""} onValueChange={(v) => update(`trade${n}Direction`, v)}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="LONG">Long</SelectItem><SelectItem value="SHORT">Short</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2"><Label>Reason</Label><Textarea value={(formData as any)[`trade${n}Reason`] || ""} onChange={(e) => update(`trade${n}Reason`, e.target.value)} /></div>
                    <div className="space-y-2"><Label>Key Level</Label><Input value={(formData as any)[`trade${n}KeyLevel`] || ""} onChange={(e) => update(`trade${n}KeyLevel`, e.target.value)} /></div>
                    <div className="space-y-2"><Label>Invalidation</Label><Input value={(formData as any)[`trade${n}Invalidation`] || ""} onChange={(e) => update(`trade${n}Invalidation`, e.target.value)} /></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isReview && activeStep === "review" && (
            <Card>
              <CardHeader><CardTitle>End of Week Review</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Did data confirm your bias?</Label><Textarea value={formData.confirmationOfBias || ""} onChange={(e) => update("confirmationOfBias", e.target.value)} /></div>
                <div className="space-y-2"><Label>Surprising data</Label><Textarea value={formData.surprisingData || ""} onChange={(e) => update("surprisingData", e.target.value)} /></div>
                <div className="space-y-2"><Label>What did you miss?</Label><Textarea value={formData.missedAnalysis || ""} onChange={(e) => update("missedAnalysis", e.target.value)} /></div>
                <div className="space-y-2"><Label>Adjustments</Label><Textarea value={formData.adjustmentsNextWeek || ""} onChange={(e) => update("adjustmentsNextWeek", e.target.value)} /></div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              {canGoBack && (
                <Button type="button" variant="outline" onClick={() => setActiveStep(steps[currentStepIndex - 1].id)}>Previous</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" type="button" asChild>
                <Link href={`/weekly/${weekStart}`}>Cancel</Link>
              </Button>
              {canGoForward ? (
                <Button type="button" onClick={(e) => { e.preventDefault(); setActiveStep(steps[currentStepIndex + 1].id); }}>Next</Button>
              ) : (
                <Button type="submit" className="gap-2"><Save className="h-4 w-4" />Save</Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center"><p className="text-zinc-400">Loading...</p></div>}>
      <EditPageContent />
    </Suspense>
  );
}