"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const environments = ["BACKTESTING", "DEMO", "LIVE"];

export default function StatisticsPage() {
  const trades = useQuery(api.trades.list);
  const [filters, setFilters] = useState({
    environment: "",
    instrument: "",
    session: "",
    tradeModel: "",
    startDate: "",
    endDate: "",
  });

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter((trade) => {
      if (filters.environment && trade.environment !== filters.environment) return false;
      if (filters.instrument && trade.instrument !== filters.instrument) return false;
      if (filters.session && trade.session !== filters.session) return false;
      if (filters.tradeModel && trade.tradeModel !== filters.tradeModel) return false;
      if (filters.startDate && new Date(trade.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(trade.createdAt) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [trades, filters]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const winningTrades = filteredTrades.filter((t) => t.winLossStatus === "WIN");
    const losingTrades = filteredTrades.filter((t) => t.winLossStatus === "LOSS");
    const breakEvenTrades = filteredTrades.filter((t) => t.winLossStatus === "BREAK_EVEN");
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnl = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) 
      : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    const avgQuality = totalTrades > 0 
      ? filteredTrades.reduce((sum, t) => sum + (t.tradeQualityScore || 0), 0) / totalTrades 
      : 0;
    
    const avgTrinityScore = totalTrades > 0 
      ? filteredTrades.filter(t => t.tradeQualityScore).reduce((sum, t) => {
          const score = ((t.followedTrinity ? 3 : 0) + (t.correctKillzone ? 3 : 0) + ((t.entryConfidence || 5) / 3.33));
          return sum + score;
        }, 0) / totalTrades 
      : 0;
    
    const avgDisciplineScore = totalTrades > 0 
      ? filteredTrades.reduce((sum, t) => sum + (t.disciplineScore || 5), 0) / totalTrades 
      : 0;
    
    const continuationTrades = filteredTrades.filter((t) => t.tradeModel === "CONTINUATION");
    const reversalTrades = filteredTrades.filter((t) => t.tradeModel === "REVERSAL");
    
    const bySession: Record<string, { count: number; wins: number; pnl: number; quality: number }> = {};
    const byInstrument: Record<string, { count: number; wins: number; pnl: number }> = {};
    
    filteredTrades.forEach((t) => {
      if (!bySession[t.session]) {
        bySession[t.session] = { count: 0, wins: 0, pnl: 0, quality: 0 };
      }
      bySession[t.session].count++;
      bySession[t.session].wins += t.winLossStatus === "WIN" ? 1 : 0;
      bySession[t.session].pnl += t.pnl || 0;
      bySession[t.session].quality += t.tradeQualityScore || 0;
      
      if (!byInstrument[t.instrument]) {
        byInstrument[t.instrument] = { count: 0, wins: 0, pnl: 0 };
      }
      byInstrument[t.instrument].count++;
      byInstrument[t.instrument].wins += t.winLossStatus === "WIN" ? 1 : 0;
      byInstrument[t.instrument].pnl += t.pnl || 0;
    });
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      winRate,
      totalPnl,
      avgWin,
      avgLoss,
      profitFactor,
      avgQuality,
      avgTrinityScore,
      avgDisciplineScore,
      continuationModel: {
        total: continuationTrades.length,
        winRate: continuationTrades.length > 0 
          ? (continuationTrades.filter((t) => t.winLossStatus === "WIN").length / continuationTrades.length) * 100 
          : 0,
        avgQuality: continuationTrades.length > 0 
          ? continuationTrades.reduce((sum, t) => sum + (t.tradeQualityScore || 0), 0) / continuationTrades.length 
          : 0,
      },
      reversalModel: {
        total: reversalTrades.length,
        winRate: reversalTrades.length > 0 
          ? (reversalTrades.filter((t) => t.winLossStatus === "WIN").length / reversalTrades.length) * 100 
          : 0,
        avgQuality: reversalTrades.length > 0 
          ? reversalTrades.reduce((sum, t) => sum + (t.tradeQualityScore || 0), 0) / reversalTrades.length 
          : 0,
      },
      bySession: Object.entries(bySession).map(([session, data]) => ({
        session,
        ...data,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
        avgQuality: data.count > 0 ? data.quality / data.count : 0,
      })),
      byInstrument: Object.entries(byInstrument).map(([instrument, data]) => ({
        instrument,
        ...data,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
      })),
    };
  }, [filteredTrades]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Statistics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Track your trading performance and WWA compliance
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={filters.environment}
            onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Environment</option>
            {environments.map((env) => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
          <select
            value={filters.instrument}
            onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Instrument</option>
            {instruments.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
          <select
            value={filters.session}
            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Session</option>
            {sessions.map((sess) => (
              <option key={sess} value={sess}>{sess}</option>
            ))}
          </select>
          <select
            value={filters.tradeModel}
            onChange={(e) => setFilters({ ...filters, tradeModel: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Model</option>
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Start date"
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="End date"
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Trades</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {stats.totalTrades}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Win Rate</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {stats.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total P&L</p>
          <p className={`text-3xl font-bold mt-1 ${
            stats.totalPnl >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            ${stats.totalPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Quality</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {stats.avgQuality.toFixed(1)}/10
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Profit Factor</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {stats.profitFactor.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Trinity Score</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {stats.avgTrinityScore.toFixed(1)}/10
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Discipline</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {stats.avgDisciplineScore.toFixed(1)}/10
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Win</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ${stats.avgWin.toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg Loss</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            ${stats.avgLoss.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
            Performance by Model
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Continuation</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {stats.continuationModel.total} trades | {stats.continuationModel.winRate.toFixed(1)}% WR | Q: {stats.continuationModel.avgQuality.toFixed(1)}/10
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Reversal</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {stats.reversalModel.total} trades | {stats.reversalModel.winRate.toFixed(1)}% WR | Q: {stats.reversalModel.avgQuality.toFixed(1)}/10
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
            Performance by Session
          </h3>
          <div className="space-y-3">
            {stats.bySession.length > 0 ? (
              stats.bySession.map((s) => (
                <div key={s.session} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{s.session}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {s.count} trades | {s.winRate.toFixed(1)}% WR | Q: {s.avgQuality.toFixed(1)}/10
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
          Performance by Instrument
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Instrument</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Trades</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Win Rate</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">Total P&L</th>
              </tr>
            </thead>
            <tbody>
              {stats.byInstrument.length > 0 ? (
                stats.byInstrument.map((i) => (
                  <tr key={i.instrument} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">{i.instrument}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-600 dark:text-zinc-400">{i.count}</td>
                    <td className="px-4 py-3 text-sm text-right text-zinc-600 dark:text-zinc-400">{i.winRate.toFixed(1)}%</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      i.pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      ${i.pnl.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}
