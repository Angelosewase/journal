"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { PageShell, StatInline } from "@/components/ui/page-shell";
import { ContentCard } from "@/components/ui/content-card";
import { CaptureDropzone } from "@/components/CaptureDropzone";
import { PriceInput } from "@/components/PriceInput";
import { TradeWizard } from "@/components/trade-wizard/TradeWizard";
import type { TradeCapture } from "@/lib/review-stats";
import { COMMON_INSTRUMENTS } from "@/lib/instrument-utils";
import { calculatePnlPreview, calculateRiskReward, calculateStopLossPips } from "@/lib/trade-calculations";
import {
  buildFormFromQuickLog,
  formToTradePayload,
  quickLogToPayload,
  type QuickLogState,
} from "@/lib/trade-form-state";
import { cn } from "@/lib/utils";

type LogMode = "quick" | "full";

export default function NewTradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode: LogMode = searchParams.get("mode") === "full" ? "full" : "quick";

  const createTrade = useMutation(api.trades.create);
  const accounts = useQuery(api.accounts.list);
  const todayBias = useQuery(api.dailyBias.getByDate, {
    date: new Date().toISOString().split("T")[0],
  });

  const [mode, setMode] = useState<LogMode>(initialMode);
  const [captures, setCaptures] = useState<TradeCapture[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuickLogState>({
    instrument: todayBias?.bestInstrument ?? "EUR/USD",
    direction: "LONG",
    session: "LONDON",
    environment: "LIVE",
    entryPrice: "",
    exitPrice: "",
    stopLossPrice: "",
    positionSize: "1",
    commission: "0",
    riskAmount: "100",
    whyEntered: "",
    winLossStatus: "WIN",
  });

  const u = (k: keyof QuickLogState, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
  const pnlPreview =
    entry && exit ? calculatePnlPreview(entry, exit, form.direction, size, Number(form.commission)) : null;
  const rrPreview = entry && sl && exit ? calculateRiskReward(entry, sl, exit, form.direction) : null;
  const slPips = entry && sl ? calculateStopLossPips(entry, sl, form.instrument) : null;

  const fullFormInitial = useMemo(
    () =>
      buildFormFromQuickLog(form, {
        dailyBias: todayBias?.currentDailyBias ?? "NEUTRAL",
        accountId: accounts?.[0]?._id ? String(accounts[0]._id) : undefined,
        captures,
      }),
    [form, todayBias, accounts, captures],
  );

  const handleQuickSave = async () => {
    if (!form.entryPrice || !form.stopLossPrice) {
      toast.error("Entry and stop loss required");
      return;
    }
    setSaving(true);
    try {
      const id = await createTrade(
        quickLogToPayload(form, {
          dailyBias: todayBias?.currentDailyBias ?? "NEUTRAL",
          accountId: accounts?.[0]?._id,
          captures,
        }) as Parameters<typeof createTrade>[0],
      );
      toast.success("Trade saved");
      router.push(`/trades/${id}`);
    } catch {
      toast.error("Failed to save trade");
    } finally {
      setSaving(false);
    }
  };

  const handleFullSave = async (wizardForm: Record<string, unknown>, partial: boolean) => {
    if (!partial && !form.entryPrice) {
      toast.error("Entry price required");
      return;
    }
    const id = await createTrade(
      formToTradePayload(wizardForm, captures) as Parameters<typeof createTrade>[0],
    );
    toast.success(partial ? "Draft saved" : "Trade saved");
    if (!partial) router.push(`/trades/${id}`);
  };

  if (mode === "full") {
    return (
      <TradeWizard
        title="Full Log"
        subtitle="Complete WWA detail — prefilled from Quick Log"
        initialForm={fullFormInitial}
        captures={captures}
        onCapturesChange={setCaptures}
        saveLabel="Save Trade"
        headerActions={
          <button
            type="button"
            onClick={() => setMode("quick")}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ← Quick Log
          </button>
        }
        onCancel={() => setMode("quick")}
        onSave={handleFullSave}
      />
    );
  }

  return (
    <PageShell
      title="Quick Log"
      subtitle="Paste charts first, one-line hook, prices — done in under a minute"
      maxWidth="lg"
      actions={
        <Link
          href="/trades"
          className="flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Trades
        </Link>
      }
    >
      <CaptureDropzone value={captures} onChange={setCaptures} />

      <ContentCard className="mt-4 space-y-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
            One-line hook
          </label>
          <input
            value={form.whyEntered}
            onChange={(e) => u("whyEntered", e.target.value)}
            placeholder="Short EURUSD at London OB after inducement…"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_INSTRUMENTS.map((inst) => (
            <button
              key={inst}
              type="button"
              onClick={() => u("instrument", inst)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                form.instrument === inst
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400",
              )}
            >
              {inst}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["LONG", "SHORT"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => u("direction", d)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                form.direction === d
                  ? d === "LONG"
                    ? "border-emerald-600 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "border-red-400 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
              )}
            >
              {d}
            </button>
          ))}
          {(["ASIA", "LONDON", "NEW_YORK"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => u("session", s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                form.session === s
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {todayBias && (
          <p className="text-xs text-zinc-400">
            From today&apos;s plan: {todayBias.currentDailyBias} · {todayBias.bestInstrument ?? "—"}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <PriceInput
            label="Entry"
            value={form.entryPrice}
            onChange={(v) => u("entryPrice", v)}
            instrument={form.instrument}
            levelChips={levelChips}
          />
          <PriceInput
            label="Stop loss"
            value={form.stopLossPrice}
            onChange={(v) => u("stopLossPrice", v)}
            instrument={form.instrument}
            referencePrice={entry || undefined}
            levelChips={levelChips}
          />
          <PriceInput
            label="Exit"
            value={form.exitPrice}
            onChange={(v) => u("exitPrice", v)}
            instrument={form.instrument}
            referencePrice={entry || undefined}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          {pnlPreview !== null && (
            <StatInline
              label="P&L preview"
              value={`${pnlPreview >= 0 ? "+" : ""}$${pnlPreview.toFixed(2)}`}
              valueClassName={pnlPreview >= 0 ? "text-emerald-600" : "text-red-500"}
            />
          )}
          {rrPreview !== null && <StatInline label="R:R" value={rrPreview.toFixed(2)} hint="Risk to reward" />}
          {slPips !== null && <StatInline label="SL" value={`${slPips.toFixed(1)} pips`} />}
        </div>

        <div className="flex flex-wrap gap-2">
          {(["WIN", "LOSS", "BREAK_EVEN"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => u("winLossStatus", s)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                form.winLossStatus === s
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
              )}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </ContentCard>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleQuickSave()}
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> Save trade
        </button>
        <button
          type="button"
          onClick={() => setMode("full")}
          className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Add full WWA detail →
        </button>
      </div>
    </PageShell>
  );
}
