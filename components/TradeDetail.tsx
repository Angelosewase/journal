"use client";

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { TradeForm } from "./TradeForm";

interface TradeDetailProps {
  trade: any;
  onClose: () => void;
}

export function TradeDetail({ trade, onClose }: TradeDetailProps) {
  const removeTrade = useMutation(api.trades.remove);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this trade?")) {
      await removeTrade({ id: trade._id });
      onClose();
    }
  };

  if (isEditing) {
    return <TradeForm trade={trade} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {trade.instrument} {trade.direction}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {new Date(trade.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Entry / Exit</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                {trade.entryPrice} / {trade.exitPrice || "Open"}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">P&L</p>
              <p className={`text-lg font-semibold mt-1 ${
                (trade.pnl || 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "Open"}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Status</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
                {trade.winLossStatus}
              </p>
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
                <span className="text-zinc-500 dark:text-zinc-400">Daily Bias:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  trade.dailyBias === "BULLISH" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                  trade.dailyBias === "BEARISH" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {trade.dailyBias}
                </span>
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
                  <span className="text-zinc-500 dark:text-zinc-400">Type: </span>
                  <span className="font-medium">{trade.poiType}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-zinc-400">Mitigation: </span>
                  <span className="font-medium">{trade.poiMitigationStatus.replace(/_/g, " ")}</span>
                </div>
              </div>
              <Field label="POI Quality" value={trade.poiQuality?.join(", ") || "N/A"} />
              {trade.poiDescription && <Field label="Description" value={trade.poiDescription} />}
              <Field label="Clean Break" value={trade.cleanBreak ? "Yes" : "No"} />
            </div>
          </Section>

          <Section title="Traps & Inducement">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 dark:text-zinc-400">Trap Swept:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  trade.trapSwept === "YES" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                  trade.trapSwept === "PARTIAL" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {trade.trapSwept}
                </span>
              </div>
              {trade.trapType && <Field label="Trap Type" value={trade.trapType} />}
              {trade.trapLocation && <Field label="Trap Location" value={`${trade.trapLocation} pips from POI`} />}
              <Field label="Missing Inducement" value={trade.missingInducement ? "Yes (Reduced probability)" : "No"} />
            </div>
          </Section>

          <Section title="The Trinity">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className={`p-3 rounded-lg ${trade.trapSwept === "YES" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                <p className="text-zinc-500 dark:text-zinc-400">Inducement</p>
                <p className="font-medium mt-1">{trade.trapSwept === "YES" ? "✓ Present" : "✗ Missing"}</p>
              </div>
              <div className={`p-3 rounded-lg ${trade.smsAfterTrap ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                <p className="text-zinc-500 dark:text-zinc-400">LTC Confirmation</p>
                <p className="font-medium mt-1">{trade.smsAfterTrap ? "✓ Confirmed" : "✗ Not confirmed"}</p>
              </div>
              <div className={`p-3 rounded-lg ${trade.isInKillzone ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                <p className="text-zinc-500 dark:text-zinc-400">Killzone</p>
                <p className="font-medium mt-1">{trade.isInKillzone ? "✓ In Zone" : "✗ Outside"}</p>
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
        </div>

        <div className="flex items-center justify-between p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Delete Trade
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Edit Trade
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <span className="text-zinc-500 dark:text-zinc-400">{label}: </span>
      <span className="text-zinc-900 dark:text-zinc-100">{value || "N/A"}</span>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

import { useState } from "react";
