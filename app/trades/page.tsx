"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const environments = ["BACKTESTING", "DEMO", "LIVE"];
const winLossOptions = ["WIN", "LOSS", "BREAK_EVEN"];

export default function TradesPage() {
  const router = useRouter();
  const trades = useQuery(api.trades.list);
  const removeTrade = useMutation(api.trades.remove);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    environment: "",
    instrument: "",
    session: "",
    tradeModel: "",
    winLossStatus: "",
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
      if (filters.winLossStatus && trade.winLossStatus !== filters.winLossStatus) return false;
      if (filters.startDate && new Date(trade.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(trade.createdAt) > new Date(filters.endDate + "T23:59:59")) return false;
      return true;
    });
  }, [trades, filters]);

  const selectedTradeData = trades?.find((t) => t._id === selectedTrade);

  const handleDelete = async (id: any) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      await removeTrade({ id });
      setSelectedTrade(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trade Log</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTrades.length} trade{filteredTrades.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button asChild>
          <Link href="/trades/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Trade
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Environment</Label>
              <Select value={filters.environment} onValueChange={(v) => setFilters({ ...filters, environment: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKTESTING">Backtesting</SelectItem>
                  <SelectItem value="DEMO">Demo</SelectItem>
                  <SelectItem value="LIVE">Live</SelectItem>
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
              <Label className="text-xs text-muted-foreground">Result</Label>
              <Select value={filters.winLossStatus} onValueChange={(v) => setFilters({ ...filters, winLossStatus: v })}>
                <SelectTrigger className="h-8"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  {winLossOptions.map((wl) => (
                    <SelectItem key={wl} value={wl}>{wl}</SelectItem>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Instrument</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">RR</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow
                  key={trade._id}
                  onClick={() => setSelectedTrade(trade._id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{trade.instrument}</TableCell>
                  <TableCell className="text-muted-foreground">{trade.session}</TableCell>
                  <TableCell className="text-muted-foreground">{trade.tradeModel}</TableCell>
                  <TableCell>
                    <Badge variant={trade.direction === "LONG" ? "default" : "destructive"} className={trade.direction === "LONG" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                      {trade.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${(trade.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {trade.finalRR ? `${trade.finalRR.toFixed(1)}:1` : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={trade.winLossStatus === "WIN" ? "border-emerald-500 text-emerald-600" : trade.winLossStatus === "LOSS" ? "border-red-500 text-red-600" : ""}>
                      {trade.winLossStatus || "Open"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {trade.tradeQualityScore ? `${trade.tradeQualityScore}/10` : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTrades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No trades found. Start by adding your first trade.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTradeData?.instrument} {selectedTradeData?.direction}
            </DialogTitle>
            <DialogDescription>
              {selectedTradeData && new Date(selectedTradeData.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedTradeData && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase">Entry / Exit</p>
                  <p className="text-lg font-semibold">{selectedTradeData.entryPrice} / {selectedTradeData.exitPrice || "Open"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase">P&L</p>
                  <p className={`text-lg font-semibold ${(selectedTradeData.pnl || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {selectedTradeData.pnl !== undefined ? `$${selectedTradeData.pnl.toFixed(2)}` : "Open"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  <p className="text-lg font-semibold">{selectedTradeData.winLossStatus || "Open"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Session</p>
                  <p className="font-medium">{selectedTradeData.session}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Environment</p>
                  <p className="font-medium">{selectedTradeData.environment}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trade Model</p>
                  <p className="font-medium">{selectedTradeData.tradeModel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Quality</p>
                  <p className="font-medium">{selectedTradeData.tradeQualityScore ? `${selectedTradeData.tradeQualityScore}/10` : "-"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedTradeData._id)}>
                  Delete Trade
                </Button>
                <Button onClick={() => router.push(`/trades/${selectedTradeData._id}`)}>
                  View Full Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
