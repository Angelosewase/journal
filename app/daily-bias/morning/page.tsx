"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  BarChart2,
  Globe,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ContextBlock, type ScreenshotItem } from "@/components/ContextBlock";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = Record<string, any>;

// ─── Step config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: "bias",     label: "Bias",     icon: BarChart2, description: "Your directional read for today" },
  { id: "levels",   label: "Levels",   icon: Target,    description: "Key liquidity reference points" },
  { id: "sessions", label: "Sessions", icon: Clock,     description: "Per-session scenario planning" },
  { id: "plan",     label: "Plan",     icon: BookOpen,  description: "Instrument selection & rules" },
];

const EMPTY_FORM: FormData = {
  currentDailyBias: "NEUTRAL",
  biasConfidence: "5",
  biasReason: "",
  asiaHigh: "",
  asiaLow: "",
  previousDayHigh: "",
  previousDayLow: "",
  asiaExpectedBehavior: "",
  asiaLiquidityToWatch: "",
  londonExpectedBehavior: "",
  londonBreakoutExpectation: "",
  londonKeyLiquidity: "",
  nyExpectedBehavior: "",
  nyTargets: "",
  nyKeyLiquidity: "",
  bestInstrument: "",
  bestInstrumentReason: "",
  secondChoice: "",
  avoidInstrument: "",
  sessionToTrade: "LONDON",
  modelToFocus: "BOTH",
  minimumPoiQuality: "CLEAN",
  willTradeWithoutInducement: false,
  targetTrades: "",
  maxDailyLoss: "",
  confidenceForToday: "5",
};

// ─── Small primitives ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function NotionTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="resize-none border-0 bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring rounded-lg text-sm leading-relaxed placeholder:text-muted-foreground/50"
    />
  );
}

function NotionInput({
  value,
  onChange,
  placeholder,
  type = "text",
  step,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  return (
    <Input
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border-0 bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring rounded-lg text-sm"
    />
  );
}

function OptionPill({
  value,
  active,
  onClick,
  children,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const num = Number(value) || 1;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="text-2xl font-semibold tabular-nums">{num}<span className="text-sm font-normal text-muted-foreground">/10</span></span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={num}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 rounded-full accent-foreground cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>Low</span><span>High</span>
      </div>
    </div>
  );
}

function PriceInputPair({
  highLabel, highValue, onHighChange,
  lowLabel, lowValue, onLowChange,
}: {
  highLabel: string; highValue: string; onHighChange: (v: string) => void;
  lowLabel: string; lowValue: string; onLowChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex-1 space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{highLabel}</p>
        <input
          type="number"
          step="0.00001"
          value={highValue}
          onChange={(e) => onHighChange(e.target.value)}
          placeholder="0.00000"
          className="w-full bg-transparent text-base font-mono font-medium outline-none placeholder:text-muted-foreground/40 text-emerald-600 dark:text-emerald-400"
        />
      </div>
      <div className="w-px h-10 bg-border" />
      <div className="flex-1 space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{lowLabel}</p>
        <input
          type="number"
          step="0.00001"
          value={lowValue}
          onChange={(e) => onLowChange(e.target.value)}
          placeholder="0.00000"
          className="w-full bg-transparent text-base font-mono font-medium outline-none placeholder:text-muted-foreground/40 text-red-500 dark:text-red-400"
        />
      </div>
    </div>
  );
}

// ─── Step panels ──────────────────────────────────────────────────────────────

function StepBias({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  const biasOptions = [
    { value: "BULLISH", icon: <TrendingUp className="h-3.5 w-3.5" />, color: "data-[active=true]:!bg-emerald-500 data-[active=true]:!border-emerald-500 data-[active=true]:!text-white" },
    { value: "NEUTRAL", icon: <Minus className="h-3.5 w-3.5" />, color: "" },
    { value: "BEARISH", icon: <TrendingDown className="h-3.5 w-3.5" />, color: "data-[active=true]:!bg-red-500 data-[active=true]:!border-red-500 data-[active=true]:!text-white" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Direction</SectionLabel>
        <div className="flex gap-2">
          {biasOptions.map(({ value, icon, color }) => (
            <button
              key={value}
              type="button"
              data-active={form.currentDailyBias === value}
              onClick={() => update("currentDailyBias", value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-150",
                "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                form.currentDailyBias === value ? "bg-foreground text-background border-foreground" : "",
                color
              )}
            >
              {icon}
              {value}
            </button>
          ))}
        </div>
      </div>

      <SliderRow label="Conviction Level" value={form.biasConfidence} onChange={(v) => update("biasConfidence", v)} />

      <div className="space-y-2">
        <SectionLabel>Why do you have this bias?</SectionLabel>
        <NotionTextarea
          value={form.biasReason}
          onChange={(v) => update("biasReason", v)}
          placeholder="Describe the market structure, recent price action, news catalysts, or confluence factors driving your bias today…"
          rows={5}
        />
      </div>
    </div>
  );
}

function StepLevels({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Asia Range</SectionLabel>
        <PriceInputPair
          highLabel="Asia High"   highValue={form.asiaHigh}      onHighChange={(v) => update("asiaHigh", v)}
          lowLabel="Asia Low"     lowValue={form.asiaLow}        onLowChange={(v) => update("asiaLow", v)}
        />
      </div>

      <div className="space-y-3">
        <SectionLabel>Previous Day</SectionLabel>
        <PriceInputPair
          highLabel="PDH"   highValue={form.previousDayHigh}   onHighChange={(v) => update("previousDayHigh", v)}
          lowLabel="PDL"    lowValue={form.previousDayLow}     onLowChange={(v) => update("previousDayLow", v)}
        />
      </div>

      <div className="space-y-2">
        <SectionLabel>Asia Liquidity to Watch</SectionLabel>
        <NotionTextarea
          value={form.asiaLiquidityToWatch}
          onChange={(v) => update("asiaLiquidityToWatch", v)}
          placeholder="Which EQH/EQL, buyside or sellside pools are most relevant? Any swept levels to note?"
          rows={3}
        />
      </div>
    </div>
  );
}

function StepSessions({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  const sessionData = [
    {
      key: "ASIA",
      behaviorField: "asiaExpectedBehavior",
      notesField: "asiaLiquidityToWatch",
      behaviorPlaceholder: "Range, sweep highs/lows, consolidate…",
      color: "text-violet-500",
    },
    {
      key: "LONDON",
      behaviorField: "londonExpectedBehavior",
      notesField: "londonKeyLiquidity",
      behaviorPlaceholder: "Break Asia range, trend continuation, reversal…",
      color: "text-blue-500",
    },
    {
      key: "NEW YORK",
      behaviorField: "nyExpectedBehavior",
      notesField: "nyTargets",
      behaviorPlaceholder: "Confirm London move, hunt liquidity, consolidate…",
      color: "text-amber-500",
    },
  ];

  const sessionOptions = ["ASIA", "LONDON", "NY", "MULTIPLE"];

  return (
    <div className="space-y-8">
      {sessionData.map(({ key, behaviorField, notesField, behaviorPlaceholder, color }) => (
        <div key={key} className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className={cn("h-3.5 w-3.5", color)} />
            <SectionLabel>{key}</SectionLabel>
          </div>
          <NotionTextarea
            value={form[behaviorField]}
            onChange={(v) => update(behaviorField, v)}
            placeholder={behaviorPlaceholder}
            rows={2}
          />
          {key === "LONDON" && (
            <NotionInput
              value={form.londonBreakoutExpectation}
              onChange={(v) => update("londonBreakoutExpectation", v)}
              placeholder="Breakout expectation (e.g. break above 1.2680)"
            />
          )}
          {key !== "ASIA" && (
            <NotionInput
              value={form[notesField]}
              onChange={(v) => update(notesField, v)}
              placeholder={key === "LONDON" ? "Key liquidity levels for London" : "NY targets"}
            />
          )}
        </div>
      ))}

      <div className="space-y-3">
        <SectionLabel>Which session will you trade?</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {sessionOptions.map((s) => (
            <OptionPill key={s} value={s} active={form.sessionToTrade === s} onClick={() => update("sessionToTrade", s)}>
              {s}
            </OptionPill>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPlan({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Instrument Selection</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Best Pick", field: "bestInstrument", placeholder: "e.g. GBP/USD" },
            { label: "2nd Choice", field: "secondChoice", placeholder: "e.g. EUR/USD" },
            { label: "Avoid",      field: "avoidInstrument", placeholder: "e.g. USD/JPY" },
          ].map(({ label, field, placeholder }) => (
            <div key={field} className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
              <NotionInput value={form[field]} onChange={(v) => update(field, v)} placeholder={placeholder} />
            </div>
          ))}
        </div>
        <NotionTextarea
          value={form.bestInstrumentReason}
          onChange={(v) => update("bestInstrumentReason", v)}
          placeholder="Why this instrument today? Spread, volatility, clean structure, news alignment…"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <SectionLabel>Model & POI Quality</SectionLabel>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Model focus</p>
            <div className="flex gap-2">
              {["CONTINUATION", "REVERSAL", "BOTH"].map((v) => (
                <OptionPill key={v} value={v} active={form.modelToFocus === v} onClick={() => update("modelToFocus", v)}>
                  {v}
                </OptionPill>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Minimum POI quality to trade</p>
            <div className="flex gap-2">
              {["PRISTINE", "CLEAN", "ACCEPTABLE"].map((v) => (
                <OptionPill key={v} value={v} active={form.minimumPoiQuality === v} onClick={() => update("minimumPoiQuality", v)}>
                  {v}
                </OptionPill>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Risk Parameters</SectionLabel>
        <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
          <div className="flex-1 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Target Trades</p>
            <input
              type="number"
              value={form.targetTrades}
              onChange={(e) => update("targetTrades", e.target.value)}
              placeholder="2"
              className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground/30"
            />
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex-1 space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Max Daily Loss ($)</p>
            <input
              type="number"
              step="0.01"
              value={form.maxDailyLoss}
              onChange={(e) => update("maxDailyLoss", e.target.value)}
              placeholder="50"
              className="w-full bg-transparent text-2xl font-semibold outline-none placeholder:text-muted-foreground/30"
            />
          </div>
        </div>
      </div>

      <SliderRow label="Overall Confidence Today" value={form.confidenceForToday} onChange={(v) => update("confidenceForToday", v)} />

      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
        <Checkbox
          id="willTradeWithoutInducement"
          checked={form.willTradeWithoutInducement}
          onCheckedChange={(checked) => update("willTradeWithoutInducement", !!checked)}
          className="mt-0.5"
        />
        <div>
          <Label htmlFor="willTradeWithoutInducement" className="text-sm font-medium cursor-pointer">
            Trade without clear inducement
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">Not recommended — only check if you have strong confluence to compensate</p>
        </div>
      </div>
    </div>
  );
}

// ─── View mode ────────────────────────────────────────────────────────────────

function ViewRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex gap-4 py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function ViewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
      <div>{children}</div>
    </div>
  );
}

function BiasViewCard({ todayBias }: { todayBias: any }) {
  return (
    <div className="space-y-8">
      {/* Bias + confidence inline */}
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-semibold">{todayBias.currentDailyBias}</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">{todayBias.biasConfidence}/10 conviction</span>
      </div>

      {todayBias.biasReason && (
        <p className="text-sm leading-relaxed text-muted-foreground">{todayBias.biasReason}</p>
      )}

      <ViewSection title="Levels">
        <ViewRow label="Asia High" value={todayBias.asiaHigh} />
        <ViewRow label="Asia Low" value={todayBias.asiaLow} />
        <ViewRow label="Prev Day High" value={todayBias.previousDayHigh} />
        <ViewRow label="Prev Day Low" value={todayBias.previousDayLow} />
        <ViewRow label="Asia Liquidity" value={todayBias.asiaLiquidityToWatch} />
      </ViewSection>

      <ViewSection title="Sessions">
        <ViewRow label="Asia" value={todayBias.asiaExpectedBehavior} />
        <ViewRow label="London" value={todayBias.londonExpectedBehavior} />
        <ViewRow label="London Breakout" value={todayBias.londonBreakoutExpectation} />
        <ViewRow label="London Liquidity" value={todayBias.londonKeyLiquidity} />
        <ViewRow label="New York" value={todayBias.nyExpectedBehavior} />
        <ViewRow label="NY Targets" value={todayBias.nyTargets} />
        <ViewRow label="Session to Trade" value={todayBias.sessionToTrade} />
      </ViewSection>

      <ViewSection title="Plan">
        <ViewRow label="Best Instrument" value={todayBias.bestInstrument} />
        <ViewRow label="Reason" value={todayBias.bestInstrumentReason} />
        <ViewRow label="2nd Choice" value={todayBias.secondChoice} />
        <ViewRow label="Avoid" value={todayBias.avoidInstrument} />
        <ViewRow label="Model" value={todayBias.modelToFocus} />
        <ViewRow label="Min POI Quality" value={todayBias.minimumPoiQuality} />
        <ViewRow label="Target Trades" value={todayBias.targetTrades} />
        <ViewRow label="Max Daily Loss" value={todayBias.maxDailyLoss ? `$${todayBias.maxDailyLoss}` : null} />
        <ViewRow label="Confidence" value={`${todayBias.confidenceForToday}/10`} />
        {todayBias.willTradeWithoutInducement && (
          <ViewRow label="No Inducement" value="Yes" />
        )}
      </ViewSection>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MorningBiasPage() {
  const router = useRouter();
  const dailyBiases = useQuery(api.dailyBias.list);
  const createBias = useMutation(api.dailyBias.create);
  const updateBias = useMutation(api.dailyBias.update);
  const removeBias = useMutation(api.dailyBias.remove);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [morningContextNotes, setMorningContextNotes] = useState("");
  const [morningScreenshots, setMorningScreenshots] = useState<ScreenshotItem[]>([]);

  useEffect(() => {
    if (todayBias) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate edit form from query
      setFormData({
        currentDailyBias: todayBias.currentDailyBias || "NEUTRAL",
        biasConfidence: String(todayBias.biasConfidence ?? 5),
        biasReason: todayBias.biasReason || "",
        asiaHigh: String(todayBias.asiaHigh ?? ""),
        asiaLow: String(todayBias.asiaLow ?? ""),
        previousDayHigh: String(todayBias.previousDayHigh ?? ""),
        previousDayLow: String(todayBias.previousDayLow ?? ""),
        asiaExpectedBehavior: todayBias.asiaExpectedBehavior || "",
        asiaLiquidityToWatch: todayBias.asiaLiquidityToWatch || "",
        londonExpectedBehavior: todayBias.londonExpectedBehavior || "",
        londonBreakoutExpectation: todayBias.londonBreakoutExpectation || "",
        londonKeyLiquidity: todayBias.londonKeyLiquidity || "",
        nyExpectedBehavior: todayBias.nyExpectedBehavior || "",
        nyTargets: todayBias.nyTargets || "",
        nyKeyLiquidity: todayBias.nyKeyLiquidity || "",
        bestInstrument: todayBias.bestInstrument || "",
        bestInstrumentReason: todayBias.bestInstrumentReason || "",
        secondChoice: todayBias.secondChoice || "",
        avoidInstrument: todayBias.avoidInstrument || "",
        sessionToTrade: todayBias.sessionToTrade || "LONDON",
        modelToFocus: todayBias.modelToFocus || "BOTH",
        minimumPoiQuality: todayBias.minimumPoiQuality || "CLEAN",
        willTradeWithoutInducement: todayBias.willTradeWithoutInducement ?? false,
        targetTrades: String(todayBias.targetTrades ?? ""),
        maxDailyLoss: String(todayBias.maxDailyLoss ?? ""),
        confidenceForToday: String(todayBias.confidenceForToday ?? 5),
      });
      setMorningContextNotes(todayBias.morningContextNotes ?? "");
      setMorningScreenshots(todayBias.morningScreenshots ?? []);
    } else {
      setFormData(EMPTY_FORM);
      setMorningContextNotes("");
      setMorningScreenshots([]);
    }
  }, [todayBias]);

  const update = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      const data = {
        date: today,
        currentDailyBias: formData.currentDailyBias,
        biasConfidence: Number(formData.biasConfidence),
        biasReason: formData.biasReason,
        asiaHigh: formData.asiaHigh ? Number(formData.asiaHigh) : undefined,
        asiaLow: formData.asiaLow ? Number(formData.asiaLow) : undefined,
        previousDayHigh: formData.previousDayHigh ? Number(formData.previousDayHigh) : undefined,
        previousDayLow: formData.previousDayLow ? Number(formData.previousDayLow) : undefined,
        asiaExpectedBehavior: formData.asiaExpectedBehavior,
        asiaLiquidityToWatch: formData.asiaLiquidityToWatch,
        londonExpectedBehavior: formData.londonExpectedBehavior,
        londonBreakoutExpectation: formData.londonBreakoutExpectation,
        londonKeyLiquidity: formData.londonKeyLiquidity,
        nyExpectedBehavior: formData.nyExpectedBehavior,
        nyTargets: formData.nyTargets,
        nyKeyLiquidity: formData.nyKeyLiquidity,
        bestInstrument: formData.bestInstrument,
        bestInstrumentReason: formData.bestInstrumentReason,
        secondChoice: formData.secondChoice,
        avoidInstrument: formData.avoidInstrument,
        sessionToTrade: formData.sessionToTrade,
        modelToFocus: formData.modelToFocus,
        minimumPoiQuality: formData.minimumPoiQuality,
        willTradeWithoutInducement: formData.willTradeWithoutInducement,
        targetTrades: formData.targetTrades ? Number(formData.targetTrades) : undefined,
        maxDailyLoss: formData.maxDailyLoss ? Number(formData.maxDailyLoss) : undefined,
        confidenceForToday: Number(formData.confidenceForToday),
        morningContextNotes: morningContextNotes || undefined,
        morningScreenshots: morningScreenshots.length ? morningScreenshots : undefined,
      };

      if (todayBias?._id) {
        await updateBias({ id: todayBias._id, ...data });
      } else {
        await createBias(data);
      }
      toast.success("Daily pre-gameplan saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save morning bias");
    }
  };

  const handleDelete = async () => {
    if (todayBias?._id) {
      await removeBias({ id: todayBias._id });
      toast.success("Morning bias deleted");
      router.push("/");
    }
  };

  const isViewMode = todayBias && !isEditing;
  const isLastStep = currentStep === STEPS.length - 1;

  const stepComponents = [
    <StepBias key="bias" form={formData} update={update} />,
    <StepLevels key="levels" form={formData} update={update} />,
    <StepSessions key="sessions" form={formData} update={update} />,
    <StepPlan key="plan" form={formData} update={update} />,
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Daily Pre-Gameplan</h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        {isViewMode && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setCurrentStep(0); }}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start">
        {/* Left — dynamic content */}
        <div className="min-w-0 space-y-6">
          {isViewMode ? (
            <BiasViewCard todayBias={todayBias} />
          ) : (
            <>
              {/* Step progress rail */}
              <div className="flex items-center gap-1">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStep(i)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                        active ? "bg-foreground text-background" : done ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  );
                })}
                <div className="flex-1 h-px bg-border ml-2" />
                <span className="text-xs text-muted-foreground tabular-nums">{currentStep + 1}/{STEPS.length}</span>
              </div>

              {/* Step content */}
              <div className="rounded-2xl border bg-card p-6 min-h-[360px]">
                <div className="mb-6">
                  <h2 className="text-base font-semibold">{STEPS[currentStep].label}</h2>
                  <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
                </div>
                {stepComponents[currentStep]}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentStep === 0 ? (isEditing ? setIsEditing(false) : router.push("/")) : setCurrentStep(currentStep - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {currentStep === 0 ? "Cancel" : "Back"}
                </Button>

                {isLastStep ? (
                  <Button size="sm" onClick={handleSubmit} className="gap-2">
                    <Save className="h-3.5 w-3.5" />
                    {todayBias ? "Update" : "Save"} Bias
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right — static context */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <ContextBlock
            variant="sidebar"
            mode={isViewMode ? "read" : "edit"}
            title="Morning context"
            notes={isViewMode ? (todayBias.morningContextNotes ?? "") : morningContextNotes}
            onNotesChange={isViewMode ? undefined : setMorningContextNotes}
            screenshots={isViewMode ? (todayBias.morningScreenshots ?? []) : morningScreenshots}
            onScreenshotsChange={isViewMode ? undefined : setMorningScreenshots}
          />
        </aside>
      </div>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Daily Pre-Gameplan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete today&apos;s morning bias? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}