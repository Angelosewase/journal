"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PageShell, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { CaptureDropzone } from "@/components/CaptureDropzone";
import { PriceInput } from "@/components/PriceInput";
import type { TradeCapture } from "@/lib/review-stats";
import { COMMON_INSTRUMENTS } from "@/lib/instrument-utils";
import { calculatePnlPreview, calculateRiskReward, calculateStopLossPips } from "@/lib/trade-calculations";

export default function NewTradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fullLog = searchParams.get("mode") === "full";

  const createTrade = useMutation(api.trades.create);
  const accounts = useQuery(api.accounts.list);
  const todayBias = useQuery(api.dailyBias.getByDate, {
    date: new Date().toISOString().split("T")[0],
  });

  const [captures, setCaptures] = useState<TradeCapture[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    instrument: todayBias?.bestInstrument ?? "EUR/USD",
    direction: "LONG" as "LONG" | "SHORT",
    session: "LONDON" as "ASIA" | "LONDON" | "NEW_YORK" | "OTHER",
    environment: "LIVE" as "BACKTESTING" | "DEMO" | "LIVE",
    entryPrice: "",
    exitPrice: "",
    stopLossPrice: "",
    positionSize: "1",
    commission: "0",
    riskAmount: "100",
    whyEntered: "",
    winLossStatus: "WIN" as "WIN" | "LOSS" | "BREAK_EVEN",
  });

  const u = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const levelChips = useMemo(() => {
    if (!todayBias) return [];
    const chips: { label: string; value: number }[] = [];
    if (todayBias.asiaHigh) chips.push({ label: "Asia H", value: todayBias.asiaHigh });
    if (todayBias.asiaLow) chips.push({ label: "Asia L", value: todayBias.asiaLow });
    if (todayBias.previousDayHigh) chips.push({ label: "PDH", value: todayBias.previousDayHigh });
    if (todayBias.previousDayLow) chips.push({ label: "PDL", value: todayBias.previousDayLow });
    return chips;
  }, [todayBias]);

  const entry = Number(form.entryPrice) || 0;
  const exit = Number(form.exitPrice) || 0;
  const sl = Number(form.stopLossPrice) || 0;
  const size = Number(form.positionSize) || 1;
  const pnlPreview = entry && exit ? calculatePnlPreview(entry, exit, form.direction, size, Number(form.commission)) : null;
  const rrPreview = entry && sl && exit ? calculateRiskReward(entry, sl, exit, form.direction) : null;
  const slPips = entry && sl ? calculateStopLossPips(entry, sl, form.instrument) : null;

  const handleSave = async () => {
    if (!form.entryPrice || !form.stopLossPrice) {
      toast.error("Entry and stop loss required");
      return;
    }
    setSaving(true);
    try {
      const id = await createTrade({
        accountId: accounts?.[0]?._id,
        instrument: form.instrument,
        direction: form.direction,
        entryPrice: Number(form.entryPrice),
        exitPrice: form.exitPrice ? Number(form.exitPrice) : undefined,
        positionSize: Number(form.positionSize),
        commission: Number(form.commission),
        environment: form.environment,
        dailyBias: todayBias?.currentDailyBias ?? "NEUTRAL",
        externalStructure: "",
        majorLiquidityPools: "",
        internalStructure: "",
        currentRange: "",
        minorPushStatus: "",
        session: form.session,
        isInKillzone: true,
        poiType: "DECISIONAL",
        poiQuality: [],
        trapSwept: "NO",
        missingInducement: false,
        smsAfterTrap: true,
        rtoApplicable: false,
        tradeModel: "CONTINUATION",
        narrativeAlignment: true,
        tradingWithMainPush: true,
        noNarrativeMisalignment: true,
        poiMitigationStatus: "UNMITIGATED",
        stopLossPrice: Number(form.stopLossPrice),
        stopLossPlacement: "",
        stopLossPips: slPips ?? 0,
        stopLossQuality: "",
        riskAmount: Number(form.riskAmount),
        riskPercentage: 1,
        target1RR: rrPreview ?? 1,
        target2RR: 2,
        tradeClosureReason: "Manual",
        pnl: pnlPreview ?? undefined,
        winLossStatus: form.winLossStatus,
        finalRR: rrPreview ?? undefined,
        whyEntered: form.whyEntered || undefined,
        captures: captures.length ? captures : undefined,
        screenshots: captures.map((c) => c.storageId),
      });
      toast.success("Trade saved");
      router.push(`/trades/${id}`);
    } catch {
      toast.error("Failed to save trade");
    } finally {
      setSaving(false);
    }
  };

  if (fullLog) {
    return (
      <PageShell title="Full Log" subtitle="Complete WWA detail">
        <p className="text-sm text-muted-foreground">
          Full wizard preserved at{" "}
          <Link href="/trades/new" className="underline">Quick Log</Link>.
          Use Quick Log for daily journaling; expand fields here as needed in a future pass.
        </p>
        <Link href="/trades/new"><Button variant="outline" className="mt-4 rounded-md">Back to Quick Log</Button></Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Quick Log"
      subtitle="Paste charts first, one-line hook, prices — done in under a minute"
      maxWidth="lg"
      actions={
        <Link href="/trades" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Trades
        </Link>
      }
    >
      <CaptureDropzone value={captures} onChange={setCaptures} />

      <ContentCard className="mt-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">One-line hook</Label>
          <input
            value={form.whyEntered}
            onChange={(e) => u("whyEntered", e.target.value)}
            placeholder="Short EURUSD at London OB after inducement…"
            className="mt-1 w-full rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_INSTRUMENTS.map((inst) => (
            <Button key={inst} type="button" size="sm" variant={form.instrument === inst ? "default" : "outline"} onClick={() => u("instrument", inst)}>
              {inst}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["LONG", "SHORT"] as const).map((d) => (
            <Button key={d} type="button" size="sm" variant={form.direction === d ? "default" : "outline"} onClick={() => u("direction", d)}>{d}</Button>
          ))}
          {(["ASIA", "LONDON", "NEW_YORK"] as const).map((s) => (
            <Button key={s} type="button" size="sm" variant={form.session === s ? "default" : "outline"} onClick={() => u("session", s)}>{s}</Button>
          ))}
        </div>

        {todayBias && (
          <p className="text-xs text-muted-foreground">
            From today&apos;s plan: {todayBias.currentDailyBias} · {todayBias.bestInstrument ?? "—"}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <PriceInput label="Entry" value={form.entryPrice} onChange={(v) => u("entryPrice", v)} instrument={form.instrument} levelChips={levelChips} />
          <PriceInput label="Stop loss" value={form.stopLossPrice} onChange={(v) => u("stopLossPrice", v)} instrument={form.instrument} referencePrice={entry || undefined} levelChips={levelChips} />
          <PriceInput label="Exit" value={form.exitPrice} onChange={(v) => u("exitPrice", v)} instrument={form.instrument} referencePrice={entry || undefined} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {pnlPreview !== null && (
            <StatInline label="P&L preview" value={`${pnlPreview >= 0 ? "+" : ""}$${pnlPreview.toFixed(2)}`} valueClassName={pnlPreview >= 0 ? "text-emerald-600" : "text-red-500"} />
          )}
          {rrPreview !== null && <StatInline label="R:R" value={rrPreview.toFixed(2)} />}
          {slPips !== null && <StatInline label="SL" value={`${slPips.toFixed(1)} pips`} />}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["WIN", "LOSS", "BREAK_EVEN"] as const).map((s) => (
            <Button key={s} type="button" size="sm" variant={form.winLossStatus === s ? "default" : "outline"} onClick={() => u("winLossStatus", s)}>{s}</Button>
          ))}
        </div>
      </ContentCard>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => void handleSave()} disabled={saving} className="rounded-md">
          <Save className="h-4 w-4" /> Save trade
        </Button>
        <Link href="/trades/new?mode=full">
          <Button variant="outline" className="rounded-md">Add full WWA detail →</Button>
        </Link>
      </div>
    </PageShell>
  );
}
