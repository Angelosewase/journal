"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  X,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mini progress bar component
function MiniBar({ value, max, color = "bg-emerald-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mt-1">
      <div className={`h-full rounded-full ${color} transition-all duration-500`}
           style={{ width: `${pct}%` }} />
    </div>
  );
}

const instruments = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "GBP/JPY",
];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const winLossOptions = ["WIN", "LOSS", "BREAK_EVEN"];

export default function TradesPage() {
  const router = useRouter();
  const trades = useQuery(api.trades.list);
  const removeTrade = useMutation(api.trades.remove);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    environment: "",
    instrument: "",
    session: "",
    tradeModel: "",
    winLossStatus: "",
    startDate: "",
    endDate: "",
  });

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "",
  ).length;

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter((trade) => {
      if (filters.environment && trade.environment !== filters.environment)
        return false;
      if (filters.instrument && trade.instrument !== filters.instrument)
        return false;
      if (filters.session && trade.session !== filters.session) return false;
      if (filters.tradeModel && trade.tradeModel !== filters.tradeModel)
        return false;
      if (
        filters.winLossStatus &&
        trade.winLossStatus !== filters.winLossStatus
      )
        return false;
      if (
        filters.startDate &&
        new Date(trade.createdAt) < new Date(filters.startDate)
      )
        return false;
      if (
        filters.endDate &&
        new Date(trade.createdAt) > new Date(filters.endDate + "T23:59:59")
      )
        return false;
      return true;
    });
  }, [trades, filters]);

  const summary = useMemo(() => {
    if (filteredTrades.length === 0) return null;
    const wins = filteredTrades.filter((t) => t.winLossStatus === "WIN").length;
    const losses = filteredTrades.filter(
      (t) => t.winLossStatus === "LOSS",
    ).length;
    const totalPnl = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgRR =
      filteredTrades
        .filter((t) => t.finalRR)
        .reduce((sum, t) => sum + (t.finalRR || 0), 0) /
      (filteredTrades.filter((t) => t.finalRR).length || 1);
    return { wins, losses, totalPnl, avgRR, total: filteredTrades.length };
  }, [filteredTrades]);

  const selectedTradeData = trades?.find((t) => t._id === selectedTrade);

  const handleDelete = async (id: any) => {
    await removeTrade({ id });
    setShowDeleteDialog(false);
    setSelectedTrade(null);
  };

  const clearFilters = () => {
    setFilters({
      environment: "",
      instrument: "",
      session: "",
      tradeModel: "",
      winLossStatus: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Trade Log</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {filteredTrades.length} trade
              {filteredTrades.length !== 1 ? "s" : ""} found
              {activeFilterCount > 0 &&
                ` (${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active)`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
                showFilters || activeFilterCount > 0
                  ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <Button asChild className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-sm transition-colors">
              <Link href="/trades/new">
                <Plus className="h-3.5 w-3.5" />
                Add Trade
              </Link>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Filter trades</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                  Environment
                </Label>
                <Select
                  value={filters.environment}
                  onValueChange={(v) =>
                    setFilters({ ...filters, environment: v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKTESTING">Backtesting</SelectItem>
                    <SelectItem value="DEMO">Demo</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                  Instrument
                </Label>
                <Select
                  value={filters.instrument}
                  onValueChange={(v) =>
                    setFilters({ ...filters, instrument: v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {instruments.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Session</Label>
                <Select
                  value={filters.session}
                  onValueChange={(v) => setFilters({ ...filters, session: v })}
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((sess) => (
                      <SelectItem key={sess} value={sess}>
                        {sess}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Model</Label>
                <Select
                  value={filters.tradeModel}
                  onValueChange={(v) =>
                    setFilters({ ...filters, tradeModel: v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Result</Label>
                <Select
                  value={filters.winLossStatus}
                  onValueChange={(v) =>
                    setFilters({ ...filters, winLossStatus: v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {winLossOptions.map((wl) => (
                      <SelectItem key={wl} value={wl}>
                        {wl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                  From Date
                </Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">To Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="h-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                />
              </div>
            </div>
          </div>
        )}

        {summary && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
              <div className="pr-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    TOTAL TRADES
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.total}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    {summary.wins}W / {summary.losses}L
                  </p>
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    TOTAL P&L
                  </p>
                  <p className={`text-4xl font-bold leading-none ${summary.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    ${summary.totalPnl.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    Net profit / loss
                  </p>
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    WIN RATE
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {Math.round((summary.wins / summary.total) * 100)}%
                  </p>
                  <MiniBar value={Math.round((summary.wins / summary.total) * 100)} max={100} color={summary.wins / summary.total >= 0.5 ? "bg-emerald-500" : "bg-amber-500"} />
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    {">"}50% is profitable
                  </p>
                </div>
              </div>
              <div className="pl-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    AVG RR
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.avgRR.toFixed(1)}{":"}1
                  </p>
                  <MiniBar value={summary.avgRR} max={3} color={summary.avgRR >= 1.5 ? "bg-emerald-500" : summary.avgRR >= 1 ? "bg-amber-500" : "bg-red-400"} />
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    Risk/Reward ratio
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 dark:bg-zinc-800/60 border-0">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 w-[90px]">
                  Date
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                  Instrument
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 hidden md:table-cell">
                  Session
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 hidden lg:table-cell">
                  Model
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3">
                  Dir
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-right">
                  P&L
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-right hidden sm:table-cell">
                  RR
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-3 text-center hidden md:table-cell">
                  Quality
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow
                  key={trade._id}
                  onClick={() => router.push(`/trades/${trade._id}`)}
                  className="border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                >
                  <TableCell className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 py-3">
                    {new Date(trade.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 py-3">
                    <div>
                      <p className="font-medium text-sm">{trade.instrument}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-300 text-sm py-3 hidden md:table-cell">
                    {trade.session}
                  </TableCell>
                  <TableCell className="text-zinc-600 dark:text-zinc-300 text-sm py-3 hidden lg:table-cell">
                    {trade.tradeModel}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      trade.direction === "LONG"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {trade.direction === "LONG" ? "LONG" : "SHORT"}
                    </span>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold py-3 ${(trade.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-zinc-600 dark:text-zinc-300 text-sm py-3 hidden sm:table-cell">
                    {trade.finalRR ? `${trade.finalRR.toFixed(1)}{":"}1` : "-"}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      trade.winLossStatus === "WIN"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : trade.winLossStatus === "LOSS"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {trade.winLossStatus || "OPEN"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-zinc-600 dark:text-zinc-300 text-sm py-3 hidden md:table-cell">
                    {trade.tradeQualityScore ? `${trade.tradeQualityScore}` : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500">
                        {activeFilterCount > 0
                          ? "No trades match your filters."
                          : "No trades found. Start by adding your first trade."}
                      </p>
                      {activeFilterCount > 0 ? (
                        <button onClick={clearFilters} className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                          Clear Filters
                        </button>
                      ) : (
                        <Button asChild className="px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold transition-colors">
                          <Link href="/trades/new">Add Trade</Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      <Dialog
        open={!!selectedTrade}
        onOpenChange={() => setSelectedTrade(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTradeData?.instrument} {selectedTradeData?.direction}
            </DialogTitle>
            <DialogDescription>
              {selectedTradeData &&
                new Date(selectedTradeData.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
            </DialogDescription>
          </DialogHeader>
          {selectedTradeData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Entry/Exit</p>
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
                    {selectedTradeData.entryPrice}/
                    {selectedTradeData.exitPrice || "Open"}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">P&L</p>
                  <p
                    className={`font-semibold text-sm ${(selectedTradeData.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {selectedTradeData.pnl !== undefined
                      ? `$${selectedTradeData.pnl.toFixed(2)}`
                      : "Open"}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Status</p>
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">
                    {selectedTradeData.winLossStatus || "Open"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    router.push(`/trades/${selectedTradeData._id}`)
                  }
                  className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-50">Delete Trade</DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-300">
              Are you sure you want to delete this{" "}
              {selectedTradeData?.instrument} {selectedTradeData?.direction}{" "}
              trade? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                selectedTradeData && handleDelete(selectedTradeData._id)
              }
              className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
            >
              Delete Trade
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
