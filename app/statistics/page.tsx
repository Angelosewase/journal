"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const environments = ["BACKTESTING", "DEMO", "LIVE"];

function CircularProgress({ percentage = 0, size = 96, strokeWidth = 7, color = "#10b981" }: {
  percentage?: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 z-10">{percentage.toFixed(0)}%</span>
    </div>
  );
}

function MiniBar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 ${className}`}>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, hint, valueClass = "" }: {
  label: string; value: React.ReactNode; sub?: string; hint?: string; valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">{label}</p>
      <div className={`text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-none ${valueClass}`}>{value}</div>
      {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{sub}</p>}
      {hint && <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">{hint}</p>}
    </div>
  );
}

const activeFilterCount = (f: Record<string, string>) =>
  Object.values(f).filter(Boolean).length;

export default function StatisticsPage() {
  const trades = useQuery(api.trades.list);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    environment: "", instrument: "", session: "", tradeModel: "", startDate: "", endDate: "",
  });

  const setFilter = (key: string, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const clearFilters = () =>
    setFilters({ environment: "", instrument: "", session: "", tradeModel: "", startDate: "", endDate: "" });

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter((t) => {
      if (filters.environment && t.environment !== filters.environment) return false;
      if (filters.instrument && t.instrument !== filters.instrument) return false;
      if (filters.session && t.session !== filters.session) return false;
      if (filters.tradeModel && t.tradeModel !== filters.tradeModel) return false;
      if (filters.startDate && new Date(t.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(t.createdAt) > new Date(filters.endDate + "T23:59:59")) return false;
      return true;
    });
  }, [trades, filters]);

  const stats = useMemo(() => {
    const total = filteredTrades.length;
    const wins = filteredTrades.filter((t) => t.winLossStatus === "WIN");
    const losses = filteredTrades.filter((t) => t.winLossStatus === "LOSS");
    const be = filteredTrades.filter((t) => t.winLossStatus === "BREAK_EVEN");
    const winRate = total > 0 ? (wins.length / total) * 100 : 0;
    const totalPnl = filteredTrades.reduce((s, t) => s + (t.pnl || 0), 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length) : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    const avgQuality = total > 0 ? filteredTrades.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / total : 0;
    const avgTrinity = total > 0
      ? filteredTrades.filter((t) => t.tradeQualityScore).reduce((s, t) => {
          return s + ((t.followedTrinity ? 3 : 0) + (t.correctKillzone ? 3 : 0) + ((t.entryConfidence || 5) / 3.33));
        }, 0) / total
      : 0;
    const avgDiscipline = total > 0
      ? filteredTrades.reduce((s, t) => s + (t.disciplineScore || 5), 0) / total : 0;

    const cont = filteredTrades.filter((t) => t.tradeModel === "CONTINUATION");
    const rev = filteredTrades.filter((t) => t.tradeModel === "REVERSAL");

    const bySession: Record<string, { count: number; wins: number; pnl: number; quality: number }> = {};
    const byInstrument: Record<string, { count: number; wins: number; pnl: number }> = {};
    filteredTrades.forEach((t) => {
      if (!bySession[t.session]) bySession[t.session] = { count: 0, wins: 0, pnl: 0, quality: 0 };
      bySession[t.session].count++;
      bySession[t.session].wins += t.winLossStatus === "WIN" ? 1 : 0;
      bySession[t.session].pnl += t.pnl || 0;
      bySession[t.session].quality += t.tradeQualityScore || 0;

      if (!byInstrument[t.instrument]) byInstrument[t.instrument] = { count: 0, wins: 0, pnl: 0 };
      byInstrument[t.instrument].count++;
      byInstrument[t.instrument].wins += t.winLossStatus === "WIN" ? 1 : 0;
      byInstrument[t.instrument].pnl += t.pnl || 0;
    });

    return {
      total, wins: wins.length, losses: losses.length, be: be.length,
      winRate, totalPnl, avgWin, avgLoss, profitFactor,
      avgQuality, avgTrinity, avgDiscipline,
      cont: {
        total: cont.length,
        winRate: cont.length > 0 ? (cont.filter((t) => t.winLossStatus === "WIN").length / cont.length) * 100 : 0,
        quality: cont.length > 0 ? cont.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / cont.length : 0,
      },
      rev: {
        total: rev.length,
        winRate: rev.length > 0 ? (rev.filter((t) => t.winLossStatus === "WIN").length / rev.length) * 100 : 0,
        quality: rev.length > 0 ? rev.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / rev.length : 0,
      },
      bySession: Object.entries(bySession).map(([session, d]) => ({
        session, ...d, winRate: d.count > 0 ? (d.wins / d.count) * 100 : 0,
        avgQuality: d.count > 0 ? d.quality / d.count : 0,
      })),
      byInstrument: Object.entries(byInstrument).map(([instrument, d]) => ({
        instrument, ...d, winRate: d.count > 0 ? (d.wins / d.count) * 100 : 0,
      })),
    };
  }, [filteredTrades]);

  const numFilters = activeFilterCount(filters);

  return (
    <div className="min-h-screen ">
      <div className=" mx-auto px-6 py-4 space-y-6 pb-16">

        {/* Header row */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Statistics</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Track your trading performance and WWA compliance</p>
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setFiltersOpen((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all shadow-sm ${
              filtersOpen || numFilters > 0
                ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {numFilters > 0 && (
              <span className="ml-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {numFilters}
              </span>
            )}
            {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Filter panel — collapsible */}
        {filtersOpen && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Filter trades</p>
              {numFilters > 0 && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: "environment", label: "Environment", options: environments },
                { key: "instrument", label: "Instrument", options: instruments },
                { key: "session", label: "Session", options: sessions },
                { key: "tradeModel", label: "Model", options: models },
              ].map(({ key, label, options }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</Label>
                  <Select value={filters[key as keyof typeof filters]} onValueChange={(v) => setFilter(key, v)}>
                    <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>All</SelectItem>
                      {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">From</Label>
                <Input type="date" value={filters.startDate}
                  onChange={(e) => setFilter("startDate", e.target.value)}
                  className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">To</Label>
                <Input type="date" value={filters.endDate}
                  onChange={(e) => setFilter("endDate", e.target.value)}
                  className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800" />
              </div>
            </div>
          </div>
        )}

        {/* ── ROW 1: Overview bar (like Crextio's top stat strip) ── */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
            <div className="pr-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Total Trades</p>
              <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{stats.total}</p>
              <p className="text-xs text-zinc-400 mt-2">All completed trades in selection</p>
            </div>
            <div className="px-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Outcome Split</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-600">{stats.wins}</span>
                <span className="text-xs text-zinc-400">W</span>
                <span className="text-2xl font-bold text-red-500">{stats.losses}</span>
                <span className="text-xs text-zinc-400">L</span>
                <span className="text-2xl font-bold text-zinc-400">{stats.be}</span>
                <span className="text-xs text-zinc-400">BE</span>
              </div>
              {/* mini bar */}
              <div className="flex gap-0.5 mt-3 h-1.5 rounded-full overflow-hidden w-full">
                {stats.total > 0 && <>
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(stats.wins / stats.total) * 100}%` }} />
                  <div className="bg-red-400 h-full transition-all" style={{ width: `${(stats.losses / stats.total) * 100}%` }} />
                  <div className="bg-zinc-300 dark:bg-zinc-700 h-full transition-all" style={{ width: `${(stats.be / stats.total) * 100}%` }} />
                </>}
              </div>
            </div>
            <div className="px-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Win Rate</p>
              <div className="flex items-center gap-3">
                <CircularProgress percentage={stats.winRate} size={72} strokeWidth={6} />
                <div>
                  <p className="text-xs text-zinc-400 leading-tight">Wins ÷ total trades</p>
                  <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Target: &gt;50%</p>
                </div>
              </div>
            </div>
            <div className="pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Total P&L</p>
              <p className={`text-4xl font-bold leading-none ${stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                ${stats.totalPnl.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stats.totalPnl >= 0
                  ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                <p className="text-xs text-zinc-400">Sum of all trade P&L</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Risk & Quality ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Risk metrics */}
          <StatGroup>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-5">Risk Metrics</p>
            <div className="grid grid-cols-3 gap-4">
              <Stat
                label="Avg Win"
                value={<span className="text-emerald-600">${stats.avgWin.toFixed(2)}</span>}
                hint="Mean P&L of winning trades"
              />
              <Stat
                label="Avg Loss"
                value={<span className="text-red-500">-${stats.avgLoss.toFixed(2)}</span>}
                hint="Mean loss of losing trades (abs)"
              />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Profit Factor</p>
                <p className={`text-2xl font-bold leading-none ${stats.profitFactor >= 1 ? "text-zinc-900 dark:text-zinc-50" : "text-red-500"}`}>
                  {stats.profitFactor.toFixed(2)}
                </p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">Avg Win ÷ Avg Loss · &gt;1 is profitable</p>
                <MiniBar value={Math.min(stats.profitFactor, 3)} max={3} color={stats.profitFactor >= 1 ? "bg-emerald-500" : "bg-red-400"} />
              </div>
            </div>
          </StatGroup>

          {/* Quality metrics */}
          <StatGroup>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-5">Quality & Discipline</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Trade Quality</p>
                <p className="text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">{stats.avgQuality.toFixed(1)}<span className="text-sm font-normal text-zinc-400">/10</span></p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">Overall setup & execution score</p>
                <MiniBar value={stats.avgQuality} max={10} />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Trinity Score</p>
                <p className="text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">{stats.avgTrinity.toFixed(1)}<span className="text-sm font-normal text-zinc-400">/10</span></p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">Trend + Killzone + Entry confidence</p>
                <MiniBar value={stats.avgTrinity} max={10} color="bg-sky-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Discipline</p>
                <p className="text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">{stats.avgDiscipline.toFixed(1)}<span className="text-sm font-normal text-zinc-400">/10</span></p>
                <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">Rule adherence per trade</p>
                <MiniBar value={stats.avgDiscipline} max={10} color="bg-amber-500" />
              </div>
            </div>
          </StatGroup>
        </div>

        {/* ── ROW 3: Model & Session performance side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Model */}
          <StatGroup>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Performance by Model</p>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mb-4">Win rate and avg quality score split by trade model type</p>
            <div className="space-y-3">
              {[
                { label: "Continuation", data: stats.cont, color: "bg-emerald-500" },
                { label: "Reversal", data: stats.rev, color: "bg-sky-500" },
              ].map(({ label, data, color }) => (
                <div key={label} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${color}`} />
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</span>
                    </div>
                    <span className="text-xs text-zinc-400">{data.total} trades</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Win Rate</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{data.winRate.toFixed(1)}%</p>
                      <MiniBar value={data.winRate} max={100} color={color} />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Avg Quality</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{data.quality.toFixed(1)}<span className="text-xs font-normal text-zinc-400">/10</span></p>
                      <MiniBar value={data.quality} max={10} color={color} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </StatGroup>

          {/* Session */}
          <StatGroup>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">Performance by Session</p>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mb-4">Which market session you perform best in</p>
            {stats.bySession.length > 0 ? (
              <div className="space-y-3">
                {stats.bySession.map((s, i) => {
                  const colors = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-violet-500"];
                  return (
                    <div key={s.session} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
                          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{s.session}</span>
                        </div>
                        <span className="text-xs text-zinc-400">{s.count} trades</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Win Rate</p>
                          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{s.winRate.toFixed(1)}%</p>
                          <MiniBar value={s.winRate} max={100} color={colors[i % colors.length]} />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Avg Quality</p>
                          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{s.avgQuality.toFixed(1)}<span className="text-xs font-normal text-zinc-400">/10</span></p>
                          <MiniBar value={s.avgQuality} max={10} color={colors[i % colors.length]} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-sm text-zinc-400">No session data yet</div>
            )}
          </StatGroup>
        </div>

        {/* ── ROW 4: Instrument table ── */}
        <StatGroup>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Performance by Instrument</p>
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600">P&L, win rate, and trade count per pair</p>
          </div>
          {stats.byInstrument.length > 0 ? (
            <div className="mt-4 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50 dark:bg-zinc-800/60 border-0">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">Instrument</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">Trades</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">Win Rate</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">Total P&L</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 w-28">Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.byInstrument
                    .sort((a, b) => b.pnl - a.pnl)
                    .map((item) => {
                      const maxPnl = Math.max(...stats.byInstrument.map((x) => Math.abs(x.pnl)), 1);
                      return (
                        <TableRow key={item.instrument} className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <TableCell className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 py-3">{item.instrument}</TableCell>
                          <TableCell className="text-right text-sm text-zinc-500 py-3">{item.count}</TableCell>
                          <TableCell className="text-right py-3">
                            <span className={`text-sm font-semibold ${item.winRate >= 50 ? "text-emerald-600" : "text-red-500"}`}>
                              {item.winRate.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className={`text-right font-bold text-sm py-3 ${item.pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(2)}
                          </TableCell>
                          <TableCell className="py-3 w-28">
                            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${item.pnl >= 0 ? "bg-emerald-500" : "bg-red-400"}`}
                                style={{ width: `${(Math.abs(item.pnl) / maxPnl) * 100}%` }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-sm text-zinc-400">No instrument data yet</div>
          )}
        </StatGroup>

      </div>
    </div>
  );
}