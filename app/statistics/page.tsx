"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Target,
  Shield,
  Zap,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Flame,
  Snowflake,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  activeFilterCount,
  computeTradeStatistics,
  EMPTY_FILTERS,
  getPeriodStart,
  type TradeFilters,
  type GroupStats,
  type Insight,
} from "@/lib/trade-statistics";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const environments = ["BACKTESTING", "DEMO", "LIVE"];
const PERIODS = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "all", label: "All" },
] as const;

type Period = (typeof PERIODS)[number]["id"];

function CircularProgress({
  percentage = 0,
  size = 96,
  strokeWidth = 7,
  color = "#10b981",
}: {
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
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

function Stat({
  label,
  value,
  sub,
  hint,
  valueClass = "",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  hint?: string;
  valueClass?: string;
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

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">{title}</p>
      {description && <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">{description}</p>}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const styles = {
    positive: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20",
    negative: "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20",
    neutral: "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30",
  };
  const icons = {
    positive: ArrowUpRight,
    negative: ArrowDownRight,
    neutral: Lightbulb,
  };
  const iconColors = {
    positive: "text-emerald-600",
    negative: "text-red-500",
    neutral: "text-amber-500",
  };
  const Icon = icons[insight.type];

  return (
    <div className={cn("rounded-xl border p-4 flex gap-3", styles[insight.type])}>
      <div className={cn("mt-0.5 shrink-0", iconColors[insight.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{insight.title}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{insight.description}</p>
      </div>
    </div>
  );
}

function GroupPerformanceCard({
  item,
  color,
  showPnl = false,
}: {
  item: GroupStats;
  color: string;
  showPnl?: boolean;
}) {
  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", color)} />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{item.label}</span>
        </div>
        <span className="text-xs text-zinc-400">{item.count} trades</span>
      </div>
      <div className={cn("grid gap-4", showPnl ? "grid-cols-3" : "grid-cols-2")}>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Win Rate</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{item.winRate.toFixed(1)}%</p>
          <MiniBar value={item.winRate} max={100} color={color} />
        </div>
        <div>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Avg Quality</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {item.avgQuality.toFixed(1)}
            <span className="text-xs font-normal text-zinc-400">/10</span>
          </p>
          <MiniBar value={item.avgQuality} max={10} color={color} />
        </div>
        {showPnl && (
          <div>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide">P&L</p>
            <p className={cn("text-lg font-bold", item.pnl >= 0 ? "text-emerald-600" : "text-red-500")}>
              {item.pnl >= 0 ? "+" : ""}${item.pnl.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function formatPnl(value: number) {
  return `${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;
}

export default function StatisticsPage() {
  const trades = useQuery(api.trades.list);
  const [period, setPeriod] = useState<Period>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<TradeFilters>(EMPTY_FILTERS);

  const setFilter = (key: keyof TradeFilters, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPeriod("all");
  };

  const applyPeriod = (p: Period) => {
    setPeriod(p);
    setFilters((prev) => ({ ...prev, startDate: getPeriodStart(p), endDate: "" }));
  };

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    let result = trades;
    if (filters.environment) result = result.filter((t) => t.environment === filters.environment);
    if (filters.instrument) result = result.filter((t) => t.instrument === filters.instrument);
    if (filters.session) result = result.filter((t) => t.session === filters.session);
    if (filters.tradeModel) result = result.filter((t) => t.tradeModel === filters.tradeModel);
    if (filters.startDate) result = result.filter((t) => new Date(t.createdAt) >= new Date(filters.startDate));
    if (filters.endDate)
      result = result.filter((t) => new Date(t.createdAt) <= new Date(filters.endDate + "T23:59:59"));
    return result;
  }, [trades, filters]);

  const stats = useMemo(() => computeTradeStatistics(filteredTrades), [filteredTrades]);
  const numFilters = activeFilterCount(filters);

  if (trades === undefined) return <LoadingSkeleton />;

  const chartPositive = stats.totalPnl >= 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Statistics</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              Performance analytics, WWA compliance, and actionable insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPeriod(p.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    period === p.id
                      ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setFiltersOpen((p) => !p)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all shadow-sm",
                filtersOpen || numFilters > 0
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {numFilters > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {numFilters}
                </span>
              )}
              {filtersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Filters */}
        {filtersOpen && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Filter trades</p>
              {numFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: "environment" as const, label: "Environment", options: environments },
                { key: "instrument" as const, label: "Instrument", options: instruments },
                { key: "session" as const, label: "Session", options: sessions },
                { key: "tradeModel" as const, label: "Model", options: models },
              ].map(({ key, label, options }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</Label>
                  <Select value={filters[key] || undefined} onValueChange={(v) => setFilter(key, v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {options.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">From</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => {
                    setFilter("startDate", e.target.value);
                    setPeriod("all");
                  }}
                  className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">To</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => {
                    setFilter("endDate", e.target.value);
                    setPeriod("all");
                  }}
                  className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.total === 0 ? (
          <StatGroup className="py-16 text-center">
            <Target className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No trades match your filters</p>
            <p className="text-xs text-zinc-400 mt-1">Adjust filters or log more trades to see statistics</p>
          </StatGroup>
        ) : (
          <>
            {/* Insights */}
            {stats.insights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stats.insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            )}

            {/* Overview strip */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800 gap-y-5">
                <div className="lg:pr-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Total Trades</p>
                  <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{stats.total}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-emerald-600">{stats.wins}W</span>
                    <span className="text-sm font-bold text-red-500">{stats.losses}L</span>
                    <span className="text-sm font-bold text-zinc-400">{stats.be}BE</span>
                  </div>
                </div>
                <div className="lg:px-6 pt-5 lg:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Win Rate</p>
                  <div className="flex items-center gap-3">
                    <CircularProgress
                      percentage={stats.winRate}
                      size={72}
                      strokeWidth={6}
                      color={stats.winRate >= 50 ? "#10b981" : "#ef4444"}
                    />
                    <div>
                      <p className="text-xs text-zinc-400">Expectancy</p>
                      <p className={cn("text-lg font-bold", stats.expectancy >= 0 ? "text-emerald-600" : "text-red-500")}>
                        {formatPnl(stats.expectancy)}
                      </p>
                      <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-0.5">per trade</p>
                    </div>
                  </div>
                </div>
                <div className="lg:px-6 pt-5 lg:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Total P&L</p>
                  <p className={cn("text-4xl font-bold leading-none", stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {formatPnl(stats.totalPnl)}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                    <span className="text-emerald-600 font-medium">Best {formatPnl(stats.biggestWin)}</span>
                    <span className="text-red-500 font-medium">Worst {formatPnl(stats.biggestLoss)}</span>
                  </div>
                </div>
                <div className="lg:pl-6 pt-5 lg:pt-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Streaks</p>
                  <div className="flex items-center gap-4">
                    {stats.currentWinStreak > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-2xl font-bold text-orange-500">{stats.currentWinStreak}W</span>
                      </div>
                    ) : stats.currentLossStreak > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <Snowflake className="h-4 w-4 text-sky-400" />
                        <span className="text-2xl font-bold text-red-500">{stats.currentLossStreak}L</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Minus className="h-4 w-4 text-zinc-400" />
                        <span className="text-lg font-medium text-zinc-400">No streak</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2">
                    Best: {stats.maxWinStreak}W · Worst: {stats.maxLossStreak}L
                  </p>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <StatGroup className="lg:col-span-3">
                <SectionTitle title="Equity Curve" description="Cumulative P&L across filtered trades" />
                {stats.equityCurve.length > 1 ? (
                  <div className="h-64 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="statsEquityGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartPositive ? "#10b981" : "#ef4444"} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={chartPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          stroke="#71717a"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#71717a"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `$${v}`}
                          width={55}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgb(24 24 27)",
                            border: "1px solid rgb(63 63 63)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          labelFormatter={(v) =>
                            new Date(Number(v)).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          }
                          formatter={(v) => [`$${Number(v).toFixed(2)}`, "Cumulative P&L"]}
                          itemStyle={{ color: "#e4e4e7" }}
                          labelStyle={{ color: "#e4e4e7" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          stroke={chartPositive ? "#10b981" : "#ef4444"}
                          strokeWidth={2}
                          fill="url(#statsEquityGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 py-16 text-center">Need at least 2 trades for equity curve</p>
                )}
              </StatGroup>

              <StatGroup className="lg:col-span-2">
                <SectionTitle title="Daily P&L" description="Profit/loss by trading day" />
                {stats.dailyPnl.length > 0 ? (
                  <div className="h-64 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.dailyPnl.slice(-14)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          stroke="#71717a"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#71717a"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `$${v}`}
                          width={45}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgb(24 24 27)",
                            border: "1px solid rgb(63 63 63)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(v, _n, props) => {
                            const payload = props.payload as { trades: number };
                            return [`$${Number(v).toFixed(2)} (${payload.trades} trades)`, "P&L"];
                          }}
                          labelStyle={{ color: "#e4e4e7" }}
                          itemStyle={{ color: "#e4e4e7" }}
                        />
                        <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                          {stats.dailyPnl.slice(-14).map((entry, i) => (
                            <Cell key={i} fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400 py-16 text-center">No daily data</p>
                )}
              </StatGroup>
            </div>

            {/* Tabs for deeper sections */}
            <Tabs defaultValue="performance" className="gap-4">
              <TabsList className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-full p-1 h-auto">
                <TabsTrigger value="performance" className="rounded-full px-4 py-1.5 text-xs">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="compliance" className="rounded-full px-4 py-1.5 text-xs">
                  WWA Compliance
                </TabsTrigger>
                <TabsTrigger value="breakdowns" className="rounded-full px-4 py-1.5 text-xs">
                  Breakdowns
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <StatGroup>
                    <SectionTitle title="Risk Metrics" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Stat
                        label="Avg Win"
                        value={<span className="text-emerald-600">${stats.avgWin.toFixed(2)}</span>}
                      />
                      <Stat
                        label="Avg Loss"
                        value={<span className="text-red-500">-${stats.avgLoss.toFixed(2)}</span>}
                      />
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Profit Factor</p>
                        <p
                          className={cn(
                            "text-2xl font-bold leading-none",
                            stats.profitFactor >= 1 ? "text-zinc-900 dark:text-zinc-50" : "text-red-500",
                          )}
                        >
                          {stats.profitFactor >= 999 ? "∞" : stats.profitFactor.toFixed(2)}
                        </p>
                        <MiniBar
                          value={Math.min(stats.profitFactor, 3)}
                          max={3}
                          color={stats.profitFactor >= 1 ? "bg-emerald-500" : "bg-red-400"}
                        />
                      </div>
                      <Stat
                        label="Avg R:R"
                        value={
                          <>
                            {stats.avgFinalRR.toFixed(2)}
                            <span className="text-sm font-normal text-zinc-400">R</span>
                          </>
                        }
                        hint="Final risk-reward achieved"
                      />
                      <Stat
                        label="Avg Risk"
                        value={
                          <>
                            {stats.avgRiskPct.toFixed(2)}
                            <span className="text-sm font-normal text-zinc-400">%</span>
                          </>
                        }
                        hint="Per-trade risk allocation"
                      />
                      <Stat
                        label="T1 Hit Rate"
                        value={`${stats.target1HitRate.toFixed(0)}%`}
                        hint="Target 1 reached before exit"
                      />
                    </div>
                  </StatGroup>

                  <StatGroup>
                    <SectionTitle title="Quality & Discipline" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[
                        { label: "Trade Quality", value: stats.avgQuality, max: 10, color: "bg-emerald-500" },
                        { label: "Trinity Score", value: stats.avgTrinity, max: 10, color: "bg-sky-500" },
                        { label: "Discipline", value: stats.avgDiscipline, max: 10, color: "bg-amber-500" },
                      ].map(({ label, value, max, color }) => (
                        <div key={label} className="flex flex-col gap-0.5">
                          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{label}</p>
                          <p className="text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                            {value.toFixed(1)}
                            <span className="text-sm font-normal text-zinc-400">/10</span>
                          </p>
                          <MiniBar value={value} max={max} color={color} />
                        </div>
                      ))}
                      <Stat
                        label="BE Stops"
                        value={`${stats.beStopRate.toFixed(0)}%`}
                        hint="Trades where stop moved to breakeven"
                      />
                      <Stat
                        label="Avg Duration"
                        value={
                          stats.avgTimeInTrade > 0 ? (
                            <>
                              {Math.round(stats.avgTimeInTrade)}
                              <span className="text-sm font-normal text-zinc-400"> min</span>
                            </>
                          ) : (
                            "—"
                          )
                        }
                        hint="Time in trade"
                      />
                    </div>
                  </StatGroup>
                </div>

                {/* Quality vs outcome */}
                <StatGroup>
                  <SectionTitle
                    title="Quality vs Outcome"
                    description="How setup quality correlates with win rate and P&L"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.qualityBuckets.map((bucket) => (
                      <div
                        key={bucket.label}
                        className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-4 text-center"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                          Score {bucket.label}
                        </p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{bucket.count}</p>
                        <p className="text-xs text-zinc-400">trades</p>
                        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] text-zinc-400">Win Rate</p>
                            <p
                              className={cn(
                                "text-sm font-bold",
                                bucket.winRate >= 50 ? "text-emerald-600" : "text-red-500",
                              )}
                            >
                              {bucket.count > 0 ? `${bucket.winRate.toFixed(0)}%` : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-400">P&L</p>
                            <p
                              className={cn(
                                "text-sm font-bold",
                                bucket.pnl >= 0 ? "text-emerald-600" : "text-red-500",
                              )}
                            >
                              {bucket.count > 0 ? formatPnl(bucket.pnl) : "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </StatGroup>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <StatGroup>
                    <SectionTitle title="Performance by Model" />
                    <div className="space-y-3">
                      {[
                        { label: "Continuation", data: stats.cont, color: "bg-emerald-500" },
                        { label: "Reversal", data: stats.rev, color: "bg-sky-500" },
                      ].map(({ label, data, color }) => (
                        <div key={label} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", color)} />
                              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{label}</span>
                            </div>
                            <span className="text-xs text-zinc-400">{data.total} trades</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Win Rate</p>
                              <p className="text-lg font-bold">{data.winRate.toFixed(1)}%</p>
                              <MiniBar value={data.winRate} max={100} color={color} />
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Quality</p>
                              <p className="text-lg font-bold">
                                {data.quality.toFixed(1)}
                                <span className="text-xs font-normal text-zinc-400">/10</span>
                              </p>
                              <MiniBar value={data.quality} max={10} color={color} />
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-400 uppercase tracking-wide">P&L</p>
                              <p className={cn("text-lg font-bold", data.pnl >= 0 ? "text-emerald-600" : "text-red-500")}>
                                {formatPnl(data.pnl)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </StatGroup>

                  <StatGroup>
                    <SectionTitle title="Performance by Session" description="Which session you perform best in" />
                    {stats.bySession.length > 0 ? (
                      <div className="space-y-3">
                        {stats.bySession.map((s, i) => {
                          const colors = ["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-violet-500"];
                          return (
                            <GroupPerformanceCard
                              key={s.key}
                              item={s}
                              color={colors[i % colors.length]}
                              showPnl
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 py-8 text-center">No session data</p>
                    )}
                  </StatGroup>
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4 mt-0">
                <StatGroup>
                  <SectionTitle
                    title="WWA Framework Compliance"
                    description="Rule adherence and its impact on win rate"
                  />
                  <div className="space-y-4">
                    {stats.compliance.map((c) => (
                      <div key={c.label} className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{c.label}</span>
                          </div>
                          <span className="text-xs text-zinc-400">
                            {c.followed}/{c.total} followed
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                              <span>Compliance rate</span>
                              <span>{c.total > 0 ? `${c.rate.toFixed(0)}%` : "N/A"}</span>
                            </div>
                            <MiniBar value={c.rate} max={100} color="bg-emerald-500" />
                          </div>
                          {c.total > 0 && (
                            <div className="flex gap-4 text-center shrink-0">
                              <div>
                                <p className="text-[10px] text-zinc-400">When ✓</p>
                                <p className="text-sm font-bold text-emerald-600">{c.winRateWhenFollowed.toFixed(0)}%</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-400">When ✗</p>
                                <p className="text-sm font-bold text-red-500">{c.winRateWhenNot.toFixed(0)}%</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </StatGroup>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: Target, label: "Target 1 Hit", value: `${stats.target1HitRate.toFixed(0)}%` },
                    { icon: Zap, label: "BE Stop Usage", value: `${stats.beStopRate.toFixed(0)}%` },
                    { icon: Clock, label: "Avg Trade Time", value: stats.avgTimeInTrade > 0 ? `${Math.round(stats.avgTimeInTrade)}m` : "—" },
                  ].map(({ icon: Icon, label, value }) => (
                    <StatGroup key={label} className="flex flex-row items-center gap-4 py-5">
                      <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</p>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
                      </div>
                    </StatGroup>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="breakdowns" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <StatGroup>
                    <SectionTitle title="By Direction" />
                    {stats.byDirection.length > 0 ? (
                      <div className="space-y-3">
                        {stats.byDirection.map((d) => (
                          <GroupPerformanceCard
                            key={d.key}
                            item={d}
                            color={d.key === "LONG" ? "bg-emerald-500" : "bg-red-500"}
                            showPnl
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 py-8 text-center">No data</p>
                    )}
                  </StatGroup>

                  <StatGroup>
                    <SectionTitle title="By Environment" />
                    {stats.byEnvironment.length > 0 ? (
                      <div className="space-y-3">
                        {stats.byEnvironment.map((e, i) => {
                          const colors = ["bg-violet-500", "bg-sky-500", "bg-amber-500"];
                          return (
                            <GroupPerformanceCard key={e.key} item={e} color={colors[i % colors.length]} showPnl />
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 py-8 text-center">No data</p>
                    )}
                  </StatGroup>

                  <StatGroup>
                    <SectionTitle title="By POI Type" />
                    {stats.byPoiType.length > 0 ? (
                      <div className="space-y-3">
                        {stats.byPoiType.map((p, i) => (
                          <GroupPerformanceCard
                            key={p.key}
                            item={p}
                            color={i === 0 ? "bg-emerald-500" : "bg-sky-500"}
                            showPnl
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 py-8 text-center">No data</p>
                    )}
                  </StatGroup>

                  <StatGroup>
                    <SectionTitle title="By Day of Week" />
                    {stats.byDayOfWeek.length > 0 ? (
                      <div className="space-y-3">
                        {[...stats.byDayOfWeek]
                          .sort((a, b) => {
                            const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                            return order.indexOf(a.label) - order.indexOf(b.label);
                          })
                          .map((d, i) => (
                            <GroupPerformanceCard
                              key={d.key}
                              item={d}
                              color={["bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-orange-500", "bg-zinc-400"][i]}
                              showPnl
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-400 py-8 text-center">No data</p>
                    )}
                  </StatGroup>
                </div>

                <StatGroup>
                  <div className="flex items-center justify-between mb-1">
                    <SectionTitle title="Performance by Instrument" />
                  </div>
                  {stats.byInstrument.length > 0 ? (
                    <div className="mt-2 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50 dark:bg-zinc-800/60 border-0">
                            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                              Instrument
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                              Trades
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                              Win Rate
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                              Avg P&L
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                              Total P&L
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 w-24">
                              Quality
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...stats.byInstrument]
                            .sort((a, b) => b.pnl - a.pnl)
                            .map((item) => (
                              <TableRow
                                key={item.key}
                                className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                              >
                                <TableCell className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 py-3">
                                  {item.label}
                                </TableCell>
                                <TableCell className="text-right text-sm text-zinc-500 py-3">{item.count}</TableCell>
                                <TableCell className="text-right py-3">
                                  <span
                                    className={cn(
                                      "text-sm font-semibold",
                                      item.winRate >= 50 ? "text-emerald-600" : "text-red-500",
                                    )}
                                  >
                                    {item.winRate.toFixed(1)}%
                                  </span>
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right text-sm py-3",
                                    item.avgPnl >= 0 ? "text-emerald-600" : "text-red-500",
                                  )}
                                >
                                  {formatPnl(item.avgPnl)}
                                </TableCell>
                                <TableCell
                                  className={cn(
                                    "text-right font-bold text-sm py-3",
                                    item.pnl >= 0 ? "text-emerald-600" : "text-red-500",
                                  )}
                                >
                                  {formatPnl(item.pnl)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-zinc-500 py-3">
                                  {item.avgQuality.toFixed(1)}/10
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400 py-12 text-center">No instrument data</p>
                  )}
                </StatGroup>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
