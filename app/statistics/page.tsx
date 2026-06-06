"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import Link from "next/link";
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
import {
  PageShell,
  SectionHeading,
  StatInline,
  CategoryLabel,
  MiniBar,
} from "@/components/ui/page-shell";
import { ContentCard, InsetRow, PanelDivider } from "@/components/ui/content-card";
import {
  computeTradeStatistics,
  filterTrades,
  getPeriodStart,
  type GroupStats,
  type TradeFilters,
} from "@/lib/trade-statistics";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "all", label: "All" },
] as const;

type Period = (typeof PERIODS)[number]["id"];

const CHART_TOOLTIP = {
  contentStyle: {
    background: "var(--tw-bg-opacity, 1)",
    borderRadius: "0.75rem",
    border: "1px solid #e4e4e7",
    fontSize: "12px",
  },
};

function BreakdownTable({
  title,
  rows,
  linkPrefix,
}: Readonly<{
  title: string;
  rows: GroupStats[];
  linkPrefix?: string;
}>) {
  const maxPnl = Math.max(...rows.map((r) => Math.abs(r.pnl)), 1);
  return (
    <ContentCard>
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-zinc-50 dark:bg-zinc-800/60">
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Group
              </TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Trades
              </TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Win%
              </TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                P&L
              </TableHead>
              <TableHead className="py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 w-24">
                Magnitude
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-400">
                  No data for this period
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.key}
                  className="border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                >
                  <TableCell className="py-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {linkPrefix ? (
                      <Link
                        href={`${linkPrefix}${encodeURIComponent(row.key)}`}
                        className="hover:text-emerald-600 transition-colors"
                      >
                        {row.label}
                      </Link>
                    ) : (
                      row.label
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                    {row.count}
                  </TableCell>
                  <TableCell className="py-3 text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
                    {row.winRate.toFixed(0)}%
                  </TableCell>
                  <TableCell
                    className={cn(
                      "py-3 text-sm font-bold tabular-nums",
                      row.pnl >= 0 ? "text-emerald-600" : "text-red-500",
                    )}
                  >
                    {row.pnl >= 0 ? "+" : ""}${row.pnl.toFixed(0)}
                  </TableCell>
                  <TableCell className="py-3">
                    <MiniBar
                      value={Math.abs(row.pnl)}
                      max={maxPnl}
                      color={row.pnl >= 0 ? "bg-emerald-500" : "bg-red-400"}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ContentCard>
  );
}

export default function StatisticsPage() {
  const trades = useQuery(api.trades.list);
  const [period, setPeriod] = useState<Period>("30d");
  const [environment, setEnvironment] = useState("all");

  const filters: TradeFilters = useMemo(
    () => ({
      environment: environment === "all" ? "" : environment,
      instrument: "",
      session: "",
      tradeModel: "",
      startDate: getPeriodStart(period),
      endDate: "",
    }),
    [period, environment],
  );

  const filteredTrades = useMemo(
    () => filterTrades(trades ?? [], filters),
    [trades, filters],
  );

  const stats = useMemo(
    () => computeTradeStatistics(filteredTrades),
    [filteredTrades],
  );

  const outcomeTotal = stats.wins + stats.losses + stats.be || 1;

  return (
    <PageShell title="Statistics" subtitle="Comprehensive performance insights from your trade journal">
      <div className="flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
              period === p.id
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400",
            )}
          >
            {p.label}
          </button>
        ))}
        <Select value={environment} onValueChange={setEnvironment}>
          <SelectTrigger className="ml-auto h-8 w-36 rounded-lg border-zinc-200 bg-zinc-50 text-xs dark:border-zinc-700 dark:bg-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All environments</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="DEMO">Demo</SelectItem>
            <SelectItem value="BACKTESTING">Backtest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview strip */}
      <ContentCard padding="none">
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 divide-x divide-zinc-100 sm:grid-cols-4 dark:divide-zinc-800">
            <div className="pr-6">
              <StatInline label="Total P&L" value={`$${stats.totalPnl.toFixed(2)}`} hint="Net across period"
                valueClassName={stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
            </div>
            <div className="px-6">
              <StatInline label="Win rate" value={`${stats.winRate.toFixed(1)}%`} hint={`${stats.wins}W · ${stats.losses}L · ${stats.be}BE`} />
              <MiniBar value={stats.winRate} max={100} />
            </div>
            <div className="px-6">
              <StatInline label="Profit factor" value={stats.profitFactor >= 999 ? "∞" : stats.profitFactor.toFixed(2)} hint="Avg win ÷ avg loss · >1 profitable" />
              <MiniBar value={Math.min(stats.profitFactor, 3)} max={3} color={stats.profitFactor >= 1 ? "bg-emerald-500" : "bg-red-400"} />
            </div>
            <div className="pl-6">
              <StatInline label="Expectancy" value={`$${stats.expectancy.toFixed(2)}`} hint="Per trade expected value" />
            </div>
          </div>
          <div className="mt-4 flex gap-0.5 h-1.5 overflow-hidden rounded-full">
            <div className="bg-emerald-500 h-full" style={{ width: `${(stats.wins / outcomeTotal) * 100}%` }} />
            <div className="bg-red-400 h-full" style={{ width: `${(stats.losses / outcomeTotal) * 100}%` }} />
            <div className="h-full bg-zinc-300 dark:bg-zinc-700" style={{ width: `${(stats.be / outcomeTotal) * 100}%` }} />
          </div>
        </div>
      </ContentCard>

      {/* Core metrics */}
      <ContentCard>
        <SectionHeading>Performance metrics</SectionHeading>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatInline label="Trades" value={stats.total} />
          <StatInline label="Avg win" value={`$${stats.avgWin.toFixed(2)}`} valueClassName="text-emerald-600" />
          <StatInline label="Avg loss" value={`$${stats.avgLoss.toFixed(2)}`} valueClassName="text-red-500" />
          <StatInline label="Avg R:R" value={stats.avgFinalRR.toFixed(2)} hint="Final risk-reward" />
          <StatInline label="T1 hit rate" value={`${stats.target1HitRate.toFixed(0)}%`} />
          <StatInline label="BE stop rate" value={`${stats.beStopRate.toFixed(0)}%`} />
          <StatInline label="Avg duration" value={stats.avgTimeInTrade > 0 ? `${stats.avgTimeInTrade.toFixed(0)}m` : "—"} hint="Time in trade" />
          <StatInline label="Avg risk %" value={`${stats.avgRiskPct.toFixed(1)}%`} />
          <StatInline label="Biggest win" value={`$${stats.biggestWin.toFixed(2)}`} valueClassName="text-emerald-600" />
          <StatInline label="Biggest loss" value={`$${stats.biggestLoss.toFixed(2)}`} valueClassName="text-red-500" />
          <StatInline label="Avg quality" value={stats.avgQuality.toFixed(1)} hint="/10 scale" />
          <StatInline label="Discipline" value={stats.avgDiscipline.toFixed(1)} hint="/10 scale" />
        </div>
      </ContentCard>

      {/* Streaks */}
      <ContentCard>
        <SectionHeading>Streaks</SectionHeading>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatInline label="Current win" value={stats.currentWinStreak} />
          <StatInline label="Current loss" value={stats.currentLossStreak} valueClassName={stats.currentLossStreak >= 3 ? "text-red-500" : undefined} />
          <StatInline label="Max win streak" value={stats.maxWinStreak} />
          <StatInline label="Max loss streak" value={stats.maxLossStreak} />
        </div>
      </ContentCard>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard>
          <SectionHeading>Equity curve</SectionHeading>
          <div className="mt-4 h-52">
            {stats.equityCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    tick={{ fontSize: 10, fill: "#a1a1aa" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="#d1fae5" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">No trades in period</div>
            )}
          </div>
        </ContentCard>
        <ContentCard>
          <SectionHeading>Daily P&L</SectionHeading>
          <div className="mt-4 h-52">
            {stats.dailyPnl.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyPnl.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {stats.dailyPnl.slice(-30).map((entry) => (
                      <Cell key={entry.date} fill={entry.pnl >= 0 ? "#10b981" : "#f87171"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-400">No daily data</div>
            )}
          </div>
        </ContentCard>
      </div>

      <ContentCard>
        <SectionHeading>Weekly P&L</SectionHeading>
        <div className="mt-4 h-44">
          {stats.weeklyPnl.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyPnl.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {stats.weeklyPnl.slice(-12).map((entry) => (
                    <Cell key={entry.week} fill={entry.pnl >= 0 ? "#10b981" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">No weekly data</div>
          )}
        </div>
      </ContentCard>

      {/* WWA Compliance */}
      <ContentCard>
        <SectionHeading>WWA compliance</SectionHeading>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.compliance.map((c) => (
            <InsetRow key={c.label}>
              <CategoryLabel>{c.label}</CategoryLabel>
              <p className="mt-1 text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                {c.rate.toFixed(0)}%
              </p>
              <p className="mt-1 text-[10px] text-zinc-300 dark:text-zinc-600">
                {c.followed}/{c.total} followed
              </p>
              <MiniBar value={c.rate} max={100} color="bg-sky-500" />
              {c.total >= 2 && (
                <p className="mt-2 text-[10px] text-zinc-400">
                  WR when yes: {c.winRateWhenFollowed.toFixed(0)}% · no: {c.winRateWhenNot.toFixed(0)}%
                </p>
              )}
            </InsetRow>
          ))}
        </div>
      </ContentCard>

      {/* Model comparison */}
      <ContentCard>
        <SectionHeading>Trade model</SectionHeading>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Continuation", data: stats.cont },
            { label: "Reversal", data: stats.rev },
          ].map(({ label, data }) => (
            <InsetRow key={label}>
              <CategoryLabel>{label}</CategoryLabel>
              <div className="mt-2 flex flex-wrap gap-6">
                <StatInline label="Trades" value={data.total} />
                <StatInline label="Win rate" value={`${data.winRate.toFixed(0)}%`} />
                <StatInline label="Quality" value={data.quality.toFixed(1)} />
                <StatInline
                  label="P&L"
                  value={`$${data.pnl.toFixed(0)}`}
                  valueClassName={data.pnl >= 0 ? "text-emerald-600" : "text-red-500"}
                />
              </div>
            </InsetRow>
          ))}
        </div>
      </ContentCard>

      {/* Quality buckets */}
      <ContentCard>
        <SectionHeading>Quality vs outcome</SectionHeading>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {stats.qualityBuckets.map((b) => (
            <InsetRow key={b.label}>
              <CategoryLabel>Quality {b.label}</CategoryLabel>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{b.count}</p>
              <p className="text-[10px] text-zinc-400">{b.winRate.toFixed(0)}% win · ${b.pnl.toFixed(0)} P&L</p>
              <MiniBar value={b.winRate} max={100} color={b.winRate >= 50 ? "bg-emerald-500" : "bg-amber-500"} />
            </InsetRow>
          ))}
        </div>
      </ContentCard>

      {/* Breakdown tables */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownTable title="By session" rows={stats.bySession} linkPrefix="/trades?session=" />
        <BreakdownTable title="By instrument" rows={stats.byInstrument.slice(0, 8)} linkPrefix="/trades?instrument=" />
        <BreakdownTable title="By direction" rows={stats.byDirection} />
        <BreakdownTable title="By environment" rows={stats.byEnvironment} />
        <BreakdownTable title="By POI type" rows={stats.byPoiType} />
        <BreakdownTable title="By day of week" rows={stats.byDayOfWeek.sort((a, b) => {
          const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          return order.indexOf(a.label) - order.indexOf(b.label);
        })} />
      </div>

      {/* Insights */}
      {stats.insights.length > 0 && (
        <ContentCard>
          <SectionHeading>Auto-generated insights</SectionHeading>
          <div className="mt-4 space-y-3">
            {stats.insights.map((insight) => (
              <InsetRow key={insight.title}>
                <div className="flex items-start gap-2">
                  <div
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      insight.type === "positive" && "bg-emerald-500",
                      insight.type === "negative" && "bg-red-400",
                      insight.type === "neutral" && "bg-sky-500",
                    )}
                  />
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{insight.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-300">{insight.description}</p>
                  </div>
                </div>
              </InsetRow>
            ))}
          </div>
          <PanelDivider />
          <p className="mt-4 text-xs text-zinc-400">
            <Link href="/trades" className="font-medium hover:text-zinc-700 dark:hover:text-zinc-200">
              View all trades →
            </Link>
            {" · "}
            Filter by session or instrument using the links in breakdown tables.
          </p>
        </ContentCard>
      )}
    </PageShell>
  );
}
