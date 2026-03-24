"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const steps = [
  { id: "macro", label: "Macro Overview", short: "Macro" },
  { id: "events", label: "Key Events", short: "Events" },
  { id: "centralbanks", label: "Central Banks", short: "Banks" },
  { id: "inflation", label: "Inflation & Growth", short: "Inflation" },
  { id: "cot", label: "COT Analysis", short: "COT" },
  { id: "bias", label: "Currency Bias", short: "Bias" },
  { id: "trades", label: "Trade Ideas", short: "Trades" },
  { id: "review", label: "End of Week", short: "Review" },
];

const biasOptions = [
  { value: "BULLISH", label: "Bullish" },
  { value: "BEARISH", label: "Bearish" },
  { value: "NEUTRAL", label: "Neutral" },
];

export default function NewWeeklyFundamentalPage() {
  const router = useRouter();
  const createAnalysis = useMutation(api.weeklyFundamentalAnalysis.create);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const [activeStep, setActiveStep] = useState("macro");
  const [formData, setFormData] = useState({
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    // Macro
    overallRiskSentiment: "NEUTRAL",
    riskSentimentDirection: "SIDEWAYS",
    dxyWeeklyBias: "NEUTRAL",
    dxyDirection: "SIDEWAYS",
    us10yrYield: "",
    us10yrDirection: "SIDEWAYS",
    vixLevel: "",
    vixDirection: "BELOW_20",
    goldDirection: "FLAT",
    wtiOil: "",
    wtiDirection: "UP",
    // Events
    mondayEvents: "",
    tuesdayEvents: "",
    wednesdayEvents: "",
    thursdayEvents: "",
    fridayEvents: "",
    highestImpactEvent: "",
    expectedMarketReaction: "",
    // Central Banks
    fedMeetingsSpeeches: "",
    fedCurrentRate: "",
    fedMarketExpects: "",
    fedHoldProbability: "",
    fedCutProbability: "",
    fedHikeProbability: "",
    ecbMeetingsSpeeches: "",
    ecbCurrentRate: "",
    ecbTone: "",
    boeMeetingsSpeeches: "",
    boeCurrentRate: "",
    boeVoteSplit: "",
    bojMeetingsSpeeches: "",
    yccStatus: "",
    // Inflation
    usCPIHeadline: "",
    usCPIHeadlinePrior: "",
    usCPIHeadlineTrend: "",
    usCoreCPI: "",
    usCoreCPIPrior: "",
    usCoreCPITrend: "",
    corePCE: "",
    corePCEPrior: "",
    corePCETrend: "",
    nfpJobsAdded: "",
    nfpPrior: "",
    nfpTrend: "",
    unemploymentRate: "",
    unemploymentTrend: "",
    usGDP: "",
    usGDPPrior: "",
    usGDPTrend: "",
    inflationNarrative: "",
    growthNarrative: "",
    // COT
    eurNetPositions: "",
    eurPositionChange: "",
    eurSignal: "",
    gbpNetPositions: "",
    gbpPositionChange: "",
    gbpSignal: "",
    jpyNetPositions: "",
    jpyPositionChange: "",
    jpySignal: "",
    audNetPositions: "",
    audPositionChange: "",
    audSignal: "",
    cadNetPositions: "",
    cadPositionChange: "",
    cadSignal: "",
    nzdNetPositions: "",
    nzdPositionChange: "",
    nzdSignal: "",
    extremePositioningAlert: "",
    // Bias
    usdBias: "NEUTRAL",
    usdReason: "",
    eurBias: "NEUTRAL",
    eurReason: "",
    gbpBias: "NEUTRAL",
    gbpReason: "",
    jpyBias: "NEUTRAL",
    jpyReason: "",
    cadBias: "NEUTRAL",
    cadReason: "",
    audBias: "NEUTRAL",
    audReason: "",
    chfBias: "NEUTRAL",
    chfReason: "",
    nzdBias: "NEUTRAL",
    nzdReason: "",
    // Trade Ideas
    trade1Pair: "",
    trade1Direction: "",
    trade1Reason: "",
    trade1KeyLevel: "",
    trade1Invalidation: "",
    trade2Pair: "",
    trade2Direction: "",
    trade2Reason: "",
    trade2KeyLevel: "",
    trade2Invalidation: "",
    // High Risk
    highRiskEvent1: "",
    highRiskDate1: "",
    highRiskReason1: "",
    highRiskEvent2: "",
    highRiskDate2: "",
    highRiskReason2: "",
    // Geopolitical
    activeRisks: "",
    potentialShockEvents: "",
    safeHavenBias: "",
    // Review
    confirmationOfBias: "",
    surprisingData: "",
    missedAnalysis: "",
    adjustmentsNextWeek: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnalysis({
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
        overallRiskSentiment: formData.overallRiskSentiment as "RISK_ON" | "RISK_OFF" | "NEUTRAL",
        riskSentimentDirection: formData.riskSentimentDirection as "UP" | "DOWN" | "SIDEWAYS",
        dxyWeeklyBias: formData.dxyWeeklyBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        dxyDirection: formData.dxyDirection as "UP" | "DOWN" | "SIDEWAYS",
        us10yrYield: formData.us10yrYield ? Number(formData.us10yrYield) : undefined,
        us10yrDirection: formData.us10yrDirection as "UP" | "DOWN" | "SIDEWAYS",
        vixLevel: formData.vixLevel ? Number(formData.vixLevel) : undefined,
        vixDirection: formData.vixDirection as "ABOVE_20" | "BELOW_20",
        goldDirection: formData.goldDirection as "UP" | "DOWN" | "FLAT",
        wtiOil: formData.wtiOil ? Number(formData.wtiOil) : undefined,
        wtiDirection: formData.wtiDirection as "UP" | "DOWN",
        mondayEvents: formData.mondayEvents || undefined,
        tuesdayEvents: formData.tuesdayEvents || undefined,
        wednesdayEvents: formData.wednesdayEvents || undefined,
        thursdayEvents: formData.thursdayEvents || undefined,
        fridayEvents: formData.fridayEvents || undefined,
        highestImpactEvent: formData.highestImpactEvent || undefined,
        expectedMarketReaction: formData.expectedMarketReaction || undefined,
        fedMeetingsSpeeches: formData.fedMeetingsSpeeches || undefined,
        fedCurrentRate: formData.fedCurrentRate ? Number(formData.fedCurrentRate) : undefined,
        fedMarketExpects: formData.fedMarketExpects || undefined,
        fedHoldProbability: formData.fedHoldProbability ? Number(formData.fedHoldProbability) : undefined,
        fedCutProbability: formData.fedCutProbability ? Number(formData.fedCutProbability) : undefined,
        fedHikeProbability: formData.fedHikeProbability ? Number(formData.fedHikeProbability) : undefined,
        ecbMeetingsSpeeches: formData.ecbMeetingsSpeeches || undefined,
        ecbCurrentRate: formData.ecbCurrentRate ? Number(formData.ecbCurrentRate) : undefined,
        ecbTone: formData.ecbTone || undefined,
        boeMeetingsSpeeches: formData.boeMeetingsSpeeches || undefined,
        boeCurrentRate: formData.boeCurrentRate ? Number(formData.boeCurrentRate) : undefined,
        boeVoteSplit: formData.boeVoteSplit || undefined,
        bojMeetingsSpeeches: formData.bojMeetingsSpeeches || undefined,
        yccStatus: formData.yccStatus || undefined,
        usCPIHeadline: formData.usCPIHeadline ? Number(formData.usCPIHeadline) : undefined,
        usCPIHeadlinePrior: formData.usCPIHeadlinePrior ? Number(formData.usCPIHeadlinePrior) : undefined,
        usCPIHeadlineTrend: (formData.usCPIHeadlineTrend || undefined) as "RISING" | "FALLING" | "STICKY" | undefined,
        usCoreCPI: formData.usCoreCPI ? Number(formData.usCoreCPI) : undefined,
        usCoreCPIPrior: formData.usCoreCPIPrior ? Number(formData.usCoreCPIPrior) : undefined,
        usCoreCPITrend: (formData.usCoreCPITrend || undefined) as "RISING" | "FALLING" | "STICKY" | undefined,
        corePCE: formData.corePCE ? Number(formData.corePCE) : undefined,
        corePCEPrior: formData.corePCEPrior ? Number(formData.corePCEPrior) : undefined,
        corePCETrend: (formData.corePCETrend || undefined) as "RISING" | "FALLING" | "STICKY" | undefined,
        nfpJobsAdded: formData.nfpJobsAdded ? Number(formData.nfpJobsAdded) : undefined,
        nfpPrior: formData.nfpPrior ? Number(formData.nfpPrior) : undefined,
        nfpTrend: (formData.nfpTrend || undefined) as "ACCELERATING" | "DECELERATING" | undefined,
        unemploymentRate: formData.unemploymentRate ? Number(formData.unemploymentRate) : undefined,
        unemploymentTrend: (formData.unemploymentTrend || undefined) as "TIGHTENING" | "LOOSENING" | undefined,
        usGDP: formData.usGDP ? Number(formData.usGDP) : undefined,
        usGDPPrior: formData.usGDPPrior ? Number(formData.usGDPPrior) : undefined,
        usGDPTrend: (formData.usGDPTrend || undefined) as "ACCELERATING" | "DECELERATING" | undefined,
        inflationNarrative: formData.inflationNarrative || undefined,
        growthNarrative: formData.growthNarrative || undefined,
        eurNetPositions: formData.eurNetPositions ? Number(formData.eurNetPositions) : undefined,
        eurPositionChange: formData.eurPositionChange ? Number(formData.eurPositionChange) : undefined,
        eurSignal: (formData.eurSignal || undefined) as "BULLISH" | "BEARISH" | "NEUTRAL" | undefined,
        gbpNetPositions: formData.gbpNetPositions ? Number(formData.gbpNetPositions) : undefined,
        gbpPositionChange: formData.gbpPositionChange ? Number(formData.gbpPositionChange) : undefined,
        gbpSignal: (formData.gbpSignal || undefined) as "BULLISH" | "BEARISH" | "NEUTRAL" | undefined,
        jpyNetPositions: formData.jpyNetPositions ? Number(formData.jpyNetPositions) : undefined,
        jpyPositionChange: formData.jpyPositionChange ? Number(formData.jpyPositionChange) : undefined,
        jpySignal: (formData.jpySignal || undefined) as "BULLISH" | "BEARISH" | "NEUTRAL" | undefined,
        audNetPositions: formData.audNetPositions ? Number(formData.audNetPositions) : undefined,
        audPositionChange: formData.audPositionChange ? Number(formData.audPositionChange) : undefined,
        audSignal: (formData.audSignal || undefined) as "BULLISH" | "BEARISH" | "NEUTRAL" | undefined,
        cadNetPositions: formData.cadNetPositions ? Number(formData.cadNetPositions) : undefined,
        cadPositionChange: formData.cadPositionChange ? Number(formData.cadPositionChange) : undefined,
        cadSignal: (formData.cadSignal || undefined) as "BULLISH" | "BEARISH" | "NEUTRAL" | undefined,
        nzdNetPositions: formData.nzdNetPositions ? Number(formData.nzdNetPositions) : undefined,
        nzdPositionChange: formData.nzdPositionChange ? Number(formData.nzdPositionChange) : undefined,
        nzdSignal: (formData.nzdSignal || undefined) as "BULLISH" | "BEARISH" | "NEUTRAL" | undefined,
        extremePositioningAlert: formData.extremePositioningAlert || undefined,
        usdBias: formData.usdBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        usdReason: formData.usdReason || undefined,
        eurBias: formData.eurBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        eurReason: formData.eurReason || undefined,
        gbpBias: formData.gbpBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        gbpReason: formData.gbpReason || undefined,
        jpyBias: formData.jpyBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        jpyReason: formData.jpyReason || undefined,
        cadBias: formData.cadBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        cadReason: formData.cadReason || undefined,
        audBias: formData.audBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        audReason: formData.audReason || undefined,
        chfBias: formData.chfBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        chfReason: formData.chfReason || undefined,
        nzdBias: formData.nzdBias as "BULLISH" | "BEARISH" | "NEUTRAL",
        nzdReason: formData.nzdReason || undefined,
        trade1Pair: formData.trade1Pair || undefined,
        trade1Direction: (formData.trade1Direction || undefined) as "LONG" | "SHORT" | undefined,
        trade1Reason: formData.trade1Reason || undefined,
        trade1KeyLevel: formData.trade1KeyLevel || undefined,
        trade1Invalidation: formData.trade1Invalidation || undefined,
        trade2Pair: formData.trade2Pair || undefined,
        trade2Direction: (formData.trade2Direction || undefined) as "LONG" | "SHORT" | undefined,
        trade2Reason: formData.trade2Reason || undefined,
        trade2KeyLevel: formData.trade2KeyLevel || undefined,
        trade2Invalidation: formData.trade2Invalidation || undefined,
        highRiskEvent1: formData.highRiskEvent1 || undefined,
        highRiskDate1: formData.highRiskDate1 || undefined,
        highRiskReason1: formData.highRiskReason1 || undefined,
        highRiskEvent2: formData.highRiskEvent2 || undefined,
        highRiskDate2: formData.highRiskDate2 || undefined,
        highRiskReason2: formData.highRiskReason2 || undefined,
        activeRisks: formData.activeRisks || undefined,
        potentialShockEvents: formData.potentialShockEvents || undefined,
        safeHavenBias: formData.safeHavenBias || undefined,
        confirmationOfBias: formData.confirmationOfBias || undefined,
        surprisingData: formData.surprisingData || undefined,
        missedAnalysis: formData.missedAnalysis || undefined,
        adjustmentsNextWeek: formData.adjustmentsNextWeek || undefined,
      });
      toast.success("Fundamental analysis saved!");
      router.push("/weekly");
    } catch (error) {
      toast.error("Failed to save fundamental analysis");
    }
  };

  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  const currentStepIndex = steps.findIndex((s) => s.id === activeStep);
  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/weekly">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Fundamental Analysis</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
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

              {activeStep === "macro" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Macro Overview</CardTitle>
                    <CardDescription>Overall market direction and sentiment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Risk Sentiment</Label>
                        <Select value={formData.overallRiskSentiment} onValueChange={(v) => update("overallRiskSentiment", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RISK_ON">Risk-On</SelectItem>
                            <SelectItem value="RISK_OFF">Risk-Off</SelectItem>
                            <SelectItem value="NEUTRAL">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>DXY Weekly Bias</Label>
                        <Select value={formData.dxyWeeklyBias} onValueChange={(v) => update("dxyWeeklyBias", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {biasOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>10yr Yield</Label>
                        <Input type="number" step="0.01" value={formData.us10yrYield} onChange={(e) => update("us10yrYield", e.target.value)} placeholder="%" />
                      </div>
                      <div className="space-y-2">
                        <Label>VIX Level</Label>
                        <Input type="number" step="0.1" value={formData.vixLevel} onChange={(e) => update("vixLevel", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>WTI Oil Price</Label>
                        <Input type="number" step="0.01" value={formData.wtiOil} onChange={(e) => update("wtiOil", e.target.value)} placeholder="$" />
                      </div>
                      <div className="space-y-2">
                        <Label>Gold Direction</Label>
                        <Select value={formData.goldDirection} onValueChange={(v) => update("goldDirection", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UP">Up</SelectItem>
                            <SelectItem value="DOWN">Down</SelectItem>
                            <SelectItem value="FLAT">Flat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeStep === "events" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Events This Week</CardTitle>
                    <CardDescription>Scheduled events per day</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
                      <div key={day} className="space-y-2">
                        <Label className="uppercase text-xs font-semibold text-zinc-500">{day}</Label>
                        <Input value={(formData as any)[`${day}Events`]} onChange={(e) => update(`${day}Events`, e.target.value)} placeholder="Key events..." />
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Highest Impact Event</Label>
                      <Input value={formData.highestImpactEvent} onChange={(e) => update("highestImpactEvent", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Market Reaction</Label>
                      <Textarea value={formData.expectedMarketReaction} onChange={(e) => update("expectedMarketReaction", e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeStep === "centralbanks" && (
                <div className="space-y-6">
                  {[
                    { name: "Federal Reserve", prefix: "fed", rateLabel: "Current Rate (%)", hasProbs: true },
                    { name: "ECB", prefix: "ecb", toneField: true },
                    { name: "Bank of England", prefix: "boe", voteField: true },
                    { name: "Bank of Japan", prefix: "boj", yccField: true },
                  ].map((bank) => (
                    <Card key={bank.prefix}>
                      <CardHeader>
                        <CardTitle>{bank.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Meetings / Speeches</Label>
                          <Textarea value={(formData as any)[`${bank.prefix}MeetingsSpeeches`]} onChange={(e) => update(`${bank.prefix}MeetingsSpeeches`, e.target.value)} rows={2} />
                        </div>
                        {bank.prefix !== "boj" && (
                          <div className="space-y-2">
                            <Label>{bank.rateLabel || "Current Rate"}</Label>
                            <Input type="number" step="0.25" value={(formData as any)[`${bank.prefix}CurrentRate`]} onChange={(e) => update(`${bank.prefix}CurrentRate`, e.target.value)} />
                          </div>
                        )}
                        {bank.hasProbs && (
                          <>
                            <div className="space-y-2">
                              <Label>Market Expects</Label>
                              <Input value={formData.fedMarketExpects} onChange={(e) => update("fedMarketExpects", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Hold Probability %</Label>
                              <Input type="number" value={formData.fedHoldProbability} onChange={(e) => update("fedHoldProbability", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label>Cut Probability %</Label>
                              <Input type="number" value={formData.fedCutProbability} onChange={(e) => update("fedCutProbability", e.target.value)} />
                            </div>
                          </>
                        )}
                        {(bank as any).toneField && (
                          <div className="space-y-2">
                            <Label>ECB Tone</Label>
                            <Input value={formData.ecbTone} onChange={(e) => update("ecbTone", e.target.value)} placeholder="Hawkish / Dovish / Neutral" />
                          </div>
                        )}
                        {(bank as any).voteField && (
                          <div className="space-y-2">
                            <Label>Last Vote Split</Label>
                            <Input value={formData.boeVoteSplit} onChange={(e) => update("boeVoteSplit", e.target.value)} placeholder="e.g. 7-2" />
                          </div>
                        )}
                        {(bank as any).yccField && (
                          <div className="space-y-2">
                            <Label>YCC / Policy Status</Label>
                            <Input value={formData.yccStatus} onChange={(e) => update("yccStatus", e.target.value)} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeStep === "inflation" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Inflation & Growth Data</CardTitle>
                    <CardDescription>Key economic indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    {[
                      { label: "U.S. CPI YoY", key: "usCPIHeadline", prior: "usCPIHeadlinePrior", trend: "usCPIHeadlineTrend" },
                      { label: "Core CPI YoY", key: "usCoreCPI", prior: "usCoreCPIPrior", trend: "usCoreCPITrend" },
                      { label: "Core PCE YoY", key: "corePCE", prior: "corePCEPrior", trend: "corePCETrend" },
                    ].map((item) => (
                      <div key={item.key} className="space-y-3">
                        <Label className="text-xs font-semibold">{item.label}</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" step="0.01" placeholder="Last" value={(formData as any)[item.key]} onChange={(e) => update(item.key, e.target.value)} />
                          <Input type="number" step="0.01" placeholder="Prior" value={(formData as any)[item.prior]} onChange={(e) => update(item.prior, e.target.value)} />
                        </div>
                        <Select value={(formData as any)[item.trend]} onValueChange={(v) => update(item.trend, v)}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Trend" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RISING">Rising</SelectItem>
                            <SelectItem value="FALLING">Falling</SelectItem>
                            <SelectItem value="STICKY">Sticky</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>NFP Jobs (K)</Label>
                      <Input type="number" value={formData.nfpJobsAdded} onChange={(e) => update("nfpJobsAdded", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>NFP Prior (K)</Label>
                      <Input type="number" value={formData.nfpPrior} onChange={(e) => update("nfpPrior", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Unemployment Rate %</Label>
                      <Input type="number" step="0.1" value={formData.unemploymentRate} onChange={(e) => update("unemploymentRate", e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Inflation Narrative</Label>
                      <Textarea value={formData.inflationNarrative} onChange={(e) => update("inflationNarrative", e.target.value)} rows={2} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Growth Narrative</Label>
                      <Textarea value={formData.growthNarrative} onChange={(e) => update("growthNarrative", e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeStep === "cot" && (
                <Card>
                  <CardHeader>
                    <CardTitle>COT Report Analysis</CardTitle>
                    <CardDescription>Institutional positioning data</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    {["EUR", "GBP", "JPY", "AUD", "CAD", "NZD"].map((ccy) => {
                      const lc = ccy.toLowerCase();
                      return (
                        <div key={ccy} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{ccy}</Label>
                          <Input type="number" placeholder="Net positions" value={(formData as any)[`${lc}NetPositions`]} onChange={(e) => update(`${lc}NetPositions`, e.target.value)} />
                          <Input type="number" placeholder="Change" value={(formData as any)[`${lc}PositionChange`]} onChange={(e) => update(`${lc}PositionChange`, e.target.value)} />
                          <Select value={(formData as any)[`${lc}Signal`]} onValueChange={(v) => update(`${lc}Signal`, v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Signal" /></SelectTrigger>
                            <SelectContent>
                              {biasOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                    <div className="md:col-span-3 space-y-2">
                      <Label>Extreme Positioning Alert</Label>
                      <Textarea value={formData.extremePositioningAlert} onChange={(e) => update("extremePositioningAlert", e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeStep === "bias" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Currency Bias</CardTitle>
                    <CardDescription>Weekly bias for each major currency</CardDescription>
                  </CardHeader>
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
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{item.label}</Label>
                        <Select value={(formData as any)[item.bias]} onValueChange={(v) => update(item.bias, v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {biasOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="Reason" value={(formData as any)[item.reason]} onChange={(e) => update(item.reason, e.target.value)} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {activeStep === "trades" && (
                <div className="space-y-6">
                  {[1, 2].map((n) => (
                    <Card key={n}>
                      <CardHeader>
                        <CardTitle>Trade Idea {n}</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Pair</Label>
                          <Input placeholder="EUR/USD" value={(formData as any)[`trade${n}Pair`]} onChange={(e) => update(`trade${n}Pair`, e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Direction</Label>
                          <Select value={(formData as any)[`trade${n}Direction`]} onValueChange={(v) => update(`trade${n}Direction`, v)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LONG">Long</SelectItem>
                              <SelectItem value="SHORT">Short</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Fundamental Reason</Label>
                          <Textarea value={(formData as any)[`trade${n}Reason`]} onChange={(e) => update(`trade${n}Reason`, e.target.value)} rows={2} />
                        </div>
                        <div className="space-y-2">
                          <Label>Key Level</Label>
                          <Input value={(formData as any)[`trade${n}KeyLevel`]} onChange={(e) => update(`trade${n}KeyLevel`, e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Invalidation</Label>
                          <Input value={(formData as any)[`trade${n}Invalidation`]} onChange={(e) => update(`trade${n}Invalidation`, e.target.value)} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Card>
                    <CardHeader>
                      <CardTitle>High-Risk Events — Avoid Trading</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[1, 2].map((n) => (
                        <div key={n} className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Event</Label>
                            <Input value={(formData as any)[`highRiskEvent${n}`]} onChange={(e) => update(`highRiskEvent${n}`, e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={(formData as any)[`highRiskDate${n}`]} onChange={(e) => update(`highRiskDate${n}`, e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input value={(formData as any)[`highRiskReason${n}`]} onChange={(e) => update(`highRiskReason${n}`, e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeStep === "review" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Geopolitical Watch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Active Risks</Label>
                        <Textarea value={formData.activeRisks} onChange={(e) => update("activeRisks", e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>Potential Shock Events</Label>
                        <Textarea value={formData.potentialShockEvents} onChange={(e) => update("potentialShockEvents", e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>Safe-Haven Bias</Label>
                        <Input value={formData.safeHavenBias} onChange={(e) => update("safeHavenBias", e.target.value)} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>End-of-Week Review</CardTitle>
                      <CardDescription>Fill after the week closes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Did data confirm or deny your bias?</Label>
                        <Textarea value={formData.confirmationOfBias} onChange={(e) => update("confirmationOfBias", e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>Key data that surprised you</Label>
                        <Textarea value={formData.surprisingData} onChange={(e) => update("surprisingData", e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>What did you miss?</Label>
                        <Textarea value={formData.missedAnalysis} onChange={(e) => update("missedAnalysis", e.target.value)} rows={2} />
                      </div>
                      <div className="space-y-2">
                        <Label>Adjustments for next week</Label>
                        <Textarea value={formData.adjustmentsNextWeek} onChange={(e) => update("adjustmentsNextWeek", e.target.value)} rows={2} />
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
                      Save Analysis
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}