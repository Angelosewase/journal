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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Save, Trash2, Pencil, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EveningReviewPage() {
  const router = useRouter();
  const dailyBiases = useQuery(api.dailyBias.list);
  const updateBias = useMutation(api.dailyBias.update);
  const removeBias = useMutation(api.dailyBias.remove);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);

  const [isEditing, setIsEditing] = useState(!todayBias?.actualMovement);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (todayBias) {
      setFormData({
        currentDailyBias: todayBias.currentDailyBias || "NEUTRAL",
        actualMovement: todayBias.actualMovement || "",
        wasCorrect: todayBias.wasCorrect || "",
        accuracyScore: String(todayBias.accuracyScore ?? 5),
        asiaExpected: todayBias.asiaExpected || "",
        asiaActual: todayBias.asiaActual || "",
        asiaSurprise: todayBias.asiaSurprise || "",
        londonExpected: todayBias.londonExpected || "",
        londonActual: todayBias.londonActual || "",
        londonTrapsPresent: todayBias.londonTrapsPresent || "",
        nyExpected: todayBias.nyExpected || "",
        nyActual: todayBias.nyActual || "",
        nyMajorMove: todayBias.nyMajorMove || "",
        mostObviousTrap: todayBias.mostObviousTrap || "",
        institutionsShowedHand: todayBias.institutionsShowedHand ?? false,
        tradesTaken: String(todayBias.tradesTaken ?? ""),
        tradesWorked: String(todayBias.tradesWorked ?? ""),
        tradesFailed: String(todayBias.tradesFailed ?? ""),
        followedPlan: todayBias.followedPlan ?? true,
        planViolationExplanation: todayBias.planViolationExplanation || "",
        overallDiscipline: String(todayBias.overallDiscipline ?? 5),
        tomorrowDirection: todayBias.tomorrowDirection || "",
        tomorrowConfidence: String(todayBias.tomorrowConfidence ?? 5),
        whatChanged: todayBias.whatChanged || "",
        keyLevelsTomorrow: todayBias.keyLevelsTomorrow || "",
      });
    }
  }, [todayBias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayBias?._id) {
      toast.error("No morning bias found. Please set your morning bias first.");
      return;
    }
    try {
      await updateBias({
        id: todayBias._id,
        actualMovement: formData.actualMovement,
        wasCorrect: formData.wasCorrect,
        accuracyScore: Number(formData.accuracyScore),
        asiaExpected: formData.asiaExpected,
        asiaActual: formData.asiaActual,
        asiaSurprise: formData.asiaSurprise,
        londonExpected: formData.londonExpected,
        londonActual: formData.londonActual,
        londonTrapsPresent: formData.londonTrapsPresent,
        nyExpected: formData.nyExpected,
        nyActual: formData.nyActual,
        nyMajorMove: formData.nyMajorMove,
        mostObviousTrap: formData.mostObviousTrap,
        institutionsShowedHand: formData.institutionsShowedHand || undefined,
        tradesTaken: formData.tradesTaken ? Number(formData.tradesTaken) : undefined,
        tradesWorked: formData.tradesWorked ? Number(formData.tradesWorked) : undefined,
        tradesFailed: formData.tradesFailed ? Number(formData.tradesFailed) : undefined,
        followedPlan: formData.followedPlan || undefined,
        planViolationExplanation: formData.planViolationExplanation,
        overallDiscipline: Number(formData.overallDiscipline),
        tomorrowDirection: formData.tomorrowDirection,
        tomorrowConfidence: Number(formData.tomorrowConfidence),
        whatChanged: formData.whatChanged,
        keyLevelsTomorrow: formData.keyLevelsTomorrow,
      });
      toast.success("Evening review saved!");
      setIsEditing(false);
    } catch (error) {
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

  const getBiasIcon = (bias: string | undefined) => {
    switch (bias) {
      case "BULLISH":
        return <TrendingUp className="h-4 w-4" />;
      case "BEARISH":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getBiasColor = (bias: string | undefined) => {
    switch (bias) {
      case "BULLISH":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "BEARISH":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getCorrectColor = (wasCorrect: string | undefined) => {
    switch (wasCorrect) {
      case "YES":
        return "bg-emerald-100 text-emerald-700";
      case "NO":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  if (!todayBias) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Evening Review</h1>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">You need to set your morning bias before doing an evening review.</p>
            <Button asChild>
              <Link href="/daily-bias/morning">Set Morning Bias</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isViewMode = todayBias.actualMovement && !isEditing;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Evening Review</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        {todayBias.actualMovement && !isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {isViewMode ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bias Accuracy</CardTitle>
              <CardDescription>How well did your morning analysis predict the market?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Morning Bias</p>
                  <Badge className={`gap-1 mt-1 ${getBiasColor(todayBias.currentDailyBias)}`}>
                    {getBiasIcon(todayBias.currentDailyBias)}
                    {todayBias.currentDailyBias}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Actual Movement</p>
                  <Badge className={`gap-1 mt-1 ${getBiasColor(todayBias.actualMovement)}`}>
                    {getBiasIcon(todayBias.actualMovement)}
                    {todayBias.actualMovement}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Correct?</p>
                  <Badge className={`mt-1 ${getCorrectColor(todayBias.wasCorrect)}`}>
                    {todayBias.wasCorrect}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy Score</p>
                  <p className="text-lg font-semibold mt-1">{todayBias.accuracyScore}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <SessionRow label="ASIA" expected={todayBias.asiaExpected} actual={todayBias.asiaActual} />
                <SessionRow label="LONDON" expected={todayBias.londonExpected} actual={todayBias.londonActual} />
                <SessionRow label="NEW YORK" expected={todayBias.nyExpected} actual={todayBias.nyActual} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <Field label="Trades Taken" value={todayBias.tradesTaken} />
                <Field label="Worked" value={todayBias.tradesWorked} />
                <Field label="Failed" value={todayBias.tradesFailed} />
                <Field label="Discipline" value={`${todayBias.overallDiscipline}/10`} />
                <div>
                  <p className="text-sm text-muted-foreground">Followed Plan</p>
                  <Badge className={todayBias.followedPlan ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                    {todayBias.followedPlan ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tomorrow&apos;s Bias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Direction</p>
                  {todayBias.tomorrowDirection ? (
                    <Badge className={`gap-1 mt-1 ${getBiasColor(todayBias.tomorrowDirection)}`}>
                      {getBiasIcon(todayBias.tomorrowDirection)}
                      {todayBias.tomorrowDirection}
                    </Badge>
                  ) : (
                    <p className="font-medium">—</p>
                  )}
                </div>
                <Field label="Confidence" value={todayBias.tomorrowConfidence ? `${todayBias.tomorrowConfidence}/10` : undefined} />
                <Field label="Key Levels" value={todayBias.keyLevelsTomorrow} />
              </div>
              {todayBias.whatChanged && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">What changed</p>
                  <p className="text-sm">{todayBias.whatChanged}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bias Accuracy</CardTitle>
              <CardDescription>How well did your morning analysis predict the market?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Morning Bias</Label>
                  <Badge className={`gap-1 ${getBiasColor(todayBias.currentDailyBias)}`}>
                    {getBiasIcon(todayBias.currentDailyBias)}
                    {todayBias.currentDailyBias}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Actual Movement</Label>
                  <Select value={formData.actualMovement} onValueChange={(v) => update("actualMovement", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BULLISH">BULLISH</SelectItem>
                      <SelectItem value="BEARISH">BEARISH</SelectItem>
                      <SelectItem value="NEUTRAL">NEUTRAL</SelectItem>
                      <SelectItem value="SIDEWAYS">SIDEWAYS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Were you correct?</Label>
                  <Select value={formData.wasCorrect} onValueChange={(v) => update("wasCorrect", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">YES</SelectItem>
                      <SelectItem value="NO">NO</SelectItem>
                      <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accuracy Score (1-10)</Label>
                <Input type="number" min="1" max="10" value={formData.accuracyScore} onChange={(e) => update("accuracyScore", e.target.value)} className="max-w-32" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Happened</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ASIA Actual</Label>
                  <Input value={formData.asiaActual} onChange={(e) => update("asiaActual", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>LONDON Actual</Label>
                  <Input value={formData.londonActual} onChange={(e) => update("londonActual", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>NY Actual</Label>
                  <Input value={formData.nyActual} onChange={(e) => update("nyActual", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Most Obvious Trap</Label>
                  <Input value={formData.mostObviousTrap} onChange={(e) => update("mostObviousTrap", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="institutionsShowedHand" checked={formData.institutionsShowedHand} onCheckedChange={(checked) => update("institutionsShowedHand", !!checked)} />
                <Label htmlFor="institutionsShowedHand">Institutions showed their hand</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Trades Taken</Label>
                  <Input type="number" value={formData.tradesTaken} onChange={(e) => update("tradesTaken", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Worked</Label>
                  <Input type="number" value={formData.tradesWorked} onChange={(e) => update("tradesWorked", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Failed</Label>
                  <Input type="number" value={formData.tradesFailed} onChange={(e) => update("tradesFailed", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="followedPlan" checked={formData.followedPlan} onCheckedChange={(checked) => update("followedPlan", !!checked)} />
                <Label htmlFor="followedPlan">Did you follow your plan?</Label>
              </div>
              {formData.followedPlan === false && (
                <div className="space-y-2">
                  <Label>Plan Violation Explanation</Label>
                  <Textarea value={formData.planViolationExplanation} onChange={(e) => update("planViolationExplanation", e.target.value)} rows={2} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Overall Discipline (1-10)</Label>
                <Input type="number" min="1" max="10" value={formData.overallDiscipline} onChange={(e) => update("overallDiscipline", e.target.value)} className="max-w-32" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tomorrow&apos;s Bias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Expected Direction</Label>
                  <Select value={formData.tomorrowDirection} onValueChange={(v) => update("tomorrowDirection", v)}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BULLISH">BULLISH</SelectItem>
                      <SelectItem value="BEARISH">BEARISH</SelectItem>
                      <SelectItem value="NEUTRAL">NEUTRAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Confidence (1-10)</Label>
                  <Input type="number" min="1" max="10" value={formData.tomorrowConfidence} onChange={(e) => update("tomorrowConfidence", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>What changed from today?</Label>
                <Textarea value={formData.whatChanged} onChange={(e) => update("whatChanged", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Key Levels Tomorrow</Label>
                <Textarea value={formData.keyLevelsTomorrow} onChange={(e) => update("keyLevelsTomorrow", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {todayBias.actualMovement ? "Update" : "Save"} Evening Review
            </Button>
          </div>
        </form>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Evening Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete today&apos;s evening review? This will also delete the morning bias. This action cannot be undone.
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
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}

function SessionRow({ label, expected, actual }: { label: string; expected: string | undefined; actual: string | undefined }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="font-medium">{label}</div>
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Expected: </span>
          <span>{expected || "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Actual: </span>
          <span>{actual || "—"}</span>
        </div>
      </div>
    </div>
  );
}
