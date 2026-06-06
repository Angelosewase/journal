"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { ContextBlock, type ScreenshotItem } from "@/components/ContextBlock";
import { getCurrentWeekStart, getWeekEnd, getWeekStart } from "@/lib/review-stats";

const STEPS = ["Bias", "Focus", "Rules"] as const;

export default function NewGameplanPage() {
  const router = useRouter();
  const createGameplan = useMutation(api.weeklyGameplans.create);
  const weeklyReviews = useQuery(api.weeklyReviews.list);

  const weekStart = getCurrentWeekStart();
  const weekEnd = getWeekEnd(weekStart);
  const prevWeekStart = getWeekStart(new Date(new Date(weekStart).getTime() - 7 * 86400000));
  const prevReview = weeklyReviews?.find((r) => r.weekStart === prevWeekStart);

  const carryForward = useMemo(() => {
    if (!prevReview) return "";
    return [
      prevReview.topPriorityImprovement,
      prevReview.specificActionToImprove,
      prevReview.adjustmentNextWeek,
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [prevReview]);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [contextNotes, setContextNotes] = useState("");
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [form, setForm] = useState({
    weeklyBias: "NEUTRAL" as "BULLISH" | "BEARISH" | "NEUTRAL",
    biasConfidence: "5",
    biasReason: "",
    instrumentsToFocus: "",
    instrumentsToAvoid: "",
    sessionFocus: "LONDON" as "ASIA" | "LONDON" | "NEW_YORK",
    modelToFocus: "BOTH" as "CONTINUATION" | "REVERSAL" | "BOTH",
    minimumPoiQuality: "CLEAN" as "PRISTINE" | "CLEAN" | "ACCEPTABLE",
    targetTrades: "3",
    maxWeeklyLoss: "",
    willTradeWithoutInducement: false,
    eventsToAvoid: "",
    carryForwardNotes: carryForward,
    confidenceForWeek: "5",
  });

  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await createGameplan({
        weekStart,
        weekEnd,
        weeklyBias: form.weeklyBias,
        biasConfidence: Number(form.biasConfidence),
        biasReason: form.biasReason,
        instrumentsToFocus: form.instrumentsToFocus || undefined,
        instrumentsToAvoid: form.instrumentsToAvoid || undefined,
        sessionFocus: form.sessionFocus,
        modelToFocus: form.modelToFocus,
        minimumPoiQuality: form.minimumPoiQuality,
        targetTrades: form.targetTrades ? Number(form.targetTrades) : undefined,
        maxWeeklyLoss: form.maxWeeklyLoss ? Number(form.maxWeeklyLoss) : undefined,
        willTradeWithoutInducement: form.willTradeWithoutInducement,
        eventsToAvoid: form.eventsToAvoid || undefined,
        carryForwardNotes: form.carryForwardNotes || undefined,
        confidenceForWeek: Number(form.confidenceForWeek),
        contextNotes: contextNotes || undefined,
        screenshots: screenshots.length ? screenshots : undefined,
      });
      toast.success("Pre-gameplan saved");
      router.push(`/weekly/${weekStart}`);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Weekly Pre-Gameplan"
      subtitle={`Week of ${weekStart}`}
      actions={
        <Link href="/weekly" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Planning
        </Link>
      }
    >
      <div className="mb-4 flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`rounded-md px-3 py-1 text-xs ${step === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <ContextBlock
        title="Chart context"
        notes={contextNotes}
        onNotesChange={setContextNotes}
        screenshots={screenshots}
        onScreenshotsChange={setScreenshots}
        collapsible
        defaultExpanded
      />

      <ContentCard className="mt-4">
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["BULLISH", "BEARISH", "NEUTRAL"] as const).map((b) => (
                <Button key={b} type="button" variant={form.weeklyBias === b ? "default" : "outline"} size="sm" onClick={() => u("weeklyBias", b)}>
                  {b}
                </Button>
              ))}
            </div>
            <div>
              <Label className="text-xs">Confidence</Label>
              <input type="range" min={1} max={10} value={form.biasConfidence} onChange={(e) => u("biasConfidence", e.target.value)} className="w-full" />
            </div>
            <textarea
              value={form.biasReason}
              onChange={(e) => u("biasReason", e.target.value)}
              placeholder="Why this bias?"
              className="w-full rounded-md border border-border/60 bg-muted/20 p-3 text-sm"
              rows={4}
            />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <input value={form.instrumentsToFocus} onChange={(e) => u("instrumentsToFocus", e.target.value)} placeholder="Instruments to focus" className="w-full rounded-md border border-border/60 p-2 text-sm" />
            <input value={form.instrumentsToAvoid} onChange={(e) => u("instrumentsToAvoid", e.target.value)} placeholder="Instruments to avoid" className="w-full rounded-md border border-border/60 p-2 text-sm" />
            <div className="flex gap-2">
              {(["ASIA", "LONDON", "NEW_YORK"] as const).map((s) => (
                <Button key={s} type="button" variant={form.sessionFocus === s ? "default" : "outline"} size="sm" onClick={() => u("sessionFocus", s)}>{s}</Button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <textarea value={form.carryForwardNotes} onChange={(e) => u("carryForwardNotes", e.target.value)} placeholder="Carry forward from last week" className="w-full rounded-md border border-border/60 p-2 text-sm" rows={3} />
            <input value={form.targetTrades} onChange={(e) => u("targetTrades", e.target.value)} placeholder="Target trades" className="w-full rounded-md border border-border/60 p-2 text-sm" />
            <input value={form.maxWeeklyLoss} onChange={(e) => u("maxWeeklyLoss", e.target.value)} placeholder="Max weekly loss ($)" className="w-full rounded-md border border-border/60 p-2 text-sm" />
            <input value={form.eventsToAvoid} onChange={(e) => u("eventsToAvoid", e.target.value)} placeholder="Events to avoid" className="w-full rounded-md border border-border/60 p-2 text-sm" />
            <div className="flex items-center gap-2">
              <Checkbox checked={form.willTradeWithoutInducement} onCheckedChange={(c) => u("willTradeWithoutInducement", !!c)} />
              <Label className="text-sm">Will trade without inducement</Label>
            </div>
          </div>
        )}
      </ContentCard>

      <div className="mt-4 flex justify-between">
        <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={() => void handleSave()} disabled={saving}>
            <Save className="h-4 w-4" /> Save pre-gameplan
          </Button>
        )}
      </div>
    </PageShell>
  );
}
