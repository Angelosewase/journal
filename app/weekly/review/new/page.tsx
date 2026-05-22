"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, ChevronLeft, ChevronRight, CheckCircle2, Hash, ShieldCheck, BookOpen, Rocket } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "numbers",     label: "Numbers",     icon: Hash,        description: "P&L and trade statistics" },
  { id: "compliance",  label: "Compliance",  icon: ShieldCheck, description: "Trinity, POI quality & patience" },
  { id: "analysis",    label: "Analysis",    icon: BookOpen,    description: "Best/worst trades & lessons" },
  { id: "action",      label: "Action",      icon: Rocket,      description: "Priorities & mental state" },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function FlatTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full resize-none rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring" />
  );
}

function FlatInput({ value, onChange, placeholder, type = "text", step }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; step?: string;
}) {
  return (
    <input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-lg bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring" />
  );
}

function SliderRow({ label, value, onChange, max = 10 }: {
  label: string; value: string; onChange: (v: string) => void; max?: number;
}) {
  const num = Number(value) || 1;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tabular-nums">{num}<span className="text-sm font-normal text-muted-foreground">/{max}</span></span>
      </div>
      <input type="range" min={1} max={max} value={num} onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 rounded-full accent-foreground cursor-pointer" />
      <div className="flex justify-between text-[10px] text-muted-foreground/60"><span>Low</span><span>High</span></div>
    </div>
  );
}

function PercentSlider({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const num = Number(value) || 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tabular-nums">{num}<span className="text-sm font-normal text-muted-foreground">%</span></span>
      </div>
      <input type="range" min={0} max={100} step={5} value={num} onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 rounded-full accent-foreground cursor-pointer" />
      <div className="flex justify-between text-[10px] text-muted-foreground/60"><span>0%</span><span>100%</span></div>
    </div>
  );
}

function CounterInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  const num = Number(value) || 0;
  return (
    <div className="flex-1 space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(String(Math.max(0, num - 1)))}
          className="w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors text-base">−</button>
        <span className="text-2xl font-semibold tabular-nums w-8 text-center">{num}</span>
        <button type="button" onClick={() => onChange(String(num + 1))}
          className="w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors text-base">+</button>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3 space-y-0.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

// ─── Step: Numbers ────────────────────────────────────────────────────────────

function StepNumbers({ form, update, autoStats, profitFactor }: {
  form: any; update: (k: string, v: any) => void; autoStats: any; profitFactor: number;
}) {
  const winRate = autoStats.totalTrades > 0
    ? Math.round((autoStats.winningTrades / autoStats.totalTrades) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Auto-calculated summary */}
      <div className="space-y-3">
        <SectionLabel>Auto-calculated from trades</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatBlock label="Trades" value={autoStats.totalTrades} />
          <StatBlock label="Win Rate" value={`${winRate}%`} />
          <StatBlock label="P&L" value={`$${autoStats.totalPnl.toFixed(2)}`} />
          <StatBlock label="Profit Factor" value={profitFactor.toFixed(2)} />
        </div>
      </div>

      {/* Override / confirm */}
      <div className="space-y-3">
        <SectionLabel>Confirm or override</SectionLabel>
        <div className="flex gap-4 rounded-xl border bg-muted/20 p-4">
          <CounterInput label="Total"  value={form.totalTrades}   onChange={(v) => update("totalTrades", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="Won"    value={form.winningTrades} onChange={(v) => update("winningTrades", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="Lost"   value={form.losingTrades}  onChange={(v) => update("losingTrades", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>P&L breakdown</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total P&L ($)",  field: "totalPnl"    },
            { label: "Profit Factor",  field: "profitFactor"},
            { label: "Biggest Win ($)",field: "biggestWin"  },
            { label: "Biggest Loss ($)",field: "biggestLoss"},
            { label: "Avg Win ($)",    field: "avgWin"      },
            { label: "Avg Loss ($)",   field: "avgLoss"     },
          ].map(({ label, field }) => (
            <div key={field} className="space-y-1.5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <FlatInput type="number" step="0.01" value={form[field]} onChange={(v) => update(field, v)} placeholder="0.00" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Compliance ─────────────────────────────────────────────────────────

function StepCompliance({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <SectionLabel>Trinity Compliance</SectionLabel>
        <PercentSlider label="Clear Inducement"    value={form.inducementPercentage} onChange={(v) => update("inducementPercentage", v)} />
        <PercentSlider label="LTC Confirmation"    value={form.ltcPercentage}        onChange={(v) => update("ltcPercentage", v)} />
        <PercentSlider label="In Killzone"         value={form.killzonePercentage}   onChange={(v) => update("killzonePercentage", v)} />
        <SliderRow     label="Avg Trinity Score"   value={form.avgTrinityScore}      onChange={(v) => update("avgTrinityScore", v)} />
      </div>

      <div className="space-y-5">
        <SectionLabel>POI Quality</SectionLabel>
        <SliderRow label="Avg POI Score"           value={form.avgPoiQualityScore}   onChange={(v) => update("avgPoiQualityScore", v)} />
        <div className="flex gap-4 rounded-xl border bg-muted/20 p-4">
          <CounterInput label="Pristine / Clean"   value={form.pristineCleanSetups}  onChange={(v) => update("pristineCleanSetups", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="Questionable"       value={form.questionableSetups}   onChange={(v) => update("questionableSetups", v)} />
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/20">
          <Checkbox id="lossesOnLowQuality" checked={form.lossesOnLowQuality} onCheckedChange={(c) => update("lossesOnLowQuality", !!c)} className="mt-0.5" />
          <Label htmlFor="lossesOnLowQuality" className="text-sm cursor-pointer">Most losses came from low-quality setups</Label>
        </div>
      </div>

      <div className="space-y-5">
        <SectionLabel>Patience & Execution</SectionLabel>
        <SliderRow label="Patience Score"          value={form.patienceScore}        onChange={(v) => update("patienceScore", v)} />
        <SliderRow label="Inducement Recognition"  value={form.inducementRecognitionScore} onChange={(v) => update("inducementRecognitionScore", v)} />
        <div className="flex gap-4 rounded-xl border bg-muted/20 p-4">
          <CounterInput label="Forced Trades"      value={form.forcedTrades}         onChange={(v) => update("forcedTrades", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="Waited Trades"      value={form.waitedTrades}         onChange={(v) => update("waitedTrades", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="HTF Counter-trades" value={form.tradesAgainstHtf}     onChange={(v) => update("tradesAgainstHtf", v)} />
        </div>
        <div className="space-y-2">
          {[
            { id: "forcedTradesLostMore",  label: "Forced trades lost more than waited trades" },
            { id: "thoseLostMore",         label: "Counter-HTF trades lost more" },
            { id: "skippedObviousSetups",  label: "Skipped obvious setups I should have taken" },
          ].map(({ id, label }) => (
            <div key={id} className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
              <Checkbox id={id} checked={form[id]} onCheckedChange={(c) => update(id, !!c)} />
              <Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Analysis ───────────────────────────────────────────────────────────

function StepAnalysis({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Best Trade</SectionLabel>
        <FlatTextarea value={form.bestTradeDescription} onChange={(v) => update("bestTradeDescription", v)} placeholder="Describe the setup, entry, and how it played out…" rows={3} />
        <FlatTextarea value={form.whyBestWorked} onChange={(v) => update("whyBestWorked", v)} placeholder="Why did it work? What did you do right?" rows={2} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Worst Trade</SectionLabel>
        <FlatTextarea value={form.worstTradeDescription} onChange={(v) => update("worstTradeDescription", v)} placeholder="Describe the setup, entry, and what happened…" rows={3} />
        <FlatTextarea value={form.whyWorstFailed} onChange={(v) => update("whyWorstFailed", v)} placeholder="Why did it fail? What rule was broken?" rows={2} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Lessons</SectionLabel>
        <FlatTextarea value={form.biggestLessonMarket} onChange={(v) => update("biggestLessonMarket", v)} placeholder="Biggest lesson about the market this week…" rows={2} />
        <FlatTextarea value={form.biggestLessonSelf} onChange={(v) => update("biggestLessonSelf", v)} placeholder="Biggest lesson about yourself as a trader…" rows={2} />
        <FlatTextarea value={form.adjustmentNextWeek} onChange={(v) => update("adjustmentNextWeek", v)} placeholder="What will you do differently next week?" rows={2} />
      </div>

      <div className="space-y-4">
        <SectionLabel>Skill Scores</SectionLabel>
        <SliderRow label="POI Identification"    value={form.poiIdentificationScore}    onChange={(v) => update("poiIdentificationScore", v)} />
        <SliderRow label="Inducement Recognition" value={form.inducementRecognitionScore2} onChange={(v) => update("inducementRecognitionScore2", v)} />
        <SliderRow label="Entry Execution"       value={form.entryExecutionScore}       onChange={(v) => update("entryExecutionScore", v)} />
        <SliderRow label="Risk Management"       value={form.riskManagementScore}       onChange={(v) => update("riskManagementScore", v)} />
        <SliderRow label="Overall Setup Quality" value={form.overallSetupQualityScore}  onChange={(v) => update("overallSetupQualityScore", v)} />
      </div>
    </div>
  );
}

// ─── Step: Action ─────────────────────────────────────────────────────────────

function StepAction({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Top Priority Next Week</SectionLabel>
        <FlatInput value={form.topPriorityImprovement} onChange={(v) => update("topPriorityImprovement", v)} placeholder="e.g. Only trade pristine POIs" />
      </div>

      <div className="space-y-2">
        <SectionLabel>Specific Action</SectionLabel>
        <FlatTextarea value={form.specificActionToImprove} onChange={(v) => update("specificActionToImprove", v)} placeholder="Exactly how will you implement the priority above?" rows={3} />
      </div>

      <div className="space-y-2">
        <SectionLabel>Success Metric</SectionLabel>
        <FlatInput value={form.successMetric} onChange={(v) => update("successMetric", v)} placeholder="How will you know you succeeded? (measurable)" />
      </div>

      <SliderRow label="Confidence for Next Week" value={form.confidenceNextWeek} onChange={(v) => update("confidenceNextWeek", v)} />

      <div className="space-y-5">
        <SectionLabel>Mental & Emotional</SectionLabel>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">How are you feeling going into next week?</p>
          <FlatInput value={form.howFeeling} onChange={(v) => update("howFeeling", v)} placeholder="disciplined / frustrated / calm / confident…" />
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-muted/20">
          <Checkbox id="emotionsAffectedTrading" checked={form.emotionsAffectedTrading} onCheckedChange={(c) => update("emotionsAffectedTrading", !!c)} />
          <Label htmlFor="emotionsAffectedTrading" className="text-sm cursor-pointer">
            Emotions noticeably affected my trading this week
          </Label>
        </div>
        <SliderRow label="Readiness Score" value={form.readinessScore} onChange={(v) => update("readinessScore", v)} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
    const d = new Date(t.createdAt).toISOString().split("T")[0];
    return d >= weekStartStr && d <= weekEndStr;
  }) || [];

  const wins = weekTrades.filter((t) => t.winLossStatus === "WIN");
  const losses = weekTrades.filter((t) => t.winLossStatus === "LOSS");
  const autoStats = {
    totalTrades: weekTrades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    totalPnl: weekTrades.reduce((s, t) => s + (t.pnl || 0), 0),
    biggestWin: wins.length ? Math.max(...wins.map((t) => t.pnl || 0)) : 0,
    biggestLoss: losses.length ? Math.min(...losses.map((t) => t.pnl || 0)) : 0,
    avgWin: wins.length ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0,
    avgLoss: losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length) : 0,
  };
  const profitFactor = autoStats.avgLoss > 0 ? autoStats.avgWin / autoStats.avgLoss : 0;

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    weekStart: weekStartStr, weekEnd: weekEndStr,
    totalTrades: String(autoStats.totalTrades),
    winningTrades: String(autoStats.winningTrades),
    losingTrades: String(autoStats.losingTrades),
    totalPnl: autoStats.totalPnl.toFixed(2),
    biggestWin: autoStats.biggestWin.toFixed(2),
    biggestLoss: autoStats.biggestLoss.toFixed(2),
    avgWin: autoStats.avgWin.toFixed(2),
    avgLoss: autoStats.avgLoss.toFixed(2),
    profitFactor: profitFactor.toFixed(2),
    inducementPercentage: "100", ltcPercentage: "100", killzonePercentage: "100",
    avgTrinityScore: "8", tradesAgainstHtf: "0", thoseLostMore: false,
    narrativeAbilityScore: "8", avgPoiQualityScore: "7",
    pristineCleanSetups: "0", questionableSetups: "0", lossesOnLowQuality: false,
    inducementRecognitionScore: "7", prematureEntries: "0", prematureEntryCost: "0",
    forcedTrades: "0", waitedTrades: String(autoStats.totalTrades),
    forcedTradesLostMore: false, patienceScore: "8", skippedObviousSetups: false,
    bestTradeDescription: "", whyBestWorked: "",
    worstTradeDescription: "", whyWorstFailed: "",
    biggestLessonMarket: "", biggestLessonSelf: "", adjustmentNextWeek: "",
    poiIdentificationScore: "7", inducementRecognitionScore2: "7",
    entryExecutionScore: "7", riskManagementScore: "7", overallSetupQualityScore: "7",
    topPriorityImprovement: "", specificActionToImprove: "", successMetric: "",
    confidenceNextWeek: "8", howFeeling: "", emotionsAffectedTrading: false, readinessScore: "8",
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      await createReview({
        weekStart: form.weekStart, weekEnd: form.weekEnd,
        totalTrades: Number(form.totalTrades), winningTrades: Number(form.winningTrades),
        losingTrades: Number(form.losingTrades), totalPnl: Number(form.totalPnl),
        biggestWin: Number(form.biggestWin), biggestLoss: Number(form.biggestLoss),
        avgWin: Number(form.avgWin), avgLoss: Number(form.avgLoss),
        profitFactor: Number(form.profitFactor),
        inducementPercentage: Number(form.inducementPercentage),
        ltcPercentage: Number(form.ltcPercentage),
        killzonePercentage: Number(form.killzonePercentage),
        avgTrinityScore: Number(form.avgTrinityScore),
        tradesAgainstHtf: Number(form.tradesAgainstHtf),
        thoseLostMore: form.thoseLostMore,
        narrativeAbilityScore: Number(form.narrativeAbilityScore),
        avgPoiQualityScore: Number(form.avgPoiQualityScore),
        pristineCleanSetups: Number(form.pristineCleanSetups),
        questionableSetups: Number(form.questionableSetups),
        lossesOnLowQuality: form.lossesOnLowQuality,
        inducementRecognitionScore: Number(form.inducementRecognitionScore),
        prematureEntries: Number(form.prematureEntries),
        prematureEntryCost: Number(form.prematureEntryCost),
        forcedTrades: Number(form.forcedTrades),
        waitedTrades: Number(form.waitedTrades),
        forcedTradesLostMore: form.forcedTradesLostMore,
        patienceScore: Number(form.patienceScore),
        skippedObviousSetups: form.skippedObviousSetups,
        bestTradeDescription: form.bestTradeDescription || undefined,
        whyBestWorked: form.whyBestWorked || undefined,
        worstTradeDescription: form.worstTradeDescription || undefined,
        whyWorstFailed: form.whyWorstFailed || undefined,
        biggestLessonMarket: form.biggestLessonMarket || undefined,
        biggestLessonSelf: form.biggestLessonSelf || undefined,
        adjustmentNextWeek: form.adjustmentNextWeek || undefined,
        poiIdentificationScore: Number(form.poiIdentificationScore),
        inducementRecognitionScore2: Number(form.inducementRecognitionScore2),
        entryExecutionScore: Number(form.entryExecutionScore),
        riskManagementScore: Number(form.riskManagementScore),
        overallSetupQualityScore: Number(form.overallSetupQualityScore),
        topPriorityImprovement: form.topPriorityImprovement,
        specificActionToImprove: form.specificActionToImprove,
        successMetric: form.successMetric,
        confidenceNextWeek: Number(form.confidenceNextWeek),
        howFeeling: form.howFeeling || undefined,
        emotionsAffectedTrading: form.emotionsAffectedTrading || undefined,
        readinessScore: Number(form.readinessScore),
      });
      toast.success("Weekly review saved!");
      router.push("/weekly");
    } catch {
      toast.error("Failed to save weekly review");
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  const stepComponents = [
    <StepNumbers    key="numbers"    form={form} update={update} autoStats={autoStats} profitFactor={profitFactor} />,
    <StepCompliance key="compliance" form={form} update={update} />,
    <StepAnalysis   key="analysis"   form={form} update={update} />,
    <StepAction     key="action"     form={form} update={update} />,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/weekly"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Weekly Review</h1>
          <p className="text-xs text-muted-foreground">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Step rail */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <button key={step.id} type="button" onClick={() => setCurrentStep(i)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                active ? "bg-foreground text-background" : done ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
        <div className="flex-1 h-px bg-border ml-1" />
        <span className="text-xs text-muted-foreground tabular-nums">{currentStep + 1}/{STEPS.length}</span>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 min-h-[400px]">
        <div className="mb-6">
          <h2 className="text-base font-semibold">{STEPS[currentStep].label}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
        </div>
        {stepComponents[currentStep]}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm"
          onClick={() => currentStep === 0 ? router.push("/weekly") : setCurrentStep(currentStep - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>
        {isLastStep ? (
          <Button size="sm" onClick={handleSubmit} className="gap-2">
            <Save className="h-3.5 w-3.5" />Save Review
          </Button>
        ) : (
          <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}