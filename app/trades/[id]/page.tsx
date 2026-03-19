"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as Id<"trades">;
  const trade = useQuery(api.trades.get, { id: tradeId });
  const removeTrade = useMutation(api.trades.remove);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await removeTrade({ id: tradeId });
    router.push("/trades");
  };

  if (!trade) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading trade...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/trades")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {trade.instrument} {trade.direction}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date(trade.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/trades/${tradeId}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase">Entry / Exit</p>
          <p className="text-lg font-semibold mt-1">
            {trade.entryPrice} / {trade.exitPrice || "Open"}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase">P&amp;L</p>
          <p className={`text-lg font-semibold mt-1 ${
            (trade.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"
          }`}>
            {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "Open"}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase">Status</p>
          <p className="text-lg font-semibold mt-1">{trade.winLossStatus || "Open"}</p>
        </div>
      </div>

      <Section title="Basic Info">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Instrument" value={trade.instrument} />
          <Field label="Direction" value={trade.direction} />
          <Field label="Session" value={trade.session} />
          <Field label="Environment" value={trade.environment} />
          <Field label="Position Size" value={trade.positionSize} />
          <Field label="Commission" value={`$${trade.commission.toFixed(2)}`} />
        </div>
      </Section>

      <Section title="WWA Framework - Direction">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Daily Bias:</span>
            <Badge
              variant="outline"
              className={
                trade.dailyBias === "BULLISH"
                  ? "border-emerald-500 text-emerald-600"
                  : trade.dailyBias === "BEARISH"
                    ? "border-red-500 text-red-600"
                    : ""
              }
            >
              {trade.dailyBias}
            </Badge>
          </div>
          <Field label="External Structure" value={trade.externalStructure} />
          <Field label="Internal Structure" value={trade.internalStructure} />
          <Field label="Killzone" value={trade.isInKillzone ? "Yes" : "No"} />
        </div>
      </Section>

      <Section title="Point of Interest (POI)">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-muted-foreground">Type: </span>
              <span className="font-medium">{trade.poiType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mitigation: </span>
              <span className="font-medium">{trade.poiMitigationStatus.replace(/_/g, " ")}</span>
            </div>
          </div>
          <Field label="POI Quality" value={trade.poiQuality?.join(", ") || "N/A"} />
          {trade.poiDescription && <Field label="Description" value={trade.poiDescription} />}
          <Field label="Clean Break" value={trade.cleanBreak ? "Yes" : "No"} />
        </div>
      </Section>

      <Section title="Traps &amp; Inducement">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Trap Swept:</span>
            <Badge
              variant="outline"
              className={
                trade.trapSwept === "YES"
                  ? "border-emerald-500 text-emerald-600"
                  : trade.trapSwept === "PARTIAL"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-red-500 text-red-600"
              }
            >
              {trade.trapSwept}
            </Badge>
          </div>
          {trade.trapType && <Field label="Trap Type" value={trade.trapType} />}
          {trade.trapLocation && <Field label="Trap Location" value={`${trade.trapLocation} pips from POI`} />}
          <Field label="Missing Inducement" value={trade.missingInducement ? "Yes (Reduced probability)" : "No"} />
        </div>
      </Section>

      <Section title="The Trinity">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className={`p-3 rounded-lg ${trade.trapSwept === "YES" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
            <p className="text-muted-foreground">Inducement</p>
            <p className="font-medium mt-1">{trade.trapSwept === "YES" ? "Present" : "Missing"}</p>
          </div>
          <div className={`p-3 rounded-lg ${trade.smsAfterTrap ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
            <p className="text-muted-foreground">LTC Confirmation</p>
            <p className="font-medium mt-1">{trade.smsAfterTrap ? "Confirmed" : "Not confirmed"}</p>
          </div>
          <div className={`p-3 rounded-lg ${trade.isInKillzone ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
            <p className="text-muted-foreground">Killzone</p>
            <p className="font-medium mt-1">{trade.isInKillzone ? "In Zone" : "Outside"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <Field label="Entry Confidence" value={`${trade.entryConfidence}/10`} />
          <Field label="BMS Confidence" value={`${trade.bmsConfidence}/10`} />
        </div>
      </Section>

      <Section title="Risk Management">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Stop Loss" value={trade.stopLossPrice} />
          <Field label="SL Size" value={`${trade.stopLossPips} pips`} />
          <Field label="Risk Amount" value={`$${trade.riskAmount.toFixed(2)}`} />
          <Field label="Risk %" value={`${trade.riskPercentage}%`} />
          <Field label="Target 1" value={`${trade.target1RR}:1 RR`} />
          <Field label="Target 2" value={`${trade.target2RR}:1 RR`} />
        </div>
      </Section>

      {trade.pnl !== undefined && (
        <Section title="Trade Outcome">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Field label="Quality Score" value={`${trade.tradeQualityScore}/10`} />
            <Field label="POI Quality" value={trade.poiQualityRating} />
            <Field label="Trinity Alignment" value={trade.trinityAlignmentRating} />
            <Field label="Discipline" value={trade.disciplineRating?.replace(/_/g, " ")} />
          </div>
        </Section>
      )}

      {trade.whyEntered && (
        <Section title="Trade Reflection">
          <div className="space-y-3 text-sm">
            <Field label="Why Entered" value={trade.whyEntered} />
            <Field label="Played as Expected" value={trade.playedAsExpected ? "Yes" : "No"} />
            {trade.whatWentWrong && <Field label="What Went Wrong" value={trade.whatWentWrong} />}
            {trade.whatWentRight && <Field label="What Went Right" value={trade.whatWentRight} />}
            {trade.institutionalLessons && <Field label="Institutional Lessons" value={trade.institutionalLessons} />}
          </div>
        </Section>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {trade.instrument} {trade.direction} trade? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <Separator className="mb-4" />
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  );
}
