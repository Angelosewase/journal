"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, TrendingUp, TrendingDown, Target, Award, Scale, Activity } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Track your trading performance and WWA compliance
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Environment</Label>
              <Select value={filters.environment} onValueChange={(v) => setFilters({ ...filters, environment: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  {environments.map((env) => (
                    <SelectItem key={env} value={env}>{env}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Instrument</Label>
              <Select value={filters.instrument} onValueChange={(v) => setFilters({ ...filters, instrument: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  {instruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Session</Label>
              <Select value={filters.session} onValueChange={(v) => setFilters({ ...filters, session: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  {sessions.map((sess) => (
                    <SelectItem key={sess} value={sess}>{sess}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Model</Label>
              <Select value={filters.tradeModel} onValueChange={(v) => setFilters({ ...filters, tradeModel: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">From Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {stats.winningTrades}W / {stats.losingTrades}L / {stats.breakEvenTrades}BE
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {stats.totalPnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              ${stats.totalPnl.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgQuality.toFixed(1)}/10</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.profitFactor.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Trinity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTrinityScore.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Inducement + LTC + Killzone</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Discipline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDisciplineScore.toFixed(1)}/10</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">${stats.avgWin.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.avgLoss.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Continuation</span>
              <span className="text-sm text-muted-foreground">
                {stats.continuationModel.total} trades | {stats.continuationModel.winRate.toFixed(1)}% WR | Q: {stats.continuationModel.avgQuality.toFixed(1)}/10
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="font-medium">Reversal</span>
              <span className="text-sm text-muted-foreground">
                {stats.reversalModel.total} trades | {stats.reversalModel.winRate.toFixed(1)}% WR | Q: {stats.reversalModel.avgQuality.toFixed(1)}/10
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance by Session</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bySession.length > 0 ? (
              <div className="space-y-2">
                {stats.bySession.map((s) => (
                  <div key={s.session} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{s.session}</span>
                    <span className="text-sm text-muted-foreground">
                      {s.count} trades | {s.winRate.toFixed(1)}% WR | Q: {s.avgQuality.toFixed(1)}/10
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Instrument</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instrument</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Total P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byInstrument.length > 0 ? (
                stats.byInstrument.map((i) => (
                  <TableRow key={i.instrument}>
                    <TableCell className="font-medium">{i.instrument}</TableCell>
                    <TableCell className="text-right">{i.count}</TableCell>
                    <TableCell className="text-right">{i.winRate.toFixed(1)}%</TableCell>
                    <TableCell className={`text-right font-medium ${i.pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      ${i.pnl.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
