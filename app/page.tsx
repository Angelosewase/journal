"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, TrendingUp, TrendingDown, Minus, Sun, Moon, ArrowRight, Target, DollarSign, BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TodayPage() {
  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);

  const today = new Date().toISOString().split("T")[0];
  const todayBias = dailyBiases?.find((b) => b.date === today);
  const todayTrades = trades?.filter(
    (t) => new Date(t.createdAt).toISOString().split("T")[0] === today
  );

  const todayPnl = todayTrades?.reduce((sum, t) => sum + (t.pnl || 0), 0) || 0;
  const wins = todayTrades?.filter((t) => t.winLossStatus === "WIN").length || 0;
  const losses = todayTrades?.filter((t) => t.winLossStatus === "LOSS").length || 0;
  const total = todayTrades?.length || 0;

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case "BULLISH": return <TrendingUp className="h-4 w-4" />;
      case "BEARISH": return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getBiasColors = (bias: string) => {
    switch (bias) {
      case "BULLISH": return { pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" };
      case "BEARISH": return { pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", dot: "bg-red-500" };
      default: return { pill: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", dot: "bg-zinc-400" };
    }
  };

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const fullDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">

        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">{dayName}</p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">{fullDate}</h1>
          </div>
          <Link
            href="/trades/new"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Trade
          </Link>
        </div>

        {/* ── Overview strip (like Crextio's top bar) ── */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">

            {/* Trades today */}
            <div className="pr-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Trades Today</p>
              <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{total}</p>
              {total > 0 ? (
                <>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-emerald-600">{wins}W</span>
                    <span className="text-sm font-bold text-red-500">{losses}L</span>
                    <span className="text-sm font-bold text-zinc-400">{total - wins - losses}BE</span>
                  </div>
                  <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden w-full">
                    {total > 0 && <>
                      <div className="bg-emerald-500 h-full" style={{ width: `${(wins / total) * 100}%` }} />
                      <div className="bg-red-400 h-full" style={{ width: `${(losses / total) * 100}%` }} />
                      <div className="bg-zinc-300 dark:bg-zinc-700 h-full" style={{ width: `${((total - wins - losses) / total) * 100}%` }} />
                    </>}
                  </div>
                </>
              ) : (
                <p className="text-xs text-zinc-400 mt-2">No trades yet today</p>
              )}
            </div>

            {/* P&L */}
            <div className="px-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">P&L Today</p>
              <p className={`text-4xl font-bold leading-none ${todayPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {todayPnl >= 0 ? "+" : ""}${todayPnl.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {todayPnl >= 0
                  ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                <p className="text-xs text-zinc-400">Realised profit / loss</p>
              </div>
            </div>

            {/* Morning Bias */}
            <div className="px-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Morning Bias</p>
              {todayBias ? (
                <>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${getBiasColors(todayBias.currentDailyBias).pill}`}>
                    {getBiasIcon(todayBias.currentDailyBias)}
                    {todayBias.currentDailyBias}
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">Confidence: {todayBias.biasConfidence}/10</p>
                </>
              ) : (
                <Link href="/daily-bias/morning" className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-1">
                  Set bias <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {/* Session & Model */}
            <div className="pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Session & Model</p>
              {todayBias ? (
                <>
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{todayBias.sessionToTrade}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">{todayBias.modelToFocus || "—"}</p>
                  <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">{todayBias.bestInstrument || "No instrument set"}</p>
                </>
              ) : (
                <p className="text-sm text-zinc-400 mt-1">Not configured</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Bias cards row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Morning Bias card */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Sun className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Morning Bias</p>
                  <p className="text-[10px] text-zinc-400">Pre-market analysis & trading plan</p>
                </div>
              </div>
              {todayBias && (
                <Link href="/daily-bias/morning" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                  Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {todayBias ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getBiasColors(todayBias.currentDailyBias).pill}`}>
                    {getBiasIcon(todayBias.currentDailyBias)}
                    {todayBias.currentDailyBias}
                  </span>
                  <span className="text-xs text-zinc-400">Confidence: {todayBias.biasConfidence}/10</span>
                </div>

                {todayBias.biasReason && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{todayBias.biasReason}</p>
                )}

                <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Session", value: todayBias.sessionToTrade },
                    { label: "Instrument", value: todayBias.bestInstrument || "—" },
                    { label: "Model", value: todayBias.modelToFocus },
                    { label: "Confidence", value: `${todayBias.confidenceForToday}/10` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">{label}</p>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                  <Sun className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-400">No morning bias set yet</p>
                <Link
                  href="/daily-bias/morning"
                  className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                >
                  Set Morning Bias
                </Link>
              </div>
            )}
          </div>

          {/* Evening Review card */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Evening Review</p>
                  <p className="text-[10px] text-zinc-400">Post-market analysis & lessons learned</p>
                </div>
              </div>
              {todayBias?.actualMovement && (
                <Link href="/daily-bias/evening" className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                  Details <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {todayBias?.actualMovement ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-2">Morning Bias</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBiasColors(todayBias.currentDailyBias).pill}`}>
                      {getBiasIcon(todayBias.currentDailyBias)}
                      {todayBias.currentDailyBias}
                    </span>
                  </div>
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-2">Actual Move</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBiasColors(todayBias.actualMovement).pill}`}>
                      {getBiasIcon(todayBias.actualMovement)}
                      {todayBias.actualMovement}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Accuracy</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{todayBias.accuracyScore ?? 0}<span className="text-sm font-normal text-zinc-400">/10</span></p>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(todayBias.accuracyScore ?? 0 / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Discipline</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{todayBias.overallDiscipline ?? 0}<span className="text-sm font-normal text-zinc-400">/10</span></p>
                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(todayBias.overallDiscipline ?? 0 / 10) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {todayBias.tradesTaken !== undefined && (
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">Trade Outcomes</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      <span className="text-emerald-600 font-semibold">{todayBias.tradesWorked || 0} worked</span>
                      {" · "}
                      <span className="text-red-500 font-semibold">{todayBias.tradesFailed || 0} failed</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                  <Moon className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-400">Complete your evening review</p>
                <Link
                  href="/daily-bias/evening"
                  className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Complete Evening Review
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Today's Trades ── */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Today&apos;s Trades</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{total} trade{total !== 1 ? "s" : ""} recorded today</p>
            </div>
            <Link
              href="/trades"
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors font-medium"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todayTrades && todayTrades.length > 0 ? (
            <div className="space-y-2">
              {todayTrades.map((trade) => {
                const pnl = trade.pnl || 0;
                return (
                  <Link
                    key={trade._id}
                    href={`/trades/${trade._id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Direction badge */}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        trade.direction === "LONG"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {trade.direction}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{trade.instrument}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {trade.entryPrice} → {trade.exitPrice || "Open"} · SL: {trade.stopLossPrice}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {trade.pnl !== undefined ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : "Open"}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{trade.winLossStatus || "Pending"}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-400">No trades recorded today</p>
              <Link
                href="/trades/new"
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                Log Your First Trade
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}