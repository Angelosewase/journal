"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, SlidersHorizontal } from "lucide-react";
import { ContentCard } from "@/components/ui/content-card";
import { PageShell, StatInline } from "@/components/ui/page-shell";
import { TradeCard } from "@/components/TradeCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TradesPage() {
  const trades = useQuery(api.trades.list);
  const [environment, setEnvironment] = useState("all");
  const [session, setSession] = useState("all");

  const filtered = useMemo(() => {
    if (!trades) return [];
    return trades.filter((t) => {
      if (environment !== "all" && t.environment !== environment) return false;
      if (session !== "all" && t.session !== session) return false;
      return true;
    });
  }, [trades, environment, session]);

  const summary = useMemo(() => {
    const wins = filtered.filter((t) => t.winLossStatus === "WIN").length;
    const pnl = filtered.reduce((s, t) => s + (t.pnl || 0), 0);
    const winRate = filtered.length ? Math.round((wins / filtered.length) * 100) : 0;
    return { total: filtered.length, pnl, winRate };
  }, [filtered]);

  return (
    <PageShell
      title="Trade Log"
      subtitle="Visual journal — each trade with chart thumbnail and narrative"
      maxWidth="xl"
      actions={
        <Link href="/trades/new">
          <Button size="sm" className="rounded-md"><Plus className="h-4 w-4" /> Quick Log</Button>
        </Link>
      }
    >
      <ContentCard padding="sm">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 text-sm">
          <div className="flex flex-wrap gap-8">
            <StatInline label="Trades" value={summary.total} />
            <StatInline label="P&L" value={`${summary.pnl >= 0 ? "+" : ""}$${summary.pnl.toFixed(2)}`} valueClassName={summary.pnl >= 0 ? "text-emerald-600" : "text-red-500"} />
            <StatInline label="Win rate" value={`${summary.winRate}%`} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Env" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All env</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="DEMO">Demo</SelectItem>
                <SelectItem value="BACKTESTING">Backtest</SelectItem>
              </SelectContent>
            </Select>
            <Select value={session} onValueChange={setSession}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue placeholder="Session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sessions</SelectItem>
                <SelectItem value="ASIA">Asia</SelectItem>
                <SelectItem value="LONDON">London</SelectItem>
                <SelectItem value="NEW_YORK">NY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ContentCard>

      <div className="space-y-4">
        {!trades ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trades match filters.</p>
        ) : (
          filtered.map((trade) => <TradeCard key={trade._id} trade={trade} />)
        )}
      </div>
    </PageShell>
  );
}
