"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Hash,
  ShieldCheck,
  BookOpen,
  Rocket,
  Sparkles,
  RefreshCw,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  computeWeeklyReviewStats,
  getCurrentWeekStart,
  getWeekEnd,
  weeklyStatsToFormValues,
  type WeeklyReviewStats,
} from "@/lib/weekly-review";

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "numbers",     label: "Numbers",     icon: Hash,        description: "P&L and trade statistics" },
  { id: "compliance",  label: "Compliance",  icon: ShieldCheck, description: "Trinity, POI quality & patience" },
  { id: "analysis",    label: "Analysis",    icon: BookOpen,    description: "Best/worst trades & lessons" },
  { id: "action",      label: "Action",      icon: Rocket,      description: "Priorities & mental state" },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionLabel({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {children}
      </p>
      {hint}
    </div>
  );
}

function AutoBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
      <Sparkles className="h-2.5 w-2.5" />
      Auto
    </span>
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

function StatBlock({ label, value, tone }: { label: string; value: string | number; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3 space-y-0.5">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={cn(
        "text-lg font-semibold tabular-nums",
        tone === "pos" && "text-emerald-600 dark:text-emerald-400",
        tone === "neg" && "text-red-500",
      )}>{value}</p>
    </div>
  );
}

function fmtMoney(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

// ─── Trades preview ─────────────────────────────────────────────────────────

function TradesPreview({ stats }: { stats: WeeklyReviewStats }) {
  if (!stats.hasTrades) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/20 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">No trades logged for this week yet</p>
          <p className="text-xs text-muted-foreground">
            Stats will auto-fill from any trades dated {stats.weekStart} – {stats.weekEnd}. You can
            still enter the numbers manually below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {stats.totalTrades} trade{stats.totalTrades !== 1 ? "s" : ""} this week
        </p>
        <p className="text-[11px] text-muted-foreground">Pulled from your journal</p>
      </div>
      <div className="max-h-56 divide-y overflow-y-auto">
        {stats.rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                r.status === "WIN"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : r.status === "LOSS"
                    ? "bg-red-500/10 text-red-500"
                    : "bg-zinc-500/10 text-zinc-500",
              )}
            >
              {r.status === "WIN" ? "W" : r.status === "LOSS" ? "L" : "BE"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {r.instrument}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  {r.direction === "LONG" ? "Long" : "Short"} · {r.sessionLabel}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                {r.quality != null && ` · Q${r.quality}`}
                {r.finalRR != null && ` · ${r.finalRR.toFixed(1)}R`}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                r.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
              )}
            >
              {fmtMoney(r.pnl)}
            </span>
          </div>
        ))}
      </div>
      {stats.sessionBreakdown.length > 1 && (
        <div className="flex flex-wrap gap-2 border-t bg-muted/10 px-3 py-2">
          {stats.sessionBreakdown.map((s) => (
            <span key={s.session} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[11px]">
              <span className="font-medium">{s.label}</span>
              <span className="text-muted-foreground">{s.trades}t · {s.winRate}%</span>
              <span className={cn("font-semibold tabular-nums", s.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                {fmtMoney(s.pnl)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step: Numbers ────────────────────────────────────────────────────────────

function StepNumbers({ form, update, stats, onResync }: {
  form: any; update: (k: string, v: any) => void; stats: WeeklyReviewStats; onResync: () => void;
}) {
  const totalPnl = Number(form.totalPnl) || 0;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel
          hint={stats.hasTrades ? (
            <button type="button" onClick={onResync} className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <RefreshCw className="h-3 w-3" />
              Re-sync from trades
            </button>
          ) : undefined}
        >
          Auto-calculated from trades
        </SectionLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatBlock label="Trades" value={Number(form.totalTrades) || 0} />
          <StatBlock label="Win Rate" value={`${stats.winRate}%`} />
          <StatBlock label="Net P&L" value={fmtMoney(totalPnl)} tone={totalPnl >= 0 ? "pos" : "neg"} />
          <StatBlock label="Profit Factor" value={(Number(form.profitFactor) || 0).toFixed(2)} />
        </div>
      </div>

      <TradesPreview stats={stats} />

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
        <SectionLabel hint={<AutoBadge />}>P&L breakdown</SectionLabel>
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
        <SectionLabel hint={<AutoBadge />}>Trinity Compliance</SectionLabel>
        <PercentSlider label="Clear Inducement"    value={form.inducementPercentage} onChange={(v) => update("inducementPercentage", v)} />
        <PercentSlider label="LTC Confirmation"    value={form.ltcPercentage}        onChange={(v) => update("ltcPercentage", v)} />
        <PercentSlider label="In Killzone"         value={form.killzonePercentage}   onChange={(v) => update("killzonePercentage", v)} />
        <SliderRow     label="Avg Trinity Score"   value={form.avgTrinityScore}      onChange={(v) => update("avgTrinityScore", v)} />
      </div>

      <div className="space-y-5">
        <SectionLabel hint={<AutoBadge />}>POI Quality</SectionLabel>
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
        <SectionLabel hint={<AutoBadge />}>Patience & Execution</SectionLabel>
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

function StepAnalysis({ form, update, stats }: { form: any; update: (k: string, v: any) => void; stats: WeeklyReviewStats }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel hint={stats.bestTradeDescription ? <AutoBadge /> : undefined}>Best Trade</SectionLabel>
        <FlatTextarea value={form.bestTradeDescription} onChange={(v) => update("bestTradeDescription", v)} placeholder="Describe the setup, entry, and how it played out…" rows={2} />
        <FlatTextarea value={form.whyBestWorked} onChange={(v) => update("whyBestWorked", v)} placeholder="Why did it work? What did you do right?" rows={2} />
      </div>

      <div className="space-y-3">
        <SectionLabel hint={stats.worstTradeDescription ? <AutoBadge /> : undefined}>Worst Trade</SectionLabel>
        <FlatTextarea value={form.worstTradeDescription} onChange={(v) => update("worstTradeDescription", v)} placeholder="Describe the setup, entry, and what happened…" rows={2} />
        <FlatTextarea value={form.whyWorstFailed} onChange={(v) => update("whyWorstFailed", v)} placeholder="Why did it fail? What rule was broken?" rows={2} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Lessons</SectionLabel>
        <FlatTextarea value={form.biggestLessonMarket} onChange={(v) => update("biggestLessonMarket", v)} placeholder="Biggest lesson about the market this week…" rows={2} />
        <FlatTextarea value={form.biggestLessonSelf} onChange={(v) => update("biggestLessonSelf", v)} placeholder="Biggest lesson about yourself as a trader…" rows={2} />
        <FlatTextarea value={form.adjustmentNextWeek} onChange={(v) => update("adjustmentNextWeek", v)} placeholder="What will you do differently next week?" rows={2} />
      </div>

      <div className="space-y-4">
        <SectionLabel hint={<AutoBadge />}>Skill Scores</SectionLabel>
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

// ─── Defaults ─────────────────────────────────────────────────────────────────

function buildDefaults(weekStartStr: string, weekEndStr: string) {
  return {
    weekStart: weekStartStr, weekEnd: weekEndStr,
    totalTrades: "0", winningTrades: "0", losingTrades: "0",
    totalPnl: "0.00", biggestWin: "0.00", biggestLoss: "0.00",
    avgWin: "0.00", avgLoss: "0.00", profitFactor: "0.00",
    inducementPercentage: "0", ltcPercentage: "0", killzonePercentage: "0",
    avgTrinityScore: "5", tradesAgainstHtf: "0", thoseLostMore: false,
    narrativeAbilityScore: "7", avgPoiQualityScore: "5",
    pristineCleanSetups: "0", questionableSetups: "0", lossesOnLowQuality: false,
    inducementRecognitionScore: "5", prematureEntries: "0", prematureEntryCost: "0",
    forcedTrades: "0", waitedTrades: "0",
    forcedTradesLostMore: false, patienceScore: "7", skippedObviousSetups: false,
    bestTradeDescription: "", whyBestWorked: "",
    worstTradeDescription: "", whyWorstFailed: "",
    biggestLessonMarket: "", biggestLessonSelf: "", adjustmentNextWeek: "",
    poiIdentificationScore: "5", inducementRecognitionScore2: "5",
    entryExecutionScore: "5", riskManagementScore: "5", overallSetupQualityScore: "5",
    topPriorityImprovement: "", specificActionToImprove: "", successMetric: "",
    confidenceNextWeek: "7", howFeeling: "", emotionsAffectedTrading: false, readinessScore: "7",
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NewWeeklyReviewPage() {
  const trades = useQuery(api.trades.list);

  const weekStartStr = useMemo(() => getCurrentWeekStart(), []);
  const weekEndStr = useMemo(() => getWeekEnd(weekStartStr), [weekStartStr]);

  const stats = useMemo(
    () => computeWeeklyReviewStats(trades, weekStartStr, weekEndStr),
    [trades, weekStartStr, weekEndStr],
  );

  if (trades === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading this week&apos;s trades…</p>
      </div>
    );
  }

  return (
    <ReviewForm stats={stats} weekStartStr={weekStartStr} weekEndStr={weekEndStr} />
  );
}

function ReviewForm({ stats, weekStartStr, weekEndStr }: {
  stats: WeeklyReviewStats; weekStartStr: string; weekEndStr: string;
}) {
  const router = useRouter();
  const createReview = useMutation(api.weeklyReviews.create);

  const weekStart = useMemo(() => new Date(weekStartStr), [weekStartStr]);
  const weekEnd = useMemo(() => new Date(weekEndStr), [weekEndStr]);

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(() => ({
    ...buildDefaults(weekStartStr, weekEndStr),
    ...(stats.hasTrades ? (weeklyStatsToFormValues(stats) as Partial<ReturnType<typeof buildDefaults>>) : {}),
  }));

  const handleResync = () => {
    setForm((prev) => ({ ...prev, ...(weeklyStatsToFormValues(stats) as Partial<typeof prev>) }));
    toast.success("Re-synced numbers from this week's trades");
  };

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
    <StepNumbers    key="numbers"    form={form} update={update} stats={stats} onResync={handleResync} />,
    <StepCompliance key="compliance" form={form} update={update} />,
    <StepAnalysis   key="analysis"   form={form} update={update} stats={stats} />,
    <StepAction     key="action"     form={form} update={update} />,
  ];

  const netPnl = Number(form.totalPnl) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/weekly"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">Weekly Review</h1>
          <p className="text-xs text-muted-foreground">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1.5 text-xs">
          {netPnl >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className="font-medium tabular-nums">{stats.totalTrades} trades</span>
          <span className="text-muted-foreground">·</span>
          <span className={cn("font-semibold tabular-nums", netPnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
            {fmtMoney(netPnl)}
          </span>
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
