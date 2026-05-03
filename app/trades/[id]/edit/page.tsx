"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { ScreenshotUpload } from "@/components/ScreenshotUpload";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const poiQualityOptions = ["IMBALANCE/FAIR_VALUE_GAP", "INDUCEMENT_RESTING", "CLEAN_BREAK"];

const steps = [
  { id: "basic", label: "Basic Info", short: "Basic" },
  { id: "direction", label: "Direction & Analysis", short: "Direction" },
  { id: "poi", label: "Point of Interest", short: "POI" },
  { id: "traps", label: "Traps & Inducement", short: "Traps" },
  { id: "trinity", label: "The Trinity", short: "Trinity" },
  { id: "execution", label: "Trade Execution", short: "Execution" },
  { id: "risk", label: "Risk Management", short: "Risk" },
  { id: "postentry", label: "Post-Entry", short: "Post" },
  { id: "outcome", label: "Trade Outcome", short: "Outcome" },
  { id: "reflection", label: "Reflection", short: "Reflection" },
  { id: "screenshots", label: "Screenshots", short: "Screenshots" },
];

const REQUIRED_FIELDS = ["instrument", "direction", "entryPrice", "stopLossPrice", "riskAmount"];

function isTradeComplete(formData: any): boolean {
  return REQUIRED_FIELDS.every(field => formData[field] && formData[field] !== "");
}

export default function EditTradePage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as Id<"trades">;
  const trade = useQuery(api.trades.get, { id: tradeId });
  const accounts = useQuery(api.accounts.list) as { _id: string; name: string }[] | undefined;
  const updateTrade = useMutation(api.trades.update);

  const [activeStep, setActiveStep] = useState("basic");
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (trade && Object.keys(formData).length === 0) {
      setFormData({
        accountId: trade.accountId || "",
        instrument: trade.instrument || "EUR/USD",
        direction: trade.direction || "LONG",
        entryPrice: String(trade.entryPrice ?? ""),
        exitPrice: String(trade.exitPrice ?? ""),
        positionSize: String(trade.positionSize ?? "0.01"),
        commission: String(trade.commission ?? "0"),
        environment: trade.environment || "DEMO",
        dailyBias: trade.dailyBias || "NEUTRAL",
        externalStructure: trade.externalStructure || "",
        majorLiquidityPools: trade.majorLiquidityPools || "",
        internalStructure: trade.internalStructure || "",
        currentRange: trade.currentRange || "",
        minorPushStatus: trade.minorPushStatus || "",
        session: trade.session || "LONDON",
        isInKillzone: trade.isInKillzone ?? true,
        poiType: trade.poiType || "EXTREME",
        poiQuality: trade.poiQuality || [],
        poiDescription: trade.poiDescription || "",
        gapSize: String(trade.gapSize ?? ""),
        inducementResting: trade.inducementResting || "",
        inducementType: trade.inducementType || "",
        distanceFromPoi: String(trade.distanceFromPoi ?? ""),
        liquidityPoolDescription: trade.liquidityPoolDescription || "",
        cleanBreak: trade.cleanBreak ?? false,
        breakSize: String(trade.breakSize ?? ""),
        trapSwept: trade.trapSwept || "NO",
        trapType: trade.trapType || "",
        trapLocation: String(trade.trapLocation ?? ""),
        trapTappedCount: String(trade.trapTappedCount ?? ""),
        trapCleanliness: trade.trapCleanliness || "",
        liquidityEngineering: trade.liquidityEngineering || "",
        liquidityTappedCount: String(trade.liquidityTappedCount ?? ""),
        retailBehavior: trade.retailBehavior || "",
        missingInducement: trade.missingInducement ?? false,
        ltfEntryTimeframe: trade.ltfEntryTimeframe || "5M",
        smcType: trade.smcType || "",
        smsAfterTrap: trade.smsAfterTrap ?? false,
        bmsPattern: trade.bmsPattern || "",
        bmsConfidence: String(trade.bmsConfidence ?? "5"),
        rtoApplicable: trade.rtoApplicable ?? false,
        rtoDistance: String(trade.rtoDistance ?? ""),
        entryConfidence: String(trade.entryConfidence ?? "5"),
        tradeModel: trade.tradeModel || "CONTINUATION",
        narrativeAlignment: trade.narrativeAlignment ?? true,
        tradingWithMainPush: trade.tradingWithMainPush ?? true,
        noNarrativeMisalignment: trade.noNarrativeMisalignment ?? true,
        clearLiquidityEngineering: trade.clearLiquidityEngineering || "UNCLEAR",
        institutionsReasoned: trade.institutionsReasoned ?? false,
        poiMitigationStatus: trade.poiMitigationStatus || "UNMITIGATED",
        approachDynamics: trade.approachDynamics || "",
        stopLossPrice: String(trade.stopLossPrice ?? ""),
        stopLossPlacement: trade.stopLossPlacement || "IFC_ABOVE",
        stopLossPips: String(trade.stopLossPips ?? "5"),
        stopLossQuality: trade.stopLossQuality || "CLEAN",
        riskAmount: String(trade.riskAmount ?? "10"),
        riskPercentage: String(trade.riskPercentage ?? "1"),
        target1RR: String(trade.target1RR ?? "3"),
        target2RR: String(trade.target2RR ?? "10"),
        target1Price: String(trade.target1Price ?? ""),
        target2Price: String(trade.target2Price ?? ""),
        timeInTradeMinutes: String(trade.timeInTradeMinutes ?? ""),
        maxProfitReached: String(trade.maxProfitReached ?? ""),
        maxDrawdown: String(trade.maxDrawdown ?? ""),
        target1Hit: trade.target1Hit ?? false,
        target1HitPrice: String(trade.target1HitPrice ?? ""),
        stopMovedToBE: trade.stopMovedToBE ?? false,
        timeToTarget1: String(trade.timeToTarget1 ?? ""),
        target2Status: trade.target2Status || "",
        target2ClosedAt: String(trade.target2ClosedAt ?? ""),
        finalRR: String(trade.finalRR ?? ""),
        timeToClose: String(trade.timeToClose ?? ""),
        breakEvenStopsMoved: trade.breakEvenStopsMoved ?? false,
        manualExit: trade.manualExit ?? false,
        manualExitReason: trade.manualExitReason || "",
        manualExitAligned: trade.manualExitAligned ?? false,
        tradeClosureReason: trade.tradeClosureReason || "OPEN",
        pnl: String(trade.pnl ?? ""),
        pnlPercentage: String(trade.pnlPercentage ?? ""),
        winLossStatus: trade.winLossStatus || "BREAK_EVEN",
        tradeQualityScore: String(trade.tradeQualityScore ?? "5"),
        poiQualityRating: trade.poiQualityRating || "ACCEPTABLE",
        inducementQualityRating: trade.inducementQualityRating || "CLEAR",
        trinityAlignmentRating: trade.trinityAlignmentRating || "ACCEPTABLE",
        riskExecutionRating: trade.riskExecutionRating || "GOOD",
        disciplineRating: trade.disciplineRating || "MINOR_RUSH",
        whyEntered: trade.whyEntered || "",
        playedAsExpected: trade.playedAsExpected ?? true,
        expansionDescription: trade.expansionDescription || "",
        surpriseDescription: trade.surpriseDescription || "",
        whatWentWrong: trade.whatWentWrong || "",
        whatWentRight: trade.whatWentRight || "",
        institutionalLessons: trade.institutionalLessons || "",
        howAffectsNext: trade.howAffectsNext || "",
        followedTrinity: trade.followedTrinity ?? true,
        trinityViolationExplanation: trade.trinityViolationExplanation || "",
        correctKillzone: trade.correctKillzone ?? true,
        respectedHTFNarrative: trade.respectedHTFNarrative ?? true,
        waitedForInducement: trade.waitedForInducement ?? true,
        managedRiskPerPlan: trade.managedRiskPerPlan ?? true,
        disciplineScore: String(trade.disciplineScore ?? "5"),
        screenshots: trade.screenshots || [],
      });
    }
  }, [trade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTrade({
        id: tradeId,
        updates: {
          accountId: formData.accountId && formData.accountId !== "__none__" ? formData.accountId as Id<"accounts"> : undefined,
          instrument: formData.instrument,
          direction: formData.direction,
          entryPrice: Number(formData.entryPrice),
          exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
          positionSize: Number(formData.positionSize),
          commission: Number(formData.commission),
          environment: formData.environment,
          dailyBias: formData.dailyBias,
          externalStructure: formData.externalStructure,
          majorLiquidityPools: formData.majorLiquidityPools,
          internalStructure: formData.internalStructure,
          currentRange: formData.currentRange,
          minorPushStatus: formData.minorPushStatus,
          session: formData.session,
          isInKillzone: formData.isInKillzone,
          poiType: formData.poiType,
          poiQuality: formData.poiQuality,
          poiDescription: formData.poiDescription || undefined,
          gapSize: formData.gapSize ? Number(formData.gapSize) : undefined,
          inducementResting: formData.inducementResting || undefined,
          inducementType: formData.inducementType || undefined,
          distanceFromPoi: formData.distanceFromPoi ? Number(formData.distanceFromPoi) : undefined,
          cleanBreak: formData.cleanBreak,
          breakSize: formData.breakSize ? Number(formData.breakSize) : undefined,
          trapSwept: formData.trapSwept,
          trapType: formData.trapType || undefined,
          trapLocation: formData.trapLocation ? Number(formData.trapLocation) : undefined,
          trapTappedCount: formData.trapTappedCount ? Number(formData.trapTappedCount) : undefined,
          trapCleanliness: formData.trapCleanliness || undefined,
          missingInducement: formData.missingInducement,
          ltfEntryTimeframe: formData.ltfEntryTimeframe || undefined,
          smcType: formData.smcType || undefined,
          smsAfterTrap: formData.smsAfterTrap,
          bmsPattern: formData.bmsPattern || undefined,
          bmsConfidence: Number(formData.bmsConfidence),
          rtoApplicable: formData.rtoApplicable,
          rtoDistance: formData.rtoDistance ? Number(formData.rtoDistance) : undefined,
          entryConfidence: Number(formData.entryConfidence),
          tradeModel: formData.tradeModel,
          narrativeAlignment: formData.narrativeAlignment,
          tradingWithMainPush: formData.tradingWithMainPush,
          noNarrativeMisalignment: formData.noNarrativeMisalignment,
          clearLiquidityEngineering: formData.clearLiquidityEngineering || undefined,
          institutionsReasoned: formData.institutionsReasoned || undefined,
          poiMitigationStatus: formData.poiMitigationStatus,
          approachDynamics: formData.approachDynamics || undefined,
          stopLossPrice: Number(formData.stopLossPrice),
          stopLossPlacement: formData.stopLossPlacement,
          stopLossPips: Number(formData.stopLossPips),
          stopLossQuality: formData.stopLossQuality,
          riskAmount: Number(formData.riskAmount),
          riskPercentage: Number(formData.riskPercentage),
          target1RR: Number(formData.target1RR),
          target2RR: Number(formData.target2RR),
          timeInTradeMinutes: formData.timeInTradeMinutes ? Number(formData.timeInTradeMinutes) : undefined,
          maxProfitReached: formData.maxProfitReached ? Number(formData.maxProfitReached) : undefined,
          maxDrawdown: formData.maxDrawdown ? Number(formData.maxDrawdown) : undefined,
          target1Hit: formData.target1Hit || undefined,
          stopMovedToBE: formData.stopMovedToBE || undefined,
          target2Status: formData.target2Status || undefined,
          manualExit: formData.manualExit || undefined,
          manualExitReason: formData.manualExitReason || undefined,
          tradeClosureReason: formData.tradeClosureReason,
          pnl: formData.pnl ? Number(formData.pnl) : undefined,
          winLossStatus: formData.winLossStatus,
          tradeQualityScore: Number(formData.tradeQualityScore),
          poiQualityRating: formData.poiQualityRating,
          inducementQualityRating: formData.inducementQualityRating,
          trinityAlignmentRating: formData.trinityAlignmentRating,
          riskExecutionRating: formData.riskExecutionRating,
          disciplineRating: formData.disciplineRating,
          whyEntered: formData.whyEntered || undefined,
          playedAsExpected: formData.playedAsExpected,
          whatWentWrong: formData.whatWentWrong || undefined,
          whatWentRight: formData.whatWentRight || undefined,
          institutionalLessons: formData.institutionalLessons || undefined,
          followedTrinity: formData.followedTrinity,
          correctKillzone: formData.correctKillzone,
          respectedHTFNarrative: formData.respectedHTFNarrative,
          waitedForInducement: formData.waitedForInducement,
          managedRiskPerPlan: formData.managedRiskPerPlan,
          disciplineScore: Number(formData.disciplineScore),
          screenshots: formData.screenshots.length > 0 ? formData.screenshots : undefined,
        },
      });
      toast.success("Trade updated successfully!");
      router.push(`/trades/${tradeId}`);
    } catch (error) {
      toast.error("Failed to update trade");
    }
  };

  if (!trade || Object.keys(formData).length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading trade...</p>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;
  const isReflectionStep = activeStep === "reflection";
  const isComplete = isTradeComplete(formData);

  const handleUpdate = async (skipAutoSave?: boolean) => {
    try {
      await updateTrade({
        id: tradeId,
        updates: {
          accountId: formData.accountId && formData.accountId !== "__none__" ? formData.accountId as Id<"accounts"> : undefined,
          instrument: formData.instrument,
          direction: formData.direction,
          entryPrice: Number(formData.entryPrice),
          exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
          positionSize: Number(formData.positionSize),
          commission: Number(formData.commission),
          environment: formData.environment,
          dailyBias: formData.dailyBias,
          externalStructure: formData.externalStructure,
          majorLiquidityPools: formData.majorLiquidityPools,
          internalStructure: formData.internalStructure,
          currentRange: formData.currentRange || undefined,
          minorPushStatus: formData.minorPushStatus || undefined,
          session: formData.session,
          isInKillzone: formData.isInKillzone,
          poiType: formData.poiType,
          poiQuality: formData.poiQuality,
          poiDescription: formData.poiDescription || undefined,
          gapSize: formData.gapSize ? Number(formData.gapSize) : undefined,
          inducementResting: formData.inducementResting || undefined,
          inducementType: formData.inducementType || undefined,
          distanceFromPoi: formData.distanceFromPoi ? Number(formData.distanceFromPoi) : undefined,
          liquidityPoolDescription: formData.liquidityPoolDescription || undefined,
          cleanBreak: formData.cleanBreak || undefined,
          breakSize: formData.breakSize ? Number(formData.breakSize) : undefined,
          trapSwept: formData.trapSwept,
          trapType: formData.trapType || undefined,
          trapLocation: formData.trapLocation ? Number(formData.trapLocation) : undefined,
          trapTappedCount: formData.trapTappedCount ? Number(formData.trapTappedCount) : undefined,
          trapCleanliness: formData.trapCleanliness || undefined,
          liquidityEngineering: formData.liquidityEngineering || undefined,
          liquidityTappedCount: formData.liquidityTappedCount ? Number(formData.liquidityTappedCount) : undefined,
          retailBehavior: formData.retailBehavior || undefined,
          missingInducement: formData.missingInducement,
          ltfEntryTimeframe: formData.ltfEntryTimeframe || undefined,
          smcType: formData.smcType || undefined,
          smsAfterTrap: formData.smsAfterTrap,
          bmsPattern: formData.bmsPattern || undefined,
          bmsConfidence: Number(formData.bmsConfidence),
          rtoApplicable: formData.rtoApplicable,
          rtoDistance: formData.rtoDistance ? Number(formData.rtoDistance) : undefined,
          entryConfidence: Number(formData.entryConfidence),
          tradeModel: formData.tradeModel,
          narrativeAlignment: formData.narrativeAlignment,
          tradingWithMainPush: formData.tradingWithMainPush,
          noNarrativeMisalignment: formData.noNarrativeMisalignment,
          clearLiquidityEngineering: formData.clearLiquidityEngineering || undefined,
          institutionsReasoned: formData.institutionsReasoned || undefined,
          poiMitigationStatus: formData.poiMitigationStatus,
          approachDynamics: formData.approachDynamics || undefined,
          stopLossPrice: Number(formData.stopLossPrice),
          stopLossPlacement: formData.stopLossPlacement,
          stopLossPips: Number(formData.stopLossPips),
          stopLossQuality: formData.stopLossQuality,
          riskAmount: Number(formData.riskAmount),
          riskPercentage: Number(formData.riskPercentage),
          target1RR: Number(formData.target1RR),
          target2RR: Number(formData.target2RR),
          target1Price: formData.target1Price ? Number(formData.target1Price) : undefined,
          target2Price: formData.target2Price ? Number(formData.target2Price) : undefined,
          timeInTradeMinutes: formData.timeInTradeMinutes ? Number(formData.timeInTradeMinutes) : undefined,
          maxProfitReached: formData.maxProfitReached ? Number(formData.maxProfitReached) : undefined,
          maxDrawdown: formData.maxDrawdown ? Number(formData.maxDrawdown) : undefined,
          target1Hit: formData.target1Hit || undefined,
          target1HitPrice: formData.target1HitPrice ? Number(formData.target1HitPrice) : undefined,
          stopMovedToBE: formData.stopMovedToBE || undefined,
          timeToTarget1: formData.timeToTarget1 ? Number(formData.timeToTarget1) : undefined,
          target2Status: formData.target2Status || undefined,
          target2ClosedAt: formData.target2ClosedAt ? Number(formData.target2ClosedAt) : undefined,
          finalRR: formData.finalRR ? Number(formData.finalRR) : undefined,
          timeToClose: formData.timeToClose ? Number(formData.timeToClose) : undefined,
          breakEvenStopsMoved: formData.breakEvenStopsMoved || undefined,
          manualExit: formData.manualExit || undefined,
          manualExitReason: formData.manualExitReason || undefined,
          manualExitAligned: formData.manualExitAligned || undefined,
          tradeClosureReason: formData.tradeClosureReason,
          pnl: formData.pnl ? Number(formData.pnl) : undefined,
          pnlPercentage: formData.pnlPercentage ? Number(formData.pnlPercentage) : undefined,
          winLossStatus: formData.winLossStatus,
          tradeQualityScore: Number(formData.tradeQualityScore),
          poiQualityRating: formData.poiQualityRating,
          inducementQualityRating: formData.inducementQualityRating,
          trinityAlignmentRating: formData.trinityAlignmentRating,
          riskExecutionRating: formData.riskExecutionRating,
          disciplineRating: formData.disciplineRating,
          whyEntered: formData.whyEntered || undefined,
          playedAsExpected: formData.playedAsExpected,
          expansionDescription: formData.expansionDescription || undefined,
          surpriseDescription: formData.surpriseDescription || undefined,
          whatWentWrong: formData.whatWentWrong || undefined,
          whatWentRight: formData.whatWentRight || undefined,
          institutionalLessons: formData.institutionalLessons || undefined,
          howAffectsNext: formData.howAffectsNext || undefined,
          followedTrinity: formData.followedTrinity,
          trinityViolationExplanation: formData.trinityViolationExplanation || undefined,
          correctKillzone: formData.correctKillzone,
          respectedHTFNarrative: formData.respectedHTFNarrative,
          waitedForInducement: formData.waitedForInducement,
          managedRiskPerPlan: formData.managedRiskPerPlan,
          disciplineScore: Number(formData.disciplineScore),
          screenshots: formData.screenshots.length > 0 ? formData.screenshots : undefined,
        },
      });
      if (!skipAutoSave) {
        toast.success("Trade updated successfully!");
        router.push(`/trades/${tradeId}`);
      }
    } catch (error) {
      toast.error("Failed to update trade");
    }
  };

  const handleStepChange = (newStep: string) => {
    if (isReflectionStep && canGoForward) {
      handleUpdate(true);
    }
    setActiveStep(newStep);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/trades/${tradeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Trade</h1>
          <p className="text-sm text-muted-foreground">{trade.instrument} {trade.direction}</p>
        </div>
      </div>

      <div className="flex gap-6">
        <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                activeStep === step.id
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
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
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {index + 1}. {step.short}
                </button>
              ))}
            </div>

            <StepContent
              step={activeStep}
              formData={formData}
              setFormData={setFormData}
              accounts={accounts || []}
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                {canGoBack && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveStep(steps[currentStepIndex - 1].id)}
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" asChild>
                  <Link href={`/trades/${tradeId}`}>Cancel</Link>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpdate(true)}
                >
                  Save Changes
                </Button>
                {canGoForward ? (
                  <Button
                    type="button"
                    onClick={() => handleStepChange(steps[currentStepIndex + 1].id)}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Update Trade
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

function StepContent({
  step,
  formData,
  setFormData,
  accounts,
}: {
  step: string;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  accounts: { _id: string; name: string }[];
}) {
  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  switch (step) {
    case "basic":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core trade details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={formData.accountId} onValueChange={(v) => update("accountId", v)}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No Account</SelectItem>
                  {accounts?.map((a: { _id: string; name: string }) => (
                    <SelectItem key={a._id} value={a._id as string}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instrument</Label>
              <Select value={formData.instrument} onValueChange={(v) => update("instrument", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {instruments.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={formData.direction} onValueChange={(v) => update("direction", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LONG">LONG</SelectItem>
                  <SelectItem value="SHORT">SHORT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Entry Price</Label>
              <Input type="number" step="0.00001" value={formData.entryPrice} onChange={(e) => update("entryPrice", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Exit Price</Label>
              <Input type="number" step="0.00001" value={formData.exitPrice} onChange={(e) => update("exitPrice", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Position Size</Label>
              <Input type="number" step="0.01" value={formData.positionSize} onChange={(e) => update("positionSize", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Commission ($)</Label>
              <Input type="number" step="0.01" value={formData.commission} onChange={(e) => update("commission", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={formData.environment} onValueChange={(v) => update("environment", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKTESTING">Backtesting</SelectItem>
                  <SelectItem value="DEMO">Demo</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );

    case "direction":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Direction &amp; Analysis</CardTitle>
            <CardDescription>WWA Framework - Daily structure and bias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Daily Bias</Label>
                <Select value={formData.dailyBias} onValueChange={(v) => update("dailyBias", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BULLISH">BULLISH</SelectItem>
                    <SelectItem value="BEARISH">BEARISH</SelectItem>
                    <SelectItem value="NEUTRAL">NEUTRAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Session</Label>
                <Select value={formData.session} onValueChange={(v) => update("session", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASIA">ASIA</SelectItem>
                    <SelectItem value="LONDON">LONDON</SelectItem>
                    <SelectItem value="NEW_YORK">NEW YORK</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isInKillzone" checked={formData.isInKillzone} onCheckedChange={(checked) => update("isInKillzone", !!checked)} />
              <Label htmlFor="isInKillzone">In Killzone (London/NY Open)</Label>
            </div>
            <div className="space-y-2">
              <Label>External Structure (Main Push)</Label>
              <Textarea value={formData.externalStructure} onChange={(e) => update("externalStructure", e.target.value)} rows={3} placeholder="Describe the main push and structure..." />
            </div>
            <div className="space-y-2">
              <Label>Major Liquidity Pools</Label>
              <Textarea value={formData.majorLiquidityPools} onChange={(e) => update("majorLiquidityPools", e.target.value)} rows={2} placeholder="Asia High, Asia Low, Previous D POI..." />
            </div>
            <div className="space-y-2">
              <Label>Internal Structure</Label>
              <Textarea value={formData.internalStructure} onChange={(e) => update("internalStructure", e.target.value)} rows={2} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Current Range</Label>
                <Input value={formData.currentRange} onChange={(e) => update("currentRange", e.target.value)} placeholder="e.g. 100 pips" />
              </div>
              <div className="space-y-2">
                <Label>Minor Push Status</Label>
                <Input value={formData.minorPushStatus} onChange={(e) => update("minorPushStatus", e.target.value)} placeholder="e.g. Continuing, Exhausting" />
              </div>
            </div>
          </CardContent>
        </Card>
      );

    case "poi":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Point of Interest (POI)</CardTitle>
            <CardDescription>WWA Framework - Where institutions react</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>POI Type</Label>
                <Select value={formData.poiType} onValueChange={(v) => update("poiType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXTREME">EXTREME (Origin of Main Push)</SelectItem>
                    <SelectItem value="DECISIONAL">DECISIONAL (Last Pullback)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>POI Mitigation Status</Label>
                <Select value={formData.poiMitigationStatus} onValueChange={(v) => update("poiMitigationStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNMITIGATED">Unmitigated (Fresh Zone)</SelectItem>
                    <SelectItem value="MITIGATED_ONCE">Mitigated Once</SelectItem>
                    <SelectItem value="WEAKENED">Weakened (Multiple taps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>POI Quality (select all that apply)</Label>
              <div className="flex flex-wrap gap-4">
                {poiQualityOptions.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`poi-${opt}`}
                      checked={formData.poiQuality?.includes(opt)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          update("poiQuality", [...(formData.poiQuality || []), opt]);
                        } else {
                          update("poiQuality", (formData.poiQuality || []).filter((q: string) => q !== opt));
                        }
                      }}
                    />
                    <Label htmlFor={`poi-${opt}`}>{opt.replace(/_/g, " ")}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>POI Description</Label>
              <Textarea value={formData.poiDescription} onChange={(e) => update("poiDescription", e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Gap Size (pips)</Label>
                <Input type="number" step="0.1" value={formData.gapSize} onChange={(e) => update("gapSize", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Break Size (pips)</Label>
                <Input type="number" step="0.1" value={formData.breakSize} onChange={(e) => update("breakSize", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Inducement Resting</Label>
                <Input value={formData.inducementResting} onChange={(e) => update("inducementResting", e.target.value)} placeholder="e.g. Above, Below" />
              </div>
              <div className="space-y-2">
                <Label>Inducement Type</Label>
                <Input value={formData.inducementType} onChange={(e) => update("inducementType", e.target.value)} placeholder="e.g. Double, Stacked" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Distance from POI (pips)</Label>
                <Input type="number" step="0.1" value={formData.distanceFromPoi} onChange={(e) => update("distanceFromPoi", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Liquidity Pool Description</Label>
                <Input value={formData.liquidityPoolDescription} onChange={(e) => update("liquidityPoolDescription", e.target.value)} placeholder="Describe the pool..." />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cleanBreak" checked={formData.cleanBreak} onCheckedChange={(checked) => update("cleanBreak", !!checked)} />
              <Label htmlFor="cleanBreak">Clean Break (convincing structure break)</Label>
            </div>
          </CardContent>
        </Card>
      );

    case "traps":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Traps &amp; Inducement</CardTitle>
            <CardDescription>WWA Framework - Liquidity engineering and traps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Trap Swept?</Label>
                <Select value={formData.trapSwept} onValueChange={(v) => update("trapSwept", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                    <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trap Type</Label>
                <Input value={formData.trapType} onChange={(e) => update("trapType", e.target.value)} placeholder="Inducement of Control/Target/SMT" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Trap Location (pips from POI)</Label>
                <Input type="number" step="0.1" value={formData.trapLocation} onChange={(e) => update("trapLocation", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Trap Tapped Count</Label>
                <Input type="number" value={formData.trapTappedCount} onChange={(e) => update("trapTappedCount", e.target.value)} placeholder="How many times tapped" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Trap Cleanliness</Label>
                <Input value={formData.trapCleanliness} onChange={(e) => update("trapCleanliness", e.target.value)} placeholder="e.g. Clean, Messy, Stacked" />
              </div>
              <div className="space-y-2">
                <Label>Liquidity Engineering</Label>
                <Input value={formData.liquidityEngineering} onChange={(e) => update("liquidityEngineering", e.target.value)} placeholder="e.g. Stacked, Swept" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Liquidity Tapped Count</Label>
                <Input type="number" value={formData.liquidityTappedCount} onChange={(e) => update("liquidityTappedCount", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Retail Behavior</Label>
                <Input value={formData.retailBehavior} onChange={(e) => update("retailBehavior", e.target.value)} placeholder="e.g. Chasing, Stop hunting" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="missingInducement" checked={formData.missingInducement} onCheckedChange={(checked) => update("missingInducement", !!checked)} />
              <Label htmlFor="missingInducement">Missing Inducement (Reduces probability)</Label>
            </div>
          </CardContent>
        </Card>
      );

    case "trinity":
      return (
        <Card>
          <CardHeader>
            <CardTitle>The Trinity</CardTitle>
            <CardDescription>All 3 required for high-probability trade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`p-4 rounded-lg border ${formData.trapSwept === "YES" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                <p className="font-medium">1. Inducement</p>
                <p className="text-sm text-muted-foreground">{formData.trapSwept === "YES" ? "Present" : "Missing"}</p>
              </div>
              <div className={`p-4 rounded-lg border ${formData.smsAfterTrap ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                <p className="font-medium">2. LTC Confirmation</p>
                <p className="text-sm text-muted-foreground">{formData.smsAfterTrap ? "SMS after trap" : "Not confirmed"}</p>
              </div>
              <div className={`p-4 rounded-lg border ${formData.isInKillzone ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                <p className="font-medium">3. Killzone</p>
                <p className="text-sm text-muted-foreground">{formData.isInKillzone ? "In Zone" : "Outside"}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
              <Checkbox id="smsAfterTrap" checked={formData.smsAfterTrap} onCheckedChange={(checked) => update("smsAfterTrap", !!checked)} />
              <Label htmlFor="smsAfterTrap">SMS (Shift in Market Structure) after trap sweep</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>LTF Entry Timeframe</Label>
                <Select value={formData.ltfEntryTimeframe} onValueChange={(v) => update("ltfEntryTimeframe", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1M">1M</SelectItem>
                    <SelectItem value="5M">5M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>SMG Type</Label>
                <Input value={formData.smcType} onChange={(e) => update("smcType", e.target.value)} placeholder="e.g. Higher High + Higher Low" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>BMS Pattern</Label>
                <Input value={formData.bmsPattern} onChange={(e) => update("bmsPattern", e.target.value)} placeholder="e.g. BOS, Change of Character" />
              </div>
              <div className="space-y-2">
                <Label>BMS Confidence (1-10)</Label>
                <Input type="number" min="1" max="10" value={formData.bmsConfidence} onChange={(e) => update("bmsConfidence", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Entry Confidence (1-10)</Label>
                <Input type="number" min="1" max="10" value={formData.entryConfidence} onChange={(e) => update("entryConfidence", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>RTO (Retest) Applicable?</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="rtoApplicable" checked={formData.rtoApplicable} onCheckedChange={(checked) => update("rtoApplicable", !!checked)} />
                  <Label htmlFor="rtoApplicable">Yes</Label>
                </div>
              </div>
            </div>
            {formData.rtoApplicable && (
              <div className="space-y-2">
                <Label>RTO Distance (pips)</Label>
                <Input type="number" step="0.1" value={formData.rtoDistance} onChange={(e) => update("rtoDistance", e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>
      );

    case "execution":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Trade Execution</CardTitle>
            <CardDescription>Narrative alignment and approach</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trade Model</Label>
              <Select value={formData.tradeModel} onValueChange={(v) => update("tradeModel", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONTINUATION">CONTINUATION MODEL</SelectItem>
                  <SelectItem value="REVERSAL">REVERSAL MODEL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Narrative Alignment Check</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="narrativeAlignment" checked={formData.narrativeAlignment} onCheckedChange={(checked) => update("narrativeAlignment", !!checked)} />
                  <Label htmlFor="narrativeAlignment">HTF narrative supports this trade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="tradingWithMainPush" checked={formData.tradingWithMainPush} onCheckedChange={(checked) => update("tradingWithMainPush", !!checked)} />
                  <Label htmlFor="tradingWithMainPush">Trading WITH the Main Push</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="noNarrativeMisalignment" checked={formData.noNarrativeMisalignment} onCheckedChange={(checked) => update("noNarrativeMisalignment", !!checked)} />
                  <Label htmlFor="noNarrativeMisalignment">No narrative misalignment</Label>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Clear Liquidity Engineering</Label>
                <Select value={formData.clearLiquidityEngineering} onValueChange={(v) => update("clearLiquidityEngineering", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEAR">CLEAR</SelectItem>
                    <SelectItem value="UNCLEAR">UNCLEAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Institutions Reasoned</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="institutionsReasoned" checked={formData.institutionsReasoned} onCheckedChange={(checked) => update("institutionsReasoned", !!checked)} />
                  <Label htmlFor="institutionsReasoned">Yes</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Approach Dynamics</Label>
              <Input value={formData.approachDynamics} onChange={(e) => update("approachDynamics", e.target.value)} placeholder="Compression (CP) / V-Shape / Other" />
            </div>
          </CardContent>
        </Card>
      );

    case "risk":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
            <CardDescription>Stop loss and position sizing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Stop Loss Price</Label>
              <Input type="number" step="0.00001" value={formData.stopLossPrice} onChange={(e) => update("stopLossPrice", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Stop Loss Size (pips)</Label>
              <Input type="number" step="0.1" value={formData.stopLossPips} onChange={(e) => update("stopLossPips", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Stop Loss Placement</Label>
              <Select value={formData.stopLossPlacement} onValueChange={(v) => update("stopLossPlacement", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IFC_ABOVE">IFC ABOVE</SelectItem>
                  <SelectItem value="IFC_BELOW">IFC BELOW</SelectItem>
                  <SelectItem value="REFINED_WICK">REFINED WICK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Amount ($)</Label>
              <Input type="number" step="0.01" value={formData.riskAmount} onChange={(e) => update("riskAmount", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Risk % of Account</Label>
              <Input type="number" step="0.1" value={formData.riskPercentage} onChange={(e) => update("riskPercentage", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target 1 RR</Label>
              <Input type="number" step="0.1" value={formData.target1RR} onChange={(e) => update("target1RR", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target 2 RR</Label>
              <Input type="number" step="0.1" value={formData.target2RR} onChange={(e) => update("target2RR", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Target 1 Price</Label>
              <Input type="number" step="0.00001" value={formData.target1Price} onChange={(e) => update("target1Price", e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label>Target 2 Price</Label>
              <Input type="number" step="0.00001" value={formData.target2Price} onChange={(e) => update("target2Price", e.target.value)} placeholder="Optional" />
            </div>
          </CardContent>
        </Card>
      );

case "postentry":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Post-Entry Management</CardTitle>
            <CardDescription>Trade progression and management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Time in Trade (minutes)</Label>
                <Input type="number" value={formData.timeInTradeMinutes} onChange={(e) => update("timeInTradeMinutes", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Profit Reached (pips)</Label>
                <Input type="number" step="0.1" value={formData.maxProfitReached} onChange={(e) => update("maxProfitReached", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Max Drawdown (pips)</Label>
                <Input type="number" step="0.1" value={formData.maxDrawdown} onChange={(e) => update("maxDrawdown", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Trade Closure Reason</Label>
                <Select value={formData.tradeClosureReason} onValueChange={(v) => update("tradeClosureReason", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="HIT_TARGET_1_RUNNING">HIT TARGET 1 &amp; RUNNING</SelectItem>
                    <SelectItem value="HIT_TARGET_2_COMPLETELY">HIT TARGET 2 COMPLETELY</SelectItem>
                    <SelectItem value="STOPPED_OUT">STOPPED OUT</SelectItem>
                    <SelectItem value="MANUAL_EXIT">MANUAL EXIT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="target1Hit" checked={formData.target1Hit} onCheckedChange={(checked) => update("target1Hit", !!checked)} />
              <Label htmlFor="target1Hit">Target 1 Hit?</Label>
            </div>
            {formData.target1Hit && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target 1 Hit Price</Label>
                  <Input type="number" step="0.00001" value={formData.target1HitPrice} onChange={(e) => update("target1HitPrice", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Time to Target 1 (minutes)</Label>
                  <Input type="number" value={formData.timeToTarget1} onChange={(e) => update("timeToTarget1", e.target.value)} />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox id="stopMovedToBE" checked={formData.stopMovedToBE} onCheckedChange={(checked) => update("stopMovedToBE", !!checked)} />
              <Label htmlFor="stopMovedToBE">Stop Moved to Break Even?</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="manualExit" checked={formData.manualExit} onCheckedChange={(checked) => update("manualExit", !!checked)} />
              <Label htmlFor="manualExit">Manual Exit?</Label>
            </div>
            {formData.manualExit && (
              <div className="space-y-2">
                <Label>Manual Exit Reason</Label>
                <Input value={formData.manualExitReason} onChange={(e) => update("manualExitReason", e.target.value)} />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox id="manualExitAligned" checked={formData.manualExitAligned} onCheckedChange={(checked) => update("manualExitAligned", !!checked)} />
              <Label htmlFor="manualExitAligned">Manual Exit Aligned with Plan?</Label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Target 2 Status</Label>
                <Input value={formData.target2Status} onChange={(e) => update("target2Status", e.target.value)} placeholder="e.g. Running, Hit, Not Hit" />
              </div>
              <div className="space-y-2">
                <Label>Target 2 Closed At</Label>
                <Input type="number" value={formData.target2ClosedAt} onChange={(e) => update("target2ClosedAt", e.target.value)} placeholder="Timestamp" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Final RR</Label>
                <Input type="number" step="0.1" value={formData.finalRR} onChange={(e) => update("finalRR", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Time to Close (minutes)</Label>
                <Input type="number" value={formData.timeToClose} onChange={(e) => update("timeToClose", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="breakEvenStopsMoved" checked={formData.breakEvenStopsMoved} onCheckedChange={(checked) => update("breakEvenStopsMoved", !!checked)} />
              <Label htmlFor="breakEvenStopsMoved">Break Even Stops Moved?</Label>
            </div>
          </CardContent>
        </Card>
      );

    case "outcome":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Trade Outcome</CardTitle>
            <CardDescription>Final results and quality assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>P&amp;L ($)</Label>
                <Input type="number" step="0.01" value={formData.pnl} onChange={(e) => update("pnl", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>P&amp;L (%)</Label>
                <Input type="number" step="0.1" value={formData.pnlPercentage} onChange={(e) => update("pnlPercentage", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Win/Loss Status</Label>
                <Select value={formData.winLossStatus} onValueChange={(v) => update("winLossStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WIN">WIN</SelectItem>
                    <SelectItem value="LOSS">LOSS</SelectItem>
                    <SelectItem value="BREAK_EVEN">BREAK EVEN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quality Score (1-10)</Label>
                <Input type="number" min="1" max="10" value={formData.tradeQualityScore} onChange={(e) => update("tradeQualityScore", e.target.value)} />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>POI Quality</Label>
                <Select value={formData.poiQualityRating} onValueChange={(v) => update("poiQualityRating", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRISTINE">PRISTINE</SelectItem>
                    <SelectItem value="CLEAN">CLEAN</SelectItem>
                    <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                    <SelectItem value="QUESTIONABLE">QUESTIONABLE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Inducement Quality</Label>
                <Select value={formData.inducementQualityRating} onValueChange={(v) => update("inducementQualityRating", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBVIOUS">OBVIOUS</SelectItem>
                    <SelectItem value="CLEAR">CLEAR</SelectItem>
                    <SelectItem value="SUBTLE">SUBTLE</SelectItem>
                    <SelectItem value="MISSING">MISSING</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trinity Alignment</Label>
                <Select value={formData.trinityAlignmentRating} onValueChange={(v) => update("trinityAlignmentRating", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERFECT">PERFECT</SelectItem>
                    <SelectItem value="STRONG">STRONG</SelectItem>
                    <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                    <SelectItem value="WEAK">WEAK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Risk Execution</Label>
                <Select value={formData.riskExecutionRating} onValueChange={(v) => update("riskExecutionRating", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAWLESS">FLAWLESS</SelectItem>
                    <SelectItem value="GOOD">GOOD</SelectItem>
                    <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                    <SelectItem value="POOR">POOR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select value={formData.disciplineRating} onValueChange={(v) => update("disciplineRating", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERFECT_WAIT">PERFECT WAIT</SelectItem>
                  <SelectItem value="MINOR_RUSH">MINOR RUSH</SelectItem>
                  <SelectItem value="IMPATIENT">IMPATIENT</SelectItem>
                  <SelectItem value="FORCED">FORCED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );

    case "reflection":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Trade Reflection</CardTitle>
            <CardDescription>Learn from your trade</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Why did you enter this trade?</Label>
              <Textarea value={formData.whyEntered} onChange={(e) => update("whyEntered", e.target.value)} rows={3} placeholder="Describe the setup..." />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="playedAsExpected" checked={formData.playedAsExpected} onCheckedChange={(checked) => update("playedAsExpected", !!checked)} />
              <Label htmlFor="playedAsExpected">Did the move play out as expected?</Label>
            </div>
            <div className="space-y-2">
              <Label>What went wrong? (if losing)</Label>
              <Textarea value={formData.whatWentWrong} onChange={(e) => update("whatWentWrong", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>What went right? (if winning)</Label>
              <Textarea value={formData.whatWentRight} onChange={(e) => update("whatWentRight", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Expansion Description</Label>
              <Textarea value={formData.expansionDescription} onChange={(e) => update("expansionDescription", e.target.value)} rows={2} placeholder="How did the trade expand beyond expectations?" />
            </div>
            <div className="space-y-2">
              <Label>Surprise Description</Label>
              <Textarea value={formData.surpriseDescription} onChange={(e) => update("surpriseDescription", e.target.value)} rows={2} placeholder="Any unexpected movements?" />
            </div>
            <div className="space-y-2">
              <Label>Institutional Lessons</Label>
              <Textarea value={formData.institutionalLessons} onChange={(e) => update("institutionalLessons", e.target.value)} rows={2} placeholder="What did institutions do?" />
            </div>
            <div className="space-y-2">
              <Label>How Affects Next Trade</Label>
              <Textarea value={formData.howAffectsNext} onChange={(e) => update("howAffectsNext", e.target.value)} rows={2} placeholder="How does this affect your next trade?" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Rule Adherence</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="followedTrinity" checked={formData.followedTrinity} onCheckedChange={(checked) => update("followedTrinity", !!checked)} />
                  <Label htmlFor="followedTrinity">Followed the Trinity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="correctKillzone" checked={formData.correctKillzone} onCheckedChange={(checked) => update("correctKillzone", !!checked)} />
                  <Label htmlFor="correctKillzone">Used correct Killzone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="waitedForInducement" checked={formData.waitedForInducement} onCheckedChange={(checked) => update("waitedForInducement", !!checked)} />
                  <Label htmlFor="waitedForInducement">Waited for clear inducement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="respectedHTFNarrative" checked={formData.respectedHTFNarrative} onCheckedChange={(checked) => update("respectedHTFNarrative", !!checked)} />
                  <Label htmlFor="respectedHTFNarrative">Respected HTF Narrative</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="managedRiskPerPlan" checked={formData.managedRiskPerPlan} onCheckedChange={(checked) => update("managedRiskPerPlan", !!checked)} />
                  <Label htmlFor="managedRiskPerPlan">Managed Risk Per Plan</Label>
                </div>
              </div>
            </div>
            {!formData.followedTrinity && (
              <div className="space-y-2">
                <Label>Trinity Violation Explanation</Label>
                <Textarea value={formData.trinityViolationExplanation} onChange={(e) => update("trinityViolationExplanation", e.target.value)} rows={2} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Discipline Score (1-10)</Label>
              <Input type="number" min="1" max="10" value={formData.disciplineScore} onChange={(e) => update("disciplineScore", e.target.value)} />
            </div>
          </CardContent>
        </Card>
      );

    case "screenshots":
      return (
        <Card>
          <CardHeader>
            <CardTitle>Trade Screenshots</CardTitle>
            <CardDescription>Capture your chart setups and trade context</CardDescription>
          </CardHeader>
          <CardContent>
            <ScreenshotUpload
              value={formData.screenshots}
              onChange={(ids) => update("screenshots", ids)}
              maxFiles={5}
            />
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
