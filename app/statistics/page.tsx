"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Target, Award, Scale, Activity, BarChart3, PieChart as PieChartIcon } from "lucide-react";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const environments = ["BACKTESTING", "DEMO", "LIVE"];

// Circular progress component
function CircularProgress({ percentage=0, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="text-center">
        <div className="text-2xl font-bold">{percentage.toFixed(1)}%</div>
      </div>
    </div>
  );
}

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
      if (filters.endDate && new Date(trade.createdAt) > new Date(filters.endDate + "T23:59:59")) return false;
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
    <div className="space-y-8 pb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your trading performance and WWA compliance
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Environment</Label>
              <Select value={filters.environment} onValueChange={(v) => setFilters({ ...filters, environment: v })}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>All</SelectItem>
                  {environments.map((env) => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Instrument</Label>
              <Select value={filters.instrument} onValueChange={(v) => setFilters({ ...filters, instrument: v })}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>All</SelectItem>
                  {instruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Session</Label>
              <Select value={filters.session} onValueChange={(v) => setFilters({ ...filters, session: v })}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nonse" disabled>All</SelectItem>
                  {sessions.map((sess) => (
                    <SelectItem key={sess} value={sess}>{sess}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Model</Label>
              <Select value={filters.tradeModel} onValueChange={(v) => setFilters({ ...filters, tradeModel: v })}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>All</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">From Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="h-9 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">To Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="h-9 rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-0 shadow-sm lg:col-span-2 md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Total Trades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-5xl font-bold">{stats.totalTrades}</div>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-semibold text-emerald-600">{stats.winningTrades}W</span>
                {" / "}
                <span className="font-semibold text-red-600">{stats.losingTrades}L</span>
                {" / "}
                <span className="font-semibold">{stats.breakEvenTrades}BE</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CircularProgress percentage={Math.min(stats.winRate, 100)} size={120} />
          </CardContent>
        </Card>
      </div>

      {/* P&L and Quality Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Total P&L
              {stats.totalPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ${stats.totalPnl.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Avg Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgQuality.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">/10</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Avg Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">${stats.avgWin.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Avg Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">-${stats.avgLoss.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Profit Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.profitFactor.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Trinity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgTrinityScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">/10</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold">Discipline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgDisciplineScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">/10</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Model and Session */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Performance by Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Continuation", data: stats.continuationModel },
              { label: "Reversal", data: stats.reversalModel },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.data.total} trades</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-lg font-bold">{item.data.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quality</p>
                    <p className="text-lg font-bold">{item.data.avgQuality.toFixed(1)}/10</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Performance by Session</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bySession.length > 0 ? (
              <div className="space-y-3">
                {stats.bySession.map((s) => (
                  <div key={s.session} className="p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{s.session}</span>
                      <span className="text-xs text-muted-foreground">{s.count} trades</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                        <p className="text-lg font-bold">{s.winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Quality</p>
                        <p className="text-lg font-bold">{s.avgQuality.toFixed(1)}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instrument Performance Table */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Performance by Instrument</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byInstrument.length > 0 ? (
            <div className="rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-muted/50 bg-muted/50">
                    <TableHead className="font-semibold">Instrument</TableHead>
                    <TableHead className="text-right font-semibold">Trades</TableHead>
                    <TableHead className="text-right font-semibold">Win Rate</TableHead>
                    <TableHead className="text-right font-semibold">Total P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.byInstrument.map((i) => (
                    <TableRow key={i.instrument} className="border-muted/30 hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{i.instrument}</TableCell>
                      <TableCell className="text-right text-sm">{i.count}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{i.winRate.toFixed(1)}%</TableCell>
                      <TableCell className={`text-right font-semibold ${i.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        ${i.pnl.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}