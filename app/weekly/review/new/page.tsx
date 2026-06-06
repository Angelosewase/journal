"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PageShell, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { ContextBlock, type ScreenshotItem } from "@/components/ContextBlock";
import { TradeCard } from "@/components/TradeCard";
import {
  computeWeekReviewStats,
  getCurrentWeekStart,
  getWeekEnd,
} from "@/lib/review-stats";

export default function NewWeeklyReviewPage() {
  const router = useRouter();
  const trades = useQuery(api.trades.list);
  const createReview = useMutation(api.weeklyReviews.create);

  const weekStart = getCurrentWeekStart();
  const weekEnd = getWeekEnd(weekStart);
  const stats = computeWeekReviewStats(trades, weekStart);

  const [saving, setSaving] = useState(false);
  const [contextNotes, setContextNotes] = useState("");
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [form, setForm] = useState({
    biggestLessonMarket: "",
    biggestLessonSelf: "",
    adjustmentNextWeek: "",
    topPriorityImprovement: "",
    specificActionToImprove: "",
    successMetric: "",
    secondPriority: "",
    secondSpecificAction: "",
    secondSuccessMetric: "",
    setupsToAvoid: "",
    confidenceNextWeek: "5",
    howFeeling: "",
    emotionsAffectedTrading: false,
    emotionManagementPlan: "",
    readinessScore: "5",
  });

  const u = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.topPriorityImprovement || !form.specificActionToImprove || !form.successMetric) {
      toast.error("Fill required action items");
      return;
    }
    setSaving(true);
    try {
      await createReview({
        weekStart,
        weekEnd,
        topPriorityImprovement: form.topPriorityImprovement,
        specificActionToImprove: form.specificActionToImprove,
        successMetric: form.successMetric,
        confidenceNextWeek: Number(form.confidenceNextWeek),
        readinessScore: Number(form.readinessScore),
        finalizedAt: Date.now(),
        biggestLessonMarket: form.biggestLessonMarket || undefined,
        biggestLessonSelf: form.biggestLessonSelf || undefined,
        adjustmentNextWeek: form.adjustmentNextWeek || undefined,
        secondPriority: form.secondPriority || undefined,
        secondSpecificAction: form.secondSpecificAction || undefined,
        secondSuccessMetric: form.secondSuccessMetric || undefined,
        setupsToAvoid: form.setupsToAvoid || undefined,
        howFeeling: form.howFeeling || undefined,
        emotionsAffectedTrading: form.emotionsAffectedTrading,
        emotionManagementPlan: form.emotionManagementPlan || undefined,
        contextNotes: contextNotes || undefined,
        screenshots: screenshots.length ? screenshots : undefined,
      });
      toast.success("Review saved");
      router.push(`/weekly/${weekStart}`);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Weekly Review"
      subtitle={`${weekStart} – ${weekEnd} · stats from trades`}
      actions={
        <Link href="/weekly" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" />
          Planning
        </Link>
      }
    >
      <ContentCard>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live stats</p>
        <div className="mt-3 flex flex-wrap gap-6">
          <StatInline label="P&L" value={`${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl.toFixed(2)}`} valueClassName={stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
          <StatInline label="Win rate" value={`${stats.winRate}%`} />
          <StatInline label="Profit factor" value={stats.profitFactor.toFixed(2)} />
          <StatInline label="Trinity" value={`${stats.avgTrinityScore}/10`} />
          <StatInline label="Inducement" value={`${stats.inducementPercentage}%`} />
          <StatInline label="POI quality" value={`${stats.avgPoiQualityScore}/10`} />
        </div>
        {stats.sessionBreakdown.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {stats.sessionBreakdown.map((s) => (
              <div key={s.session} className="rounded-md border border-border/60 p-2 text-xs">
                <p className="font-medium">{s.label}</p>
                <p className="text-muted-foreground">{s.trades} trades · {s.winRate}% · ${s.pnl.toFixed(0)}</p>
              </div>
            ))}
          </div>
        )}
      </ContentCard>

      {stats.rows.length > 0 && (
        <ContentCard>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Trades this week</p>
          <div className="mt-3 space-y-2">
            {stats.rows.map((row) => {
              const trade = trades?.find((t) => t._id === row.id);
              return trade ? <TradeCard key={row.id} trade={trade} compact /> : null;
            })}
          </div>
        </ContentCard>
      )}

      <ContextBlock
        title="Context & charts"
        notes={contextNotes}
        onNotesChange={setContextNotes}
        screenshots={screenshots}
        onScreenshotsChange={setScreenshots}
      />

      <ContentCard>
        <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Reflection</p>
        <div className="space-y-4">
          {[
            ["biggestLessonMarket", "Biggest lesson — market"],
            ["biggestLessonSelf", "Biggest lesson — self"],
            ["adjustmentNextWeek", "Adjustment for next week"],
            ["topPriorityImprovement", "Top priority *"],
            ["specificActionToImprove", "Specific action *"],
            ["successMetric", "Success metric *"],
            ["setupsToAvoid", "Setups to avoid"],
            ["howFeeling", "How are you feeling?"],
          ].map(([key, label]) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <textarea
                value={form[key as keyof typeof form] as string}
                onChange={(e) => u(key, e.target.value)}
                className="mt-1 w-full rounded-md border border-border/60 bg-muted/20 p-2 text-sm"
                rows={2}
              />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Checkbox checked={form.emotionsAffectedTrading} onCheckedChange={(c) => u("emotionsAffectedTrading", !!c)} />
            <Label className="text-sm">Emotions affected trading</Label>
          </div>
          <div>
            <Label className="text-xs">Readiness ({form.readinessScore}/10)</Label>
            <input type="range" min={1} max={10} value={form.readinessScore} onChange={(e) => u("readinessScore", e.target.value)} className="w-full" />
          </div>
        </div>
      </ContentCard>

      <Button onClick={() => void handleSave()} disabled={saving} className="rounded-md">
        <Save className="h-4 w-4" /> Save review
      </Button>
    </PageShell>
  );
}
