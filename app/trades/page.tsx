"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Filter,
  X,
  ArrowUpDown,
  BarChart3,
  DollarSign,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trade Log</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTrades.length} trade
            {filteredTrades.length !== 1 ? "s" : ""} found
            {activeFilterCount > 0 &&
              ` (${activeFilterCount} filter${activeFilterCount !== 1 ? "s" : ""} active)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button asChild>
            <Link href="/trades/new" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Trade
            </Link>
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Filters</CardTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 gap-1 text-xs"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Environment
                </Label>
                <Select
                  value={filters.environment}
                  onValueChange={(v) =>
                    setFilters({ ...filters, environment: v })
                  }
                >
                  <SelectTrigger className="h-8">
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
                <Label className="text-xs text-muted-foreground">
                  Instrument
                </Label>
                <Select
                  value={filters.instrument}
                  onValueChange={(v) =>
                    setFilters({ ...filters, instrument: v })
                  }
                >
                  <SelectTrigger className="h-8">
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
                <Label className="text-xs text-muted-foreground">Session</Label>
                <Select
                  value={filters.session}
                  onValueChange={(v) => setFilters({ ...filters, session: v })}
                >
                  <SelectTrigger className="h-8">
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
                <Label className="text-xs text-muted-foreground">Model</Label>
                <Select
                  value={filters.tradeModel}
                  onValueChange={(v) =>
                    setFilters({ ...filters, tradeModel: v })
                  }
                >
                  <SelectTrigger className="h-8">
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
                <Label className="text-xs text-muted-foreground">Result</Label>
                <Select
                  value={filters.winLossStatus}
                  onValueChange={(v) =>
                    setFilters({ ...filters, winLossStatus: v })
                  }
                >
                  <SelectTrigger className="h-8">
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
                <Label className="text-xs text-muted-foreground">
                  From Date
                </Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="h-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.wins}W / {summary.losses}L
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Total Trades</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${summary.totalPnl >= 0 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                >
                  <DollarSign
                    className={`h-5 w-5 ${summary.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  />
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${summary.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    ${summary.totalPnl.toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Total P&L</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${summary.wins / summary.total >= 0.5 ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}
                >
                  <Target
                    className={`h-5 w-5 ${summary.wins / summary.total >= 0.5 ? "text-emerald-600" : "text-amber-600"}`}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((summary.wins / summary.total) * 100)}%
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Win Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <ArrowUpDown className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {summary.avgRR.toFixed(1)}:1
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">Avg RR</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">Date</TableHead>
            <TableHead>Instrument</TableHead>
            <TableHead className="hidden md:table-cell">Session</TableHead>
            <TableHead className="hidden lg:table-cell">Model</TableHead>
            <TableHead>Dir</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead className="hidden sm:table-cell text-right">
              RR
            </TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="hidden md:table-cell text-center">
              Quality
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTrades.map((trade) => (
            <TableRow
              key={trade._id}
              onClick={() => router.push(`/trades/${trade._id}`)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium text-sm">
                {new Date(trade.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{trade.instrument}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {trade.session}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                {trade.tradeModel}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    trade.direction === "LONG"
                      ? "border-emerald-500 text-emerald-600 text-xs"
                      : "border-red-500 text-red-600 text-xs"
                  }
                >
                  {trade.direction === "LONG" ? "L" : "S"}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${(trade.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "-"}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-right text-muted-foreground text-sm">
                {trade.finalRR ? `${trade.finalRR.toFixed(1)}:1` : "-"}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    trade.winLossStatus === "WIN"
                      ? "border-emerald-500 text-emerald-600"
                      : trade.winLossStatus === "LOSS"
                        ? "border-red-500 text-red-600"
                        : ""
                  }`}
                >
                  {trade.winLossStatus || "Open"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-center text-muted-foreground text-sm">
                {trade.tradeQualityScore ? `${trade.tradeQualityScore}` : "-"}
              </TableCell>
            </TableRow>
          ))}
          {filteredTrades.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  {activeFilterCount > 0
                    ? "No trades match your filters."
                    : "No trades found. Start by adding your first trade."}
                </p>
                {activeFilterCount > 0 ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href="/trades/new">Add Trade</Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Entry/Exit</p>
                  <p className="font-semibold text-sm">
                    {selectedTradeData.entryPrice}/
                    {selectedTradeData.exitPrice || "Open"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">P&L</p>
                  <p
                    className={`font-semibold text-sm ${(selectedTradeData.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {selectedTradeData.pnl !== undefined
                      ? `$${selectedTradeData.pnl.toFixed(2)}`
                      : "Open"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm">
                    {selectedTradeData.winLossStatus || "Open"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    router.push(`/trades/${selectedTradeData._id}`)
                  }
                >
                  View Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this{" "}
              {selectedTradeData?.instrument} {selectedTradeData?.direction}{" "}
              trade? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedTradeData && handleDelete(selectedTradeData._id)
              }
            >
              Delete Trade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
