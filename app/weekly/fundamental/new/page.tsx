"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, ChevronLeft, ChevronRight, CheckCircle2, BarChart2, Calendar, Landmark, TrendingUp, BookOpen, Compass, Lightbulb, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "macro",        label: "Macro",        icon: BarChart2,      description: "Risk sentiment & market conditions" },
  { id: "events",       label: "Events",       icon: Calendar,       description: "Key scheduled events this week" },
  { id: "centralbanks", label: "Central Banks",icon: Landmark,       description: "Fed, ECB, BoE, BoJ updates" },
  { id: "inflation",    label: "Inflation",    icon: TrendingUp,     description: "CPI, PCE, NFP & growth data" },
  { id: "cot",          label: "COT",          icon: BookOpen,       description: "Institutional positioning" },
  { id: "bias",         label: "Bias",         icon: Compass,        description: "Weekly currency bias" },
  { id: "trades",       label: "Trades",       icon: Lightbulb,      description: "Trade ideas & high-risk events" },
  { id: "review",       label: "Review",       icon: ClipboardCheck, description: "End-of-week reflection" },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function FlatInput({
  value, onChange, placeholder, type = "text", step,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; step?: string;
}) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
    />
  );
}

function FlatTextarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
    />
  );
}

function OptionPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function StatPair({
  leftLabel, leftValue, onLeftChange, leftType, leftPlaceholder, leftStep,
  rightLabel, rightValue, onRightChange, rightType, rightPlaceholder, rightStep,
}: {
  leftLabel: string; leftValue: string; onLeftChange: (v: string) => void; leftType?: string; leftPlaceholder?: string; leftStep?: string;
  rightLabel: string; rightValue: string; onRightChange: (v: string) => void; rightType?: string; rightPlaceholder?: string; rightStep?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex-1 space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{leftLabel}</p>
        <input type={leftType || "text"} step={leftStep} value={leftValue} onChange={(e) => onLeftChange(e.target.value)} placeholder={leftPlaceholder || "—"}
          className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" />
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex-1 space-y-1">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{rightLabel}</p>
        <input type={rightType || "text"} step={rightStep} value={rightValue} onChange={(e) => onRightChange(e.target.value)} placeholder={rightPlaceholder || "—"}
          className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" />
      </div>
    </div>
  );
}

// ─── Step: Macro ──────────────────────────────────────────────────────────────

function StepMacro({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionLabel>Risk Sentiment</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {["RISK_ON", "NEUTRAL", "RISK_OFF"].map((v) => (
            <OptionPill key={v} active={form.overallRiskSentiment === v} onClick={() => update("overallRiskSentiment", v)}>
              {v.replace("_", "-")}
            </OptionPill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {["UP", "SIDEWAYS", "DOWN"].map((v) => (
            <OptionPill key={v} active={form.riskSentimentDirection === v} onClick={() => update("riskSentimentDirection", v)}>
              {v}
            </OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>DXY Weekly Bias</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {["BULLISH", "NEUTRAL", "BEARISH"].map((v) => (
            <OptionPill key={v} active={form.dxyWeeklyBias === v} onClick={() => update("dxyWeeklyBias", v)}>
              {v}
            </OptionPill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {["UP", "SIDEWAYS", "DOWN"].map((v) => (
            <OptionPill key={v} active={form.dxyDirection === v} onClick={() => update("dxyDirection", v)}>
              {v}
            </OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Market Metrics</SectionLabel>
        <StatPair
          leftLabel="US 10yr Yield (%)" leftValue={form.us10yrYield} onLeftChange={(v) => update("us10yrYield", v)} leftType="number" leftStep="0.01" leftPlaceholder="4.25"
          rightLabel="VIX" rightValue={form.vixLevel} onRightChange={(v) => update("vixLevel", v)} rightType="number" rightStep="0.1" rightPlaceholder="18.0"
        />
        <StatPair
          leftLabel="WTI Oil ($)" leftValue={form.wtiOil} onLeftChange={(v) => update("wtiOil", v)} leftType="number" leftStep="0.01" leftPlaceholder="75.00"
          rightLabel="WTI Direction" rightValue="" onRightChange={() => {}}
        />
        <div className="flex flex-wrap gap-2">
          {["UP", "DOWN"].map((v) => (
            <OptionPill key={v} active={form.wtiDirection === v} onClick={() => update("wtiDirection", v)}>WTI {v}</OptionPill>
          ))}
          {["ABOVE_20", "BELOW_20"].map((v) => (
            <OptionPill key={v} active={form.vixDirection === v} onClick={() => update("vixDirection", v)}>VIX {v.replace("_", " ")}</OptionPill>
          ))}
          {["UP", "DOWN", "FLAT"].map((v) => (
            <OptionPill key={v} active={form.goldDirection === v} onClick={() => update("goldDirection", v)}>GOLD {v}</OptionPill>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Events ─────────────────────────────────────────────────────────────

function StepEvents({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Events by Day</SectionLabel>
        <div className="space-y-2">
          {days.map((day) => (
            <div key={day} className="flex gap-3 items-start">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-12 pt-2.5 shrink-0">{day.slice(0, 3)}</span>
              <FlatInput value={form[`${day}Events`]} onChange={(v) => update(`${day}Events`, v)} placeholder="Key events…" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Highest Impact Event</SectionLabel>
        <FlatInput value={form.highestImpactEvent} onChange={(v) => update("highestImpactEvent", v)} placeholder="e.g. NFP Friday 13:30 UTC" />
      </div>

      <div className="space-y-2">
        <SectionLabel>Expected Market Reaction</SectionLabel>
        <FlatTextarea value={form.expectedMarketReaction} onChange={(v) => update("expectedMarketReaction", v)} placeholder="How do you expect markets to react to the key events this week?" rows={3} />
      </div>
    </div>
  );
}

// ─── Step: Central Banks ──────────────────────────────────────────────────────

function StepCentralBanks({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-10">
      {/* Fed */}
      <div className="space-y-4">
        <SectionLabel>Federal Reserve</SectionLabel>
        <FlatTextarea value={form.fedMeetingsSpeeches} onChange={(v) => update("fedMeetingsSpeeches", v)} placeholder="Scheduled meetings, speeches, minutes…" rows={2} />
        <StatPair
          leftLabel="Current Rate (%)" leftValue={form.fedCurrentRate} onLeftChange={(v) => update("fedCurrentRate", v)} leftType="number" leftStep="0.25" leftPlaceholder="5.50"
          rightLabel="Market Expects" rightValue={form.fedMarketExpects} onRightChange={(v) => update("fedMarketExpects", v)} rightPlaceholder="Hold / Cut 25bps"
        />
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Probabilities (%)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hold", field: "fedHoldProbability" },
              { label: "Cut", field: "fedCutProbability" },
              { label: "Hike", field: "fedHikeProbability" },
            ].map(({ label, field }) => (
              <div key={field} className="rounded-xl border bg-muted/20 p-3 space-y-1">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <input type="number" value={form[field]} onChange={(e) => update(field, e.target.value)} placeholder="0"
                  className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-muted-foreground/30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ECB */}
      <div className="space-y-4">
        <SectionLabel>ECB</SectionLabel>
        <FlatTextarea value={form.ecbMeetingsSpeeches} onChange={(v) => update("ecbMeetingsSpeeches", v)} placeholder="Meetings, speeches…" rows={2} />
        <StatPair
          leftLabel="Current Rate (%)" leftValue={form.ecbCurrentRate} onLeftChange={(v) => update("ecbCurrentRate", v)} leftType="number" leftStep="0.25"
          rightLabel="Tone" rightValue={form.ecbTone} onRightChange={(v) => update("ecbTone", v)} rightPlaceholder="Hawkish / Dovish / Neutral"
        />
      </div>

      {/* BoE */}
      <div className="space-y-4">
        <SectionLabel>Bank of England</SectionLabel>
        <FlatTextarea value={form.boeMeetingsSpeeches} onChange={(v) => update("boeMeetingsSpeeches", v)} placeholder="Meetings, speeches…" rows={2} />
        <StatPair
          leftLabel="Current Rate (%)" leftValue={form.boeCurrentRate} onLeftChange={(v) => update("boeCurrentRate", v)} leftType="number" leftStep="0.25"
          rightLabel="Last Vote Split" rightValue={form.boeVoteSplit} onRightChange={(v) => update("boeVoteSplit", v)} rightPlaceholder="7-2"
        />
      </div>

      {/* BoJ */}
      <div className="space-y-4">
        <SectionLabel>Bank of Japan</SectionLabel>
        <FlatTextarea value={form.bojMeetingsSpeeches} onChange={(v) => update("bojMeetingsSpeeches", v)} placeholder="Meetings, speeches…" rows={2} />
        <FieldRow label="YCC / Policy Status">
          <FlatInput value={form.yccStatus} onChange={(v) => update("yccStatus", v)} placeholder="YCC maintained / abandoned" />
        </FieldRow>
      </div>
    </div>
  );
}

// ─── Step: Inflation ──────────────────────────────────────────────────────────

const TREND_OPTIONS_INF = ["RISING", "FALLING", "STICKY"];

function InflationRow({
  label, valueKey, priorKey, trendKey, form, update,
}: {
  label: string; valueKey: string; priorKey: string; trendKey: string; form: any; update: (k: string, v: any) => void;
}) {
  return (
    <div className="rounded-xl  bg-muted/20 p-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <StatPair
        leftLabel="Last" leftValue={form[valueKey]} onLeftChange={(v) => update(valueKey, v)} leftType="number" leftStep="0.01" leftPlaceholder="3.1"
        rightLabel="Prior" rightValue={form[priorKey]} onRightChange={(v) => update(priorKey, v)} rightType="number" rightStep="0.01" rightPlaceholder="3.2"
      />
      <div className="flex gap-2">
        {TREND_OPTIONS_INF.map((t) => (
          <OptionPill key={t} active={form[trendKey] === t} onClick={() => update(trendKey, t)}>{t}</OptionPill>
        ))}
      </div>
    </div>
  );
}

function StepInflation({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Inflation</SectionLabel>
        <InflationRow label="US CPI YoY"   valueKey="usCPIHeadline" priorKey="usCPIHeadlinePrior" trendKey="usCPIHeadlineTrend" form={form} update={update} />
        <InflationRow label="Core CPI YoY" valueKey="usCoreCPI"    priorKey="usCoreCPIPrior"      trendKey="usCoreCPITrend"      form={form} update={update} />
        <InflationRow label="Core PCE YoY" valueKey="corePCE"      priorKey="corePCEPrior"        trendKey="corePCETrend"        form={form} update={update} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Labour Market</SectionLabel>
        <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">NFP</p>
          <StatPair
            leftLabel="Jobs Added (K)" leftValue={form.nfpJobsAdded} onLeftChange={(v) => update("nfpJobsAdded", v)} leftType="number" leftPlaceholder="187"
            rightLabel="Prior (K)" rightValue={form.nfpPrior} onRightChange={(v) => update("nfpPrior", v)} rightType="number" rightPlaceholder="203"
          />
          <div className="flex gap-2">
            {["ACCELERATING", "DECELERATING"].map((t) => (
              <OptionPill key={t} active={form.nfpTrend === t} onClick={() => update("nfpTrend", t)}>{t}</OptionPill>
            ))}
          </div>
        </div>
        <StatPair
          leftLabel="Unemployment Rate (%)" leftValue={form.unemploymentRate} onLeftChange={(v) => update("unemploymentRate", v)} leftType="number" leftStep="0.1" leftPlaceholder="3.9"
          rightLabel="Unemployment Trend" rightValue="" onRightChange={() => {}}
        />
        <div className="flex gap-2">
          {["TIGHTENING", "LOOSENING"].map((t) => (
            <OptionPill key={t} active={form.unemploymentTrend === t} onClick={() => update("unemploymentTrend", t)}>{t}</OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>GDP</SectionLabel>
        <StatPair
          leftLabel="US GDP (%)" leftValue={form.usGDP} onLeftChange={(v) => update("usGDP", v)} leftType="number" leftStep="0.1"
          rightLabel="Prior (%)" rightValue={form.usGDPPrior} onRightChange={(v) => update("usGDPPrior", v)} rightType="number" rightStep="0.1"
        />
        <div className="flex gap-2">
          {["ACCELERATING", "DECELERATING"].map((t) => (
            <OptionPill key={t} active={form.usGDPTrend === t} onClick={() => update("usGDPTrend", t)}>{t}</OptionPill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>Narratives</SectionLabel>
        <FlatTextarea value={form.inflationNarrative} onChange={(v) => update("inflationNarrative", v)} placeholder="Inflation narrative — is it cooling, sticky, re-accelerating?" rows={2} />
        <FlatTextarea value={form.growthNarrative} onChange={(v) => update("growthNarrative", v)} placeholder="Growth narrative — expansion, slowdown, recession risk?" rows={2} />
      </div>
    </div>
  );
}

// ─── Step: COT ────────────────────────────────────────────────────────────────

function StepCOT({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  const currencies = ["EUR", "GBP", "JPY", "AUD", "CAD", "NZD"];
  return (
    <div className="space-y-6">
      <SectionLabel>Institutional Positioning</SectionLabel>
      <div className="space-y-3">
        {currencies.map((ccy) => {
          const lc = ccy.toLowerCase();
          return (
            <div key={ccy} className="rounded-xl  bg-muted/20 p-4 space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{ccy}</p>
              <StatPair
                leftLabel="Net Positions" leftValue={form[`${lc}NetPositions`]} onLeftChange={(v) => update(`${lc}NetPositions`, v)} leftType="number" leftPlaceholder="+12,400"
                rightLabel="Change" rightValue={form[`${lc}PositionChange`]} onRightChange={(v) => update(`${lc}PositionChange`, v)} rightType="number" rightPlaceholder="-1,200"
              />
              <div className="flex gap-2">
                {["BULLISH", "NEUTRAL", "BEARISH"].map((s) => (
                  <OptionPill key={s} active={form[`${lc}Signal`] === s} onClick={() => update(`${lc}Signal`, s)}>{s}</OptionPill>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <SectionLabel>Extreme Positioning Alert</SectionLabel>
        <FlatTextarea value={form.extremePositioningAlert} onChange={(v) => update("extremePositioningAlert", v)} placeholder="Any currencies at historic extremes? Potential reversal risk?" rows={2} />
      </div>
    </div>
  );
}

// ─── Step: Bias ───────────────────────────────────────────────────────────────

function StepBias({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  const currencies = [
    { label: "USD", bias: "usdBias", reason: "usdReason" },
    { label: "EUR", bias: "eurBias", reason: "eurReason" },
    { label: "GBP", bias: "gbpBias", reason: "gbpReason" },
    { label: "JPY", bias: "jpyBias", reason: "jpyReason" },
    { label: "CAD", bias: "cadBias", reason: "cadReason" },
    { label: "AUD", bias: "audBias", reason: "audReason" },
    { label: "CHF", bias: "chfBias", reason: "chfReason" },
    { label: "NZD", bias: "nzdBias", reason: "nzdReason" },
  ];

  return (
    <div className="space-y-4">
      <SectionLabel>Weekly Currency Bias</SectionLabel>
      {currencies.map(({ label, bias, reason }) => (
        <div key={label} className="flex gap-4 py-3 border-b last:border-0 items-start">
          <span className="text-sm font-semibold w-10 shrink-0 pt-1">{label}</span>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap gap-1.5">
              {["BULLISH", "NEUTRAL", "BEARISH"].map((v) => (
                <OptionPill key={v} active={form[bias] === v} onClick={() => update(bias, v)}>{v}</OptionPill>
              ))}
            </div>
            <input
              value={form[reason]}
              onChange={(e) => update(reason, e.target.value)}
              placeholder="Reason…"
              className="w-full rounded-lg bg-muted/40 px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step: Trades ─────────────────────────────────────────────────────────────

function StepTrades({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-8">
      {[1, 2].map((n) => (
        <div key={n} className="space-y-4">
          <SectionLabel>Trade Idea {n}</SectionLabel>
          <StatPair
            leftLabel="Pair" leftValue={form[`trade${n}Pair`]} onLeftChange={(v) => update(`trade${n}Pair`, v)} leftPlaceholder="EUR/USD"
            rightLabel="Direction" rightValue="" onRightChange={() => {}}
          />
          <div className="flex gap-2">
            {["LONG", "SHORT"].map((v) => (
              <OptionPill key={v} active={form[`trade${n}Direction`] === v} onClick={() => update(`trade${n}Direction`, v)}>{v}</OptionPill>
            ))}
          </div>
          <FlatTextarea value={form[`trade${n}Reason`]} onChange={(v) => update(`trade${n}Reason`, v)} placeholder="Fundamental reason for this trade…" rows={3} />
          <StatPair
            leftLabel="Key Level" leftValue={form[`trade${n}KeyLevel`]} onLeftChange={(v) => update(`trade${n}KeyLevel`, v)} leftPlaceholder="1.0850"
            rightLabel="Invalidation" rightValue={form[`trade${n}Invalidation`]} onRightChange={(v) => update(`trade${n}Invalidation`, v)} rightPlaceholder="Daily close above 1.0950"
          />
        </div>
      ))}

      <div className="space-y-4">
        <SectionLabel>High-Risk Events — Avoid Trading</SectionLabel>
        {[1, 2].map((n) => (
          <div key={n} className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <StatPair
              leftLabel="Event" leftValue={form[`highRiskEvent${n}`]} onLeftChange={(v) => update(`highRiskEvent${n}`, v)} leftPlaceholder="FOMC Rate Decision"
              rightLabel="Date" rightValue={form[`highRiskDate${n}`]} onRightChange={(v) => update(`highRiskDate${n}`, v)} rightType="date"
            />
            <FlatInput value={form[`highRiskReason${n}`]} onChange={(v) => update(`highRiskReason${n}`, v)} placeholder="Why to avoid?" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <SectionLabel>Geopolitical Watch</SectionLabel>
        <FlatTextarea value={form.activeRisks} onChange={(v) => update("activeRisks", v)} placeholder="Active geopolitical risks impacting markets…" rows={2} />
        <FlatTextarea value={form.potentialShockEvents} onChange={(v) => update("potentialShockEvents", v)} placeholder="Potential black swan / shock events to monitor…" rows={2} />
        <FlatInput value={form.safeHavenBias} onChange={(v) => update("safeHavenBias", v)} placeholder="Safe-haven bias this week (JPY, CHF, Gold…)" />
      </div>
    </div>
  );
}

// ─── Step: Review ─────────────────────────────────────────────────────────────

function StepReview({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Complete this after the week closes.</p>
      <div className="space-y-3">
        <SectionLabel>Bias Accuracy</SectionLabel>
        <FlatTextarea value={form.confirmationOfBias} onChange={(v) => update("confirmationOfBias", v)} placeholder="Did this week's data confirm or contradict your bias?" rows={3} />
      </div>
      <div className="space-y-2">
        <SectionLabel>What surprised you?</SectionLabel>
        <FlatTextarea value={form.surprisingData} onChange={(v) => update("surprisingData", v)} placeholder="Key data points or moves you didn't expect…" rows={3} />
      </div>
      <div className="space-y-2">
        <SectionLabel>What did you miss?</SectionLabel>
        <FlatTextarea value={form.missedAnalysis} onChange={(v) => update("missedAnalysis", v)} placeholder="Gaps in your analysis or signals you overlooked…" rows={3} />
      </div>
      <div className="space-y-2">
        <SectionLabel>Adjustments for next week</SectionLabel>
        <FlatTextarea value={form.adjustmentsNextWeek} onChange={(v) => update("adjustmentsNextWeek", v)} placeholder="How will you approach next week differently?" rows={3} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function NewWeeklyFundamentalPage() {
  const router = useRouter();
  const createAnalysis = useMutation(api.weeklyFundamentalAnalysis.create);

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    weekStart: weekStartStr, weekEnd: weekEndStr,
    overallRiskSentiment: "NEUTRAL", riskSentimentDirection: "SIDEWAYS",
    dxyWeeklyBias: "NEUTRAL", dxyDirection: "SIDEWAYS",
    us10yrYield: "", us10yrDirection: "SIDEWAYS",
    vixLevel: "", vixDirection: "BELOW_20",
    goldDirection: "FLAT", wtiOil: "", wtiDirection: "UP",
    mondayEvents: "", tuesdayEvents: "", wednesdayEvents: "", thursdayEvents: "", fridayEvents: "",
    highestImpactEvent: "", expectedMarketReaction: "",
    fedMeetingsSpeeches: "", fedCurrentRate: "", fedMarketExpects: "",
    fedHoldProbability: "", fedCutProbability: "", fedHikeProbability: "",
    ecbMeetingsSpeeches: "", ecbCurrentRate: "", ecbTone: "",
    boeMeetingsSpeeches: "", boeCurrentRate: "", boeVoteSplit: "",
    bojMeetingsSpeeches: "", yccStatus: "",
    usCPIHeadline: "", usCPIHeadlinePrior: "", usCPIHeadlineTrend: "",
    usCoreCPI: "", usCoreCPIPrior: "", usCoreCPITrend: "",
    corePCE: "", corePCEPrior: "", corePCETrend: "",
    nfpJobsAdded: "", nfpPrior: "", nfpTrend: "",
    unemploymentRate: "", unemploymentTrend: "",
    usGDP: "", usGDPPrior: "", usGDPTrend: "",
    inflationNarrative: "", growthNarrative: "",
    eurNetPositions: "", eurPositionChange: "", eurSignal: "",
    gbpNetPositions: "", gbpPositionChange: "", gbpSignal: "",
    jpyNetPositions: "", jpyPositionChange: "", jpySignal: "",
    audNetPositions: "", audPositionChange: "", audSignal: "",
    cadNetPositions: "", cadPositionChange: "", cadSignal: "",
    nzdNetPositions: "", nzdPositionChange: "", nzdSignal: "",
    extremePositioningAlert: "",
    usdBias: "NEUTRAL", usdReason: "",
    eurBias: "NEUTRAL", eurReason: "",
    gbpBias: "NEUTRAL", gbpReason: "",
    jpyBias: "NEUTRAL", jpyReason: "",
    cadBias: "NEUTRAL", cadReason: "",
    audBias: "NEUTRAL", audReason: "",
    chfBias: "NEUTRAL", chfReason: "",
    nzdBias: "NEUTRAL", nzdReason: "",
    trade1Pair: "", trade1Direction: "", trade1Reason: "", trade1KeyLevel: "", trade1Invalidation: "",
    trade2Pair: "", trade2Direction: "", trade2Reason: "", trade2KeyLevel: "", trade2Invalidation: "",
    highRiskEvent1: "", highRiskDate1: "", highRiskReason1: "",
    highRiskEvent2: "", highRiskDate2: "", highRiskReason2: "",
    activeRisks: "", potentialShockEvents: "", safeHavenBias: "",
    confirmationOfBias: "", surprisingData: "", missedAnalysis: "", adjustmentsNextWeek: "",
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    try {
      await createAnalysis({
        weekStart: form.weekStart, weekEnd: form.weekEnd,
        overallRiskSentiment: form.overallRiskSentiment as any,
        riskSentimentDirection: form.riskSentimentDirection as any,
        dxyWeeklyBias: form.dxyWeeklyBias as any,
        dxyDirection: form.dxyDirection as any,
        us10yrYield: form.us10yrYield ? Number(form.us10yrYield) : undefined,
        us10yrDirection: form.us10yrDirection as any,
        vixLevel: form.vixLevel ? Number(form.vixLevel) : undefined,
        vixDirection: form.vixDirection as any,
        goldDirection: form.goldDirection as any,
        wtiOil: form.wtiOil ? Number(form.wtiOil) : undefined,
        wtiDirection: form.wtiDirection as any,
        mondayEvents: form.mondayEvents || undefined,
        tuesdayEvents: form.tuesdayEvents || undefined,
        wednesdayEvents: form.wednesdayEvents || undefined,
        thursdayEvents: form.thursdayEvents || undefined,
        fridayEvents: form.fridayEvents || undefined,
        highestImpactEvent: form.highestImpactEvent || undefined,
        expectedMarketReaction: form.expectedMarketReaction || undefined,
        fedMeetingsSpeeches: form.fedMeetingsSpeeches || undefined,
        fedCurrentRate: form.fedCurrentRate ? Number(form.fedCurrentRate) : undefined,
        fedMarketExpects: form.fedMarketExpects || undefined,
        fedHoldProbability: form.fedHoldProbability ? Number(form.fedHoldProbability) : undefined,
        fedCutProbability: form.fedCutProbability ? Number(form.fedCutProbability) : undefined,
        fedHikeProbability: form.fedHikeProbability ? Number(form.fedHikeProbability) : undefined,
        ecbMeetingsSpeeches: form.ecbMeetingsSpeeches || undefined,
        ecbCurrentRate: form.ecbCurrentRate ? Number(form.ecbCurrentRate) : undefined,
        ecbTone: form.ecbTone || undefined,
        boeMeetingsSpeeches: form.boeMeetingsSpeeches || undefined,
        boeCurrentRate: form.boeCurrentRate ? Number(form.boeCurrentRate) : undefined,
        boeVoteSplit: form.boeVoteSplit || undefined,
        bojMeetingsSpeeches: form.bojMeetingsSpeeches || undefined,
        yccStatus: form.yccStatus || undefined,
        usCPIHeadline: form.usCPIHeadline ? Number(form.usCPIHeadline) : undefined,
        usCPIHeadlinePrior: form.usCPIHeadlinePrior ? Number(form.usCPIHeadlinePrior) : undefined,
        usCPIHeadlineTrend: (form.usCPIHeadlineTrend || undefined) as any,
        usCoreCPI: form.usCoreCPI ? Number(form.usCoreCPI) : undefined,
        usCoreCPIPrior: form.usCoreCPIPrior ? Number(form.usCoreCPIPrior) : undefined,
        usCoreCPITrend: (form.usCoreCPITrend || undefined) as any,
        corePCE: form.corePCE ? Number(form.corePCE) : undefined,
        corePCEPrior: form.corePCEPrior ? Number(form.corePCEPrior) : undefined,
        corePCETrend: (form.corePCETrend || undefined) as any,
        nfpJobsAdded: form.nfpJobsAdded ? Number(form.nfpJobsAdded) : undefined,
        nfpPrior: form.nfpPrior ? Number(form.nfpPrior) : undefined,
        nfpTrend: (form.nfpTrend || undefined) as any,
        unemploymentRate: form.unemploymentRate ? Number(form.unemploymentRate) : undefined,
        unemploymentTrend: (form.unemploymentTrend || undefined) as any,
        usGDP: form.usGDP ? Number(form.usGDP) : undefined,
        usGDPPrior: form.usGDPPrior ? Number(form.usGDPPrior) : undefined,
        usGDPTrend: (form.usGDPTrend || undefined) as any,
        inflationNarrative: form.inflationNarrative || undefined,
        growthNarrative: form.growthNarrative || undefined,
        eurNetPositions: form.eurNetPositions ? Number(form.eurNetPositions) : undefined,
        eurPositionChange: form.eurPositionChange ? Number(form.eurPositionChange) : undefined,
        eurSignal: (form.eurSignal || undefined) as any,
        gbpNetPositions: form.gbpNetPositions ? Number(form.gbpNetPositions) : undefined,
        gbpPositionChange: form.gbpPositionChange ? Number(form.gbpPositionChange) : undefined,
        gbpSignal: (form.gbpSignal || undefined) as any,
        jpyNetPositions: form.jpyNetPositions ? Number(form.jpyNetPositions) : undefined,
        jpyPositionChange: form.jpyPositionChange ? Number(form.jpyPositionChange) : undefined,
        jpySignal: (form.jpySignal || undefined) as any,
        audNetPositions: form.audNetPositions ? Number(form.audNetPositions) : undefined,
        audPositionChange: form.audPositionChange ? Number(form.audPositionChange) : undefined,
        audSignal: (form.audSignal || undefined) as any,
        cadNetPositions: form.cadNetPositions ? Number(form.cadNetPositions) : undefined,
        cadPositionChange: form.cadPositionChange ? Number(form.cadPositionChange) : undefined,
        cadSignal: (form.cadSignal || undefined) as any,
        nzdNetPositions: form.nzdNetPositions ? Number(form.nzdNetPositions) : undefined,
        nzdPositionChange: form.nzdPositionChange ? Number(form.nzdPositionChange) : undefined,
        nzdSignal: (form.nzdSignal || undefined) as any,
        extremePositioningAlert: form.extremePositioningAlert || undefined,
        usdBias: form.usdBias as any, usdReason: form.usdReason || undefined,
        eurBias: form.eurBias as any, eurReason: form.eurReason || undefined,
        gbpBias: form.gbpBias as any, gbpReason: form.gbpReason || undefined,
        jpyBias: form.jpyBias as any, jpyReason: form.jpyReason || undefined,
        cadBias: form.cadBias as any, cadReason: form.cadReason || undefined,
        audBias: form.audBias as any, audReason: form.audReason || undefined,
        chfBias: form.chfBias as any, chfReason: form.chfReason || undefined,
        nzdBias: form.nzdBias as any, nzdReason: form.nzdReason || undefined,
        trade1Pair: form.trade1Pair || undefined,
        trade1Direction: (form.trade1Direction || undefined) as any,
        trade1Reason: form.trade1Reason || undefined,
        trade1KeyLevel: form.trade1KeyLevel || undefined,
        trade1Invalidation: form.trade1Invalidation || undefined,
        trade2Pair: form.trade2Pair || undefined,
        trade2Direction: (form.trade2Direction || undefined) as any,
        trade2Reason: form.trade2Reason || undefined,
        trade2KeyLevel: form.trade2KeyLevel || undefined,
        trade2Invalidation: form.trade2Invalidation || undefined,
        highRiskEvent1: form.highRiskEvent1 || undefined,
        highRiskDate1: form.highRiskDate1 || undefined,
        highRiskReason1: form.highRiskReason1 || undefined,
        highRiskEvent2: form.highRiskEvent2 || undefined,
        highRiskDate2: form.highRiskDate2 || undefined,
        highRiskReason2: form.highRiskReason2 || undefined,
        activeRisks: form.activeRisks || undefined,
        potentialShockEvents: form.potentialShockEvents || undefined,
        safeHavenBias: form.safeHavenBias || undefined,
        confirmationOfBias: form.confirmationOfBias || undefined,
        surprisingData: form.surprisingData || undefined,
        missedAnalysis: form.missedAnalysis || undefined,
        adjustmentsNextWeek: form.adjustmentsNextWeek || undefined,
      });
      toast.success("Fundamental analysis saved!");
      router.push("/weekly");
    } catch {
      toast.error("Failed to save fundamental analysis");
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  const stepComponents = [
    <StepMacro        key="macro"        form={form} update={update} />,
    <StepEvents       key="events"       form={form} update={update} />,
    <StepCentralBanks key="centralbanks" form={form} update={update} />,
    <StepInflation    key="inflation"    form={form} update={update} />,
    <StepCOT          key="cot"          form={form} update={update} />,
    <StepBias         key="bias"         form={form} update={update} />,
    <StepTrades       key="trades"       form={form} update={update} />,
    <StepReview       key="review"       form={form} update={update} />,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/weekly"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Weekly Fundamental Analysis</h1>
          <p className="text-xs text-muted-foreground">
            {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Step rail */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(i)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 shrink-0",
                active ? "bg-foreground text-background" : done ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          );
        })}
        <div className="flex-1 h-px bg-border ml-1" />
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{currentStep + 1}/{STEPS.length}</span>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 min-h-[400px]">
        <div className="mb-6">
          <h2 className="text-base font-semibold">{STEPS[currentStep].label}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
        </div>
        {stepComponents[currentStep]}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline" size="sm"
          onClick={() => currentStep === 0 ? router.push("/weekly") : setCurrentStep(currentStep - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 0 ? "Cancel" : "Back"}
        </Button>

        {isLastStep ? (
          <Button size="sm" onClick={handleSubmit} className="gap-2">
            <Save className="h-3.5 w-3.5" />
            Save Analysis
          </Button>
        ) : (
          <Button size="sm" onClick={() => setCurrentStep(currentStep + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}