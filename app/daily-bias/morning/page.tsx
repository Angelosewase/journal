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
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (todayBias) {
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
    } else {
      setFormData({
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
      });
    }
  }, [todayBias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      };

      if (todayBias?._id) {
        await updateBias({ id: todayBias._id, ...data });
      } else {
        await createBias(data);
      }
      toast.success("Morning bias saved!");
      setIsEditing(false);
    } catch (error) {
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

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case "BULLISH":
        return <TrendingUp className="h-4 w-4" />;
      case "BEARISH":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case "BULLISH":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "BEARISH":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const update = (key: string, value: any) => setFormData({ ...formData, [key]: value });

  const isViewMode = todayBias && !isEditing;

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
            <h1 className="text-2xl font-semibold tracking-tight">Morning Bias</h1>
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
        {todayBias && !isEditing && (
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
              <CardTitle>Daily Bias</CardTitle>
              <CardDescription>Your pre-market direction analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`gap-1 text-sm px-3 py-1 ${getBiasColor(todayBias.currentDailyBias)}`}>
                  {getBiasIcon(todayBias.currentDailyBias)}
                  {todayBias.currentDailyBias}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Confidence: {todayBias.biasConfidence}/10
                </span>
              </div>
              {todayBias.biasReason && (
                <p className="text-sm leading-relaxed">{todayBias.biasReason}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liquidity Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Asia High" value={todayBias.asiaHigh} />
                <Field label="Asia Low" value={todayBias.asiaLow} />
                <Field label="Prev Day High" value={todayBias.previousDayHigh} />
                <Field label="Prev Day Low" value={todayBias.previousDayLow} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Expectations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="ASIA Expected" value={todayBias.asiaExpectedBehavior} />
                <Field label="LONDON Expected" value={todayBias.londonExpectedBehavior} />
                <Field label="NY Expected" value={todayBias.nyExpectedBehavior} />
                <Field label="Session to Trade" value={todayBias.sessionToTrade} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Best Instrument" value={todayBias.bestInstrument} />
                <Field label="Model to Focus" value={todayBias.modelToFocus} />
                <Field label="Min POI Quality" value={todayBias.minimumPoiQuality} />
                <Field label="Confidence" value={`${todayBias.confidenceForToday}/10`} />
                <Field label="Target Trades" value={todayBias.targetTrades} />
                <Field label="Max Daily Loss" value={todayBias.maxDailyLoss ? `$${todayBias.maxDailyLoss}` : undefined} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Bias</CardTitle>
              <CardDescription>Your pre-market direction analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Bias</Label>
                  <Select value={formData.currentDailyBias} onValueChange={(v) => update("currentDailyBias", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BULLISH">BULLISH</SelectItem>
                      <SelectItem value="BEARISH">BEARISH</SelectItem>
                      <SelectItem value="NEUTRAL">NEUTRAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Confidence (1-10)</Label>
                  <Input type="number" min="1" max="10" value={formData.biasConfidence} onChange={(e) => update("biasConfidence", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason for Bias</Label>
                <Textarea value={formData.biasReason} onChange={(e) => update("biasReason", e.target.value)} rows={3} placeholder="Explain why you have this bias..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liquidity Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Asia High</Label>
                  <Input type="number" step="0.00001" value={formData.asiaHigh} onChange={(e) => update("asiaHigh", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Asia Low</Label>
                  <Input type="number" step="0.00001" value={formData.asiaLow} onChange={(e) => update("asiaLow", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prev Day High</Label>
                  <Input type="number" step="0.00001" value={formData.previousDayHigh} onChange={(e) => update("previousDayHigh", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prev Day Low</Label>
                  <Input type="number" step="0.00001" value={formData.previousDayLow} onChange={(e) => update("previousDayLow", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Expectations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ASIA Expected Behavior</Label>
                  <Input value={formData.asiaExpectedBehavior} onChange={(e) => update("asiaExpectedBehavior", e.target.value)} placeholder="RANGING / BREAKOUT" />
                </div>
                <div className="space-y-2">
                  <Label>LONDON Expected</Label>
                  <Input value={formData.londonExpectedBehavior} onChange={(e) => update("londonExpectedBehavior", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>NY Expected</Label>
                  <Input value={formData.nyExpectedBehavior} onChange={(e) => update("nyExpectedBehavior", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Session to Trade</Label>
                  <Select value={formData.sessionToTrade} onValueChange={(v) => update("sessionToTrade", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASIA">ASIA</SelectItem>
                      <SelectItem value="LONDON">LONDON</SelectItem>
                      <SelectItem value="NY">NEW YORK</SelectItem>
                      <SelectItem value="MULTIPLE">MULTIPLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Best Instrument</Label>
                  <Input value={formData.bestInstrument} onChange={(e) => update("bestInstrument", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Model to Focus</Label>
                  <Select value={formData.modelToFocus} onValueChange={(v) => update("modelToFocus", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTINUATION">CONTINUATION</SelectItem>
                      <SelectItem value="REVERSAL">REVERSAL</SelectItem>
                      <SelectItem value="BOTH">BOTH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min POI Quality</Label>
                  <Select value={formData.minimumPoiQuality} onValueChange={(v) => update("minimumPoiQuality", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRISTINE">PRISTINE</SelectItem>
                      <SelectItem value="CLEAN">CLEAN</SelectItem>
                      <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Confidence (1-10)</Label>
                  <Input type="number" min="1" max="10" value={formData.confidenceForToday} onChange={(e) => update("confidenceForToday", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Trades</Label>
                  <Input type="number" value={formData.targetTrades} onChange={(e) => update("targetTrades", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Max Daily Loss ($)</Label>
                  <Input type="number" step="0.01" value={formData.maxDailyLoss} onChange={(e) => update("maxDailyLoss", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="willTradeWithoutInducement" checked={formData.willTradeWithoutInducement} onCheckedChange={(checked) => update("willTradeWithoutInducement", !!checked)} />
                <Label htmlFor="willTradeWithoutInducement">Will trade without clear inducement (not recommended)</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link href="/">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {todayBias ? "Update" : "Save"} Morning Bias
            </Button>
          </div>
        </form>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Morning Bias</DialogTitle>
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

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
