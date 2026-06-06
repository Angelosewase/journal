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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell, SectionHeading, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import {
  computeTradeStatistics,
  filterTrades,
  getPeriodStart,
  type TradeFilters,
} from "@/lib/trade-statistics";
import { computeWeeklyPnlSeries } from "@/lib/review-stats";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "all", label: "All" },
] as const;

type Period = (typeof PERIODS)[number]["id"];

export default function StatisticsPage() {
  const trades = useQuery(api.trades.list);
  const weeklyReviews = useQuery(api.weeklyReviews.list);
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

  const weeklySeries = useMemo(() => {
    const reviewed = new Set((weeklyReviews ?? []).map((r) => r.weekStart));
    const periodStart = getPeriodStart(period);
    const scoped = periodStart
      ? trades?.filter((t) => new Date(t.createdAt).toISOString().split("T")[0] >= periodStart)
      : trades;
    return computeWeeklyPnlSeries(scoped, reviewed).slice(-12);
  }, [trades, weeklyReviews, period]);

  const topInstruments = stats.byInstrument.slice(0, 5);
  const insights = stats.insights.slice(0, 2);

  return (
    <PageShell title="Statistics" subtitle="Lean analytics — numbers link back to your trades" maxWidth="xl">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={cn(
              "rounded-md border px-3 py-1 text-xs",
              period === p.id ? "border-foreground bg-foreground text-background" : "border-border/60 text-muted-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
        <Select value={environment} onValueChange={setEnvironment}>
          <SelectTrigger className="ml-auto h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All env</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="DEMO">Demo</SelectItem>
            <SelectItem value="BACKTESTING">Backtest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ContentCard>
        <div className="flex flex-wrap gap-6">
          <StatInline label="Trades" value={stats.total} />
          <StatInline label="Win rate" value={`${stats.winRate.toFixed(1)}%`} />
          <StatInline label="Net P&L" value={`$${stats.totalPnl.toFixed(2)}`} valueClassName={stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"} />
          <StatInline label="Profit factor" value={stats.profitFactor.toFixed(2)} />
          <StatInline label="Expectancy" value={`$${stats.expectancy.toFixed(2)}`} />
          <StatInline label="Win streak" value={stats.currentWinStreak} />
          <StatInline label="Loss streak" value={stats.currentLossStreak} />
        </div>
      </ContentCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard>
          <SectionHeading>Equity curve</SectionHeading>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e7" />
                <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="cumulative" stroke="#37352f" fill="#f7f6f3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>
        <ContentCard>
          <SectionHeading>Daily P&L (14d)</SectionHeading>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyPnl.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="pnl" fill="#37352f" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ContentCard>
      </div>

      <ContentCard>
        <SectionHeading>Weekly P&L</SectionHeading>
        <div className="mt-3 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e7" />
              <XAxis dataKey="weekStart" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="pnl" fill="#787774" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ContentCard>

      <ContentCard>
        <SectionHeading>WWA compliance</SectionHeading>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {stats.compliance.map((c) => (
            <div key={c.label} className="rounded-md border border-border/60 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">{c.label}</p>
              <p className="text-lg font-semibold">{c.rate.toFixed(0)}%</p>
              <p className="text-[10px] text-muted-foreground">{c.followed}/{c.total} trades</p>
            </div>
          ))}
        </div>
      </ContentCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ContentCard>
          <SectionHeading>By session</SectionHeading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win%</TableHead>
                <TableHead>P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.bySession.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.label}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>{row.winRate.toFixed(0)}%</TableCell>
                  <TableCell className={row.pnl >= 0 ? "text-emerald-600" : "text-red-500"}>${row.pnl.toFixed(0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
        <ContentCard>
          <SectionHeading>By instrument (top 5)</SectionHeading>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Win%</TableHead>
                <TableHead>P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topInstruments.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>
                    <Link href={`/trades?instrument=${encodeURIComponent(row.key)}`} className="underline">
                      {row.label}
                    </Link>
                  </TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>{row.winRate.toFixed(0)}%</TableCell>
                  <TableCell className={row.pnl >= 0 ? "text-emerald-600" : "text-red-500"}>${row.pnl.toFixed(0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ContentCard>
      </div>

      {insights.length > 0 && (
        <ContentCard>
          <SectionHeading>Insights</SectionHeading>
          <ul className="mt-2 space-y-2 text-sm">
            {insights.map((insight) => (
              <li key={insight.title}>
                <span className="font-medium">{insight.title}</span>
                <span className="text-muted-foreground"> — {insight.description}</span>
              </li>
            ))}
          </ul>
        </ContentCard>
      )}
    </PageShell>
  );
}
