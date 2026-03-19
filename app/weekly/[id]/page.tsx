"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export default function WeeklyReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as Id<"weeklyReviews">;
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const review = weeklyReviews?.find((r) => r._id === reviewId);
  const removeReview = useMutation(api.weeklyReviews.remove);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await removeReview({ id: reviewId });
    router.push("/weekly");
  };

  if (!review) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading review...</p>
      </div>
    );
  }

  const winRate = review.totalTrades > 0 ? Math.round((review.winningTrades / review.totalTrades) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/weekly">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Weekly Review</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(review.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(review.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/weekly/${reviewId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase">Total Trades</p>
            <p className="text-2xl font-bold mt-1">{review.totalTrades}</p>
            <p className="text-xs text-muted-foreground mt-1">{review.winningTrades}W / {review.losingTrades}L</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase">Win Rate</p>
            <p className="text-2xl font-bold mt-1">{winRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase">Total P&L</p>
            <p className={`text-2xl font-bold mt-1 ${review.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ${review.totalPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase">Profit Factor</p>
            <p className="text-2xl font-bold mt-1">{review.profitFactor.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="Biggest Win" value={`$${review.biggestWin.toFixed(2)}`} />
            <Field label="Biggest Loss" value={`$${review.biggestLoss.toFixed(2)}`} />
            <Field label="Avg Win" value={`$${review.avgWin.toFixed(2)}`} />
            <Field label="Avg Loss" value={`$${review.avgLoss.toFixed(2)}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WWA Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ComplianceField label="Trinity Score" value={review.avgTrinityScore} max={10} />
            <ComplianceField label="Inducement" value={review.inducementPercentage} max={100} suffix="%" />
            <ComplianceField label="LTC" value={review.ltcPercentage} max={100} suffix="%" />
            <ComplianceField label="Killzone" value={review.killzonePercentage} max={100} suffix="%" />
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <Field label="Overall Quality" value={`${review.overallSetupQualityScore}/10`} />
            <Field label="POI ID" value={`${review.poiIdentificationScore}/10`} />
            <Field label="Inducement" value={`${review.inducementRecognitionScore2}/10`} />
            <Field label="Entry" value={`${review.entryExecutionScore}/10`} />
            <Field label="Risk Mgmt" value={`${review.riskManagementScore}/10`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patience & Discipline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <ComplianceField label="Patience Score" value={review.patienceScore} max={10} />
            <Field label="Forced Trades" value={review.forcedTrades} />
            <Field label="Waited Trades" value={review.waitedTrades} />
          </div>
        </CardContent>
      </Card>

      {review.bestTradeDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Best Trade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{review.bestTradeDescription}</p>
            {review.whyBestWorked && (
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Why it worked:</span> {review.whyBestWorked}</p>
            )}
          </CardContent>
        </Card>
      )}

      {review.worstTradeDescription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Worst Trade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>{review.worstTradeDescription}</p>
            {review.whyWorstFailed && (
              <p className="text-muted-foreground"><span className="font-medium text-foreground">Why it failed:</span> {review.whyWorstFailed}</p>
            )}
          </CardContent>
        </Card>
      )}

      {(review.biggestLessonMarket || review.biggestLessonSelf || review.adjustmentNextWeek) && (
        <Card>
          <CardHeader>
            <CardTitle>Lessons & Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {review.biggestLessonMarket && (
              <div>
                <p className="text-muted-foreground mb-1">About the market</p>
                <p>{review.biggestLessonMarket}</p>
              </div>
            )}
            {review.biggestLessonSelf && (
              <div>
                <p className="text-muted-foreground mb-1">About yourself</p>
                <p>{review.biggestLessonSelf}</p>
              </div>
            )}
            {review.adjustmentNextWeek && (
              <div>
                <p className="text-muted-foreground mb-1">Adjustment for next week</p>
                <p>{review.adjustmentNextWeek}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {review.topPriorityImprovement && (
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Top Priority</p>
              <p className="font-medium">{review.topPriorityImprovement}</p>
              {review.specificActionToImprove && <p className="text-muted-foreground mt-1">{review.specificActionToImprove}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Success Metric" value={review.successMetric} />
              <Field label="Confidence" value={`${review.confidenceNextWeek}/10`} />
            </div>
          </CardContent>
        </Card>
      )}

      {review.howFeeling && (
        <Card>
          <CardHeader>
            <CardTitle>Mental & Emotional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Feeling" value={review.howFeeling} />
              <Field label="Emotions Affected" value={review.emotionsAffectedTrading ? "Yes" : "No"} />
              <Field label="Readiness" value={`${review.readinessScore}/10`} />
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Weekly Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this weekly review? This action cannot be undone.
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

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function ComplianceField({ label, value, max, suffix = "" }: { label: string; value: number; max: number; suffix?: string }) {
  const percentage = (value / max) * 100;
  const color = percentage >= 70 ? "bg-emerald-500" : percentage >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}{suffix}</p>
      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mt-2">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  );
}
