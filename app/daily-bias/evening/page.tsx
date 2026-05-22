"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BarChart2,
  Clock,
  Activity,
  Sunrise,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = Record<string, any>;

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "accuracy",    label: "Accuracy",   icon: BarChart2,  description: "How did your bias hold up?" },
  { id: "sessions",   label: "Sessions",   icon: Clock,      description: "What actually happened each session" },
  { id: "performance",label: "Performance",icon: Activity,   description: "Trades & discipline review" },
  { id: "tomorrow",   label: "Tomorrow",   icon: Sunrise,    description: "Forward bias & key levels" },
];

const EMPTY_FORM: FormData = {
  actualMovement: "",
  wasCorrect: "",
  accuracyScore: "5",
  asiaExpected: "",
  asiaActual: "",
  asiaSurprise: "",
  londonExpected: "",
  londonActual: "",
  londonTrapsPresent: "",
  nyExpected: "",
  nyActual: "",
  nyMajorMove: "",
  mostObviousTrap: "",
  institutionsShowedHand: false,
  tradesTaken: "",
  tradesWorked: "",
  tradesFailed: "",
  followedPlan: true,
  planViolationExplanation: "",
  overallDiscipline: "5",
  tomorrowDirection: "",
  tomorrowConfidence: "5",
  whatChanged: "",
  keyLevelsTomorrow: "",
};

// ─── Primitives ───────────────────────────────────────────────────────────────

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
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
    />
  );
}

function OptionPill({
  active,
  onClick,
  children,
  variant,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "success" | "danger" | "warn";
}) {
  const activeClass =
    variant === "success" ? "bg-foreground text-background border-foreground" :
    variant === "danger"  ? "bg-foreground text-background border-foreground" :
    "bg-foreground text-background border-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150",
        active
          ? activeClass
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
        <span className="text-2xl font-semibold tabular-nums">
          {num}<span className="text-sm font-normal text-muted-foreground">/10</span>
        </span>
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

function CounterInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const num = Number(value) || 0;
  return (
    <div className="flex-1 space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(0, num - 1)))}
          className="w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors text-base"
        >−</button>
        <span className="text-2xl font-semibold tabular-nums w-8 text-center">{num}</span>
        <button
          type="button"
          onClick={() => onChange(String(num + 1))}
          className="w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors text-base"
        >+</button>
      </div>
    </div>
  );
}

// ─── Step: Accuracy ───────────────────────────────────────────────────────────

function StepAccuracy({ form, update, morningBias }: { form: FormData; update: (k: string, v: any) => void; morningBias?: string }) {
  return (
    <div className="space-y-8">
      {morningBias && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Morning bias was</span>
          <span className="font-medium text-foreground">{morningBias}</span>
        </div>
      )}

      <div className="space-y-3">
        <SectionLabel>Actual market movement</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {["BULLISH", "BEARISH", "NEUTRAL", "SIDEWAYS"].map((v) => (
            <OptionPill key={v} active={form.actualMovement === v} onClick={() => update("actualMovement", v)}>
              {v}
            </OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Was your bias correct?</SectionLabel>
        <div className="flex gap-2">
          {["YES", "PARTIAL", "NO"].map((v) => (
            <OptionPill key={v} active={form.wasCorrect === v} onClick={() => update("wasCorrect", v)}>
              {v}
            </OptionPill>
          ))}
        </div>
      </div>

      <SliderRow label="Accuracy Score" value={form.accuracyScore} onChange={(v) => update("accuracyScore", v)} />
    </div>
  );
}

// ─── Step: Sessions ───────────────────────────────────────────────────────────

function StepSessions({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  const sessions = [
    {
      key: "ASIA",
      expectedField: "asiaExpected",
      actualField: "asiaActual",
      extraField: "asiaSurprise",
      extraLabel: "Surprise / notable",
    },
    {
      key: "LONDON",
      expectedField: "londonExpected",
      actualField: "londonActual",
      extraField: "londonTrapsPresent",
      extraLabel: "Traps present",
    },
    {
      key: "NEW YORK",
      expectedField: "nyExpected",
      actualField: "nyActual",
      extraField: "nyMajorMove",
      extraLabel: "Major move",
    },
  ];

  return (
    <div className="space-y-8">
      {sessions.map(({ key, expectedField, actualField, extraField, extraLabel }) => (
        <div key={key} className="space-y-3">
          <SectionLabel>{key}</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Expected</p>
              <input
                value={form[expectedField]}
                onChange={(e) => update(expectedField, e.target.value)}
                placeholder="Your plan…"
                className="w-full rounded-lg bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Actual</p>
              <input
                value={form[actualField]}
                onChange={(e) => update(actualField, e.target.value)}
                placeholder="What happened…"
                className="w-full rounded-lg bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <input
            value={form[extraField]}
            onChange={(e) => update(extraField, e.target.value)}
            placeholder={extraLabel}
            className="w-full rounded-lg bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
          />
        </div>
      ))}

      <div className="space-y-3">
        <SectionLabel>Most obvious trap today</SectionLabel>
        <NotionTextarea
          value={form.mostObviousTrap}
          onChange={(v) => update("mostObviousTrap", v)}
          placeholder="Describe the liquidity trap or stop hunt you noticed…"
          rows={2}
        />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/20">
        <Checkbox
          id="institutionsShowedHand"
          checked={form.institutionsShowedHand}
          onCheckedChange={(checked) => update("institutionsShowedHand", !!checked)}
          className="mt-0.5"
        />
        <Label htmlFor="institutionsShowedHand" className="text-sm cursor-pointer leading-relaxed">
          Institutions clearly showed their hand today
        </Label>
      </div>
    </div>
  );
}

// ─── Step: Performance ────────────────────────────────────────────────────────

function StepPerformance({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Trade count</SectionLabel>
        <div className="flex gap-6 rounded-xl border bg-muted/20 p-4">
          <CounterInput label="Taken"  value={form.tradesTaken}  onChange={(v) => update("tradesTaken", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="Worked" value={form.tradesWorked} onChange={(v) => update("tradesWorked", v)} />
          <div className="w-px bg-border" />
          <CounterInput label="Failed" value={form.tradesFailed} onChange={(v) => update("tradesFailed", v)} />
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Did you follow your plan?</SectionLabel>
        <div className="flex gap-2">
          {["Yes", "No"].map((v) => (
            <OptionPill
              key={v}
              active={form.followedPlan === (v === "Yes")}
              onClick={() => update("followedPlan", v === "Yes")}
            >
              {v}
            </OptionPill>
          ))}
        </div>
        {form.followedPlan === false && (
          <NotionTextarea
            value={form.planViolationExplanation}
            onChange={(v) => update("planViolationExplanation", v)}
            placeholder="What happened? What rule did you break and why?"
            rows={3}
          />
        )}
      </div>

      <SliderRow label="Overall Discipline" value={form.overallDiscipline} onChange={(v) => update("overallDiscipline", v)} />
    </div>
  );
}

// ─── Step: Tomorrow ───────────────────────────────────────────────────────────

function StepTomorrow({ form, update }: { form: FormData; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Expected direction tomorrow</SectionLabel>
        <div className="flex gap-2">
          {["BULLISH", "NEUTRAL", "BEARISH"].map((v) => (
            <OptionPill key={v} active={form.tomorrowDirection === v} onClick={() => update("tomorrowDirection", v)}>
              {v}
            </OptionPill>
          ))}
        </div>
      </div>

      <SliderRow label="Confidence" value={form.tomorrowConfidence} onChange={(v) => update("tomorrowConfidence", v)} />

      <div className="space-y-2">
        <SectionLabel>What changed from today?</SectionLabel>
        <NotionTextarea
          value={form.whatChanged}
          onChange={(v) => update("whatChanged", v)}
          placeholder="New information, structure shifts, liquidity swept, sentiment change…"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <SectionLabel>Key levels to watch tomorrow</SectionLabel>
        <NotionTextarea
          value={form.keyLevelsTomorrow}
          onChange={(v) => update("keyLevelsTomorrow", v)}
          placeholder="PDH/PDL, untapped FVGs, liquidity pools, key HTF levels…"
          rows={3}
        />
      </div>
    </div>
  );
}

// ─── View mode ────────────────────────────────────────────────────────────────

function ViewRow({ label, value }: { label: string; value?: string | number | null | boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex gap-4 py-2.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-sm">{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</span>
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

function EveningViewCard({ b }: { b: any }) {
  const winRate = b.tradesTaken
    ? Math.round((b.tradesWorked / b.tradesTaken) * 100)
    : null;

  return (
    <div className="space-y-8">
      {/* Top line */}
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-semibold">{b.wasCorrect}</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">{b.actualMovement} actual</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">{b.accuracyScore}/10 accuracy</span>
      </div>

      <ViewSection title="Sessions">
        <ViewRow label="Asia expected"    value={b.asiaExpected} />
        <ViewRow label="Asia actual"      value={b.asiaActual} />
        <ViewRow label="Asia surprise"    value={b.asiaSurprise} />
        <ViewRow label="London expected"  value={b.londonExpected} />
        <ViewRow label="London actual"    value={b.londonActual} />
        <ViewRow label="London traps"     value={b.londonTrapsPresent} />
        <ViewRow label="NY expected"      value={b.nyExpected} />
        <ViewRow label="NY actual"        value={b.nyActual} />
        <ViewRow label="NY major move"    value={b.nyMajorMove} />
        <ViewRow label="Obvious trap"     value={b.mostObviousTrap} />
        {b.institutionsShowedHand && (
          <ViewRow label="Institutions"   value="Showed hand" />
        )}
      </ViewSection>

      <ViewSection title="Performance">
        <ViewRow label="Trades taken"   value={b.tradesTaken} />
        <ViewRow label="Worked"         value={b.tradesWorked} />
        <ViewRow label="Failed"         value={b.tradesFailed} />
        {winRate !== null && (
          <ViewRow label="Win rate"     value={`${winRate}%`} />
        )}
        <ViewRow label="Followed plan"  value={b.followedPlan} />
        <ViewRow label="Violation"      value={b.planViolationExplanation} />
        <ViewRow label="Discipline"     value={`${b.overallDiscipline}/10`} />
      </ViewSection>

      <ViewSection title="Tomorrow">
        <ViewRow label="Direction"      value={b.tomorrowDirection} />
        <ViewRow label="Confidence"     value={b.tomorrowConfidence ? `${b.tomorrowConfidence}/10` : null} />
        <ViewRow label="What changed"   value={b.whatChanged} />
        <ViewRow label="Key levels"     value={b.keyLevelsTomorrow} />
      </ViewSection>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EveningReviewPage() {
  const router = useRouter();
  const dailyBiases = useQuery(api.dailyBias.list);
  const updateBias = useMutation(api.dailyBias.update);
  const removeBias = useMutation(api.dailyBias.remove);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    if (todayBias) {
      setFormData({
        actualMovement:           todayBias.actualMovement || "",
        wasCorrect:               todayBias.wasCorrect || "",
        accuracyScore:            String(todayBias.accuracyScore ?? 5),
        asiaExpected:             todayBias.asiaExpected || "",
        asiaActual:               todayBias.asiaActual || "",
        asiaSurprise:             todayBias.asiaSurprise || "",
        londonExpected:           todayBias.londonExpected || "",
        londonActual:             todayBias.londonActual || "",
        londonTrapsPresent:       todayBias.londonTrapsPresent || "",
        nyExpected:               todayBias.nyExpected || "",
        nyActual:                 todayBias.nyActual || "",
        nyMajorMove:              todayBias.nyMajorMove || "",
        mostObviousTrap:          todayBias.mostObviousTrap || "",
        institutionsShowedHand:   todayBias.institutionsShowedHand ?? false,
        tradesTaken:              String(todayBias.tradesTaken ?? ""),
        tradesWorked:             String(todayBias.tradesWorked ?? ""),
        tradesFailed:             String(todayBias.tradesFailed ?? ""),
        followedPlan:             todayBias.followedPlan ?? true,
        planViolationExplanation: todayBias.planViolationExplanation || "",
        overallDiscipline:        String(todayBias.overallDiscipline ?? 5),
        tomorrowDirection:        todayBias.tomorrowDirection || "",
        tomorrowConfidence:       String(todayBias.tomorrowConfidence ?? 5),
        whatChanged:              todayBias.whatChanged || "",
        keyLevelsTomorrow:        todayBias.keyLevelsTomorrow || "",
      });
      setIsEditing(!todayBias.actualMovement);
    }
  }, [todayBias]);

  const update = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!todayBias?._id) {
      toast.error("No morning bias found. Please set your morning bias first.");
      return;
    }
    try {
      await updateBias({
        id: todayBias._id,
        actualMovement:           formData.actualMovement,
        wasCorrect:               formData.wasCorrect,
        accuracyScore:            Number(formData.accuracyScore),
        asiaExpected:             formData.asiaExpected,
        asiaActual:               formData.asiaActual,
        asiaSurprise:             formData.asiaSurprise,
        londonExpected:           formData.londonExpected,
        londonActual:             formData.londonActual,
        londonTrapsPresent:       formData.londonTrapsPresent,
        nyExpected:               formData.nyExpected,
        nyActual:                 formData.nyActual,
        nyMajorMove:              formData.nyMajorMove,
        mostObviousTrap:          formData.mostObviousTrap,
        institutionsShowedHand:   formData.institutionsShowedHand || undefined,
        tradesTaken:              formData.tradesTaken ? Number(formData.tradesTaken) : undefined,
        tradesWorked:             formData.tradesWorked ? Number(formData.tradesWorked) : undefined,
        tradesFailed:             formData.tradesFailed ? Number(formData.tradesFailed) : undefined,
        followedPlan:             formData.followedPlan || undefined,
        planViolationExplanation: formData.planViolationExplanation,
        overallDiscipline:        Number(formData.overallDiscipline),
        tomorrowDirection:        formData.tomorrowDirection,
        tomorrowConfidence:       Number(formData.tomorrowConfidence),
        whatChanged:              formData.whatChanged,
        keyLevelsTomorrow:        formData.keyLevelsTomorrow,
      });
      toast.success("Evening review saved!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save evening review");
    }
  };

  const handleDelete = async () => {
    if (todayBias?._id) {
      await removeBias({ id: todayBias._id });
      toast.success("Evening review deleted");
      router.push("/");
    }
  };

  // No morning bias yet
  if (!todayBias) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">Evening Review</h1>
        </div>
        <div className="rounded-2xl border bg-card p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You need to set your morning bias before doing an evening review.
          </p>
          <Button size="sm" asChild>
            <Link href="/daily-bias/morning">Set Morning Bias</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isViewMode = todayBias.actualMovement && !isEditing;
  const isLastStep = currentStep === STEPS.length - 1;

  const stepComponents = [
    <StepAccuracy    key="accuracy"    form={formData} update={update} morningBias={todayBias.currentDailyBias} />,
    <StepSessions    key="sessions"    form={formData} update={update} />,
    <StepPerformance key="performance" form={formData} update={update} />,
    <StepTomorrow    key="tomorrow"    form={formData} update={update} />,
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Evening Review</h1>
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

      {isViewMode ? (
        <EveningViewCard b={todayBias} />
      ) : (
        <>
          {/* Step rail */}
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
                  {done
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    : <Icon className="h-3.5 w-3.5" />}
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
              onClick={() =>
                currentStep === 0
                  ? isEditing ? setIsEditing(false) : router.push("/")
                  : setCurrentStep(currentStep - 1)
              }
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>

            {isLastStep ? (
              <Button size="sm" onClick={handleSubmit} className="gap-2">
                <Save className="h-3.5 w-3.5" />
                {todayBias.actualMovement ? "Update" : "Save"} Review
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

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Evening Review</DialogTitle>
            <DialogDescription>
              Are you sure? This will also delete the morning bias. This action cannot be undone.
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