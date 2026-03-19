"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { TradeForm } from "@/components/TradeForm";
import { DailyBiasForm } from "@/components/DailyBiasForm";
import { api } from "@/convex/_generated/api";

export default function TodayPage() {
  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showBiasForm, setShowBiasForm] = useState(false);
  const [showEveningReview, setShowEveningReview] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);
  const todayTrades = trades?.filter(
    (t) => new Date(t.createdAt).toISOString().split("T")[0] === today
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Today</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={() => setShowTradeForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <PlusIcon />
          Add Trade
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
          Morning Bias
        </h2>
        {todayBias ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  todayBias.currentDailyBias === "BULLISH"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : todayBias.currentDailyBias === "BEARISH"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {todayBias.currentDailyBias}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                Confidence: {todayBias.biasConfidence}/10
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">{todayBias.biasReason}</p>
            <div className="flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <span>Session: {todayBias.sessionToTrade}</span>
              <span>Model: {todayBias.modelToFocus}</span>
              <span>Confidence: {todayBias.confidenceForToday}/10</span>
            </div>
            <button
              onClick={() => setShowBiasForm(true)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Edit Morning Bias
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              No morning bias set for today yet.
            </p>
            <button
              onClick={() => setShowBiasForm(true)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Set Morning Bias
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Today&apos;s Trades
          </h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {todayTrades?.length || 0} trade{(todayTrades?.length || 0) !== 1 ? "s" : ""}
          </span>
        </div>
        {todayTrades && todayTrades.length > 0 ? (
          <div className="space-y-3">
            {todayTrades.map((trade) => (
              <div
                key={trade._id}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.direction === "LONG"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {trade.direction}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {trade.instrument}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Entry: {trade.entryPrice} | SL: {trade.stopLossPrice}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-medium ${
                      (trade.pnl || 0) >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "Open"}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {trade.winLossStatus || "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No trades recorded today.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
          Evening Review
        </h2>
        {todayBias?.actualMovement ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Morning Bias</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {todayBias.currentDailyBias}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Actual Movement</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {todayBias.actualMovement}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Accuracy</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {todayBias.wasCorrect} ({todayBias.accuracyScore}/10)
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Discipline</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {todayBias.overallDiscipline}/10
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEveningReview(true)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Edit Evening Review
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Complete your evening review to analyze today&apos;s performance.
            </p>
            <button
              onClick={() => setShowEveningReview(true)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Complete Evening Review
            </button>
          </div>
        )}
      </div>

      {showTradeForm && (
        <TradeForm onClose={() => setShowTradeForm(false)} />
      )}
      
      {(showBiasForm || showEveningReview) && (
        <DailyBiasForm
          onClose={() => {
            setShowBiasForm(false);
            setShowEveningReview(false);
          }}
          mode={showEveningReview ? "evening" : "morning"}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
