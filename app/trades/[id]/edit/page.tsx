"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, ChevronLeft, ChevronRight, CheckCircle2, Info, Layers, Zap, Shield, BarChart2, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "basics",     label: "Basics",     icon: Info,      description: "Instrument, direction & prices" },
  { id: "context",    label: "Context",    icon: Layers,    description: "Structure, bias & session" },
  { id: "setup",      label: "Setup",      icon: Zap,       description: "POI, traps & Trinity" },
  { id: "risk",       label: "Risk",       icon: Shield,    description: "Stop loss, sizing & targets" },
  { id: "outcome",    label: "Outcome",    icon: BarChart2, description: "Result & quality ratings" },
  { id: "reflection", label: "Reflection", icon: BookOpen,  description: "What happened & lessons" },
];

const INSTRUMENTS = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];

const REQUIRED = ["instrument", "direction", "entryPrice", "stopLossPrice", "riskAmount"];
function isComplete(f: Record<string, any>) { return REQUIRED.every((k) => f[k] && f[k] !== ""); }

// ─── Primitives ───────────────────────────────────────────────────────────────

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
        active ? "bg-foreground text-background border-foreground"
               : "text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
      )}>
      {children}
    </button>
  );
}

function FlatInput({ value, onChange, placeholder, type = "text", step, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; step?: string; required?: boolean;
}) {
  return (
    <input type={type} step={step} value={value} required={required}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "—"}
      className="w-full rounded-lg bg-muted/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring" />
  );
}

function FlatTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full resize-none rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-ring" />
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground mb-1.5">{children}</p>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">{children}</p>;
}

function SliderRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const num = Number(value) || 1;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{num}<span className="text-xs font-normal text-muted-foreground">/10</span></span>
      </div>
      <input type="range" min={1} max={10} value={num} onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 rounded-full accent-foreground cursor-pointer" />
    </div>
  );
}

function PricePair({ leftLabel, leftValue, onLeft, rightLabel, rightValue, onRight, step = "0.00001" }: {
  leftLabel: string; leftValue: string; onLeft: (v: string) => void;
  rightLabel: string; rightValue: string; onRight: (v: string) => void;
  step?: string;
}) {
  return (
    <div className="flex gap-2 rounded-xl border bg-muted/20 p-3">
      <div className="flex-1 space-y-0.5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{leftLabel}</p>
        <input type="number" step={step} value={leftValue} onChange={(e) => onLeft(e.target.value)} placeholder="0.00000"
          className="w-full bg-transparent text-base font-mono font-medium outline-none placeholder:text-muted-foreground/30" />
      </div>
      <div className="w-px bg-border" />
      <div className="flex-1 space-y-0.5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{rightLabel}</p>
        <input type="number" step={step} value={rightValue} onChange={(e) => onRight(e.target.value)} placeholder="0.00000"
          className="w-full bg-transparent text-base font-mono font-medium outline-none placeholder:text-muted-foreground/30" />
      </div>
    </div>
  );
}

function CheckRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(!!c)} />
      <Label htmlFor={id} className="text-sm cursor-pointer">{label}</Label>
    </div>
  );
}

function TrinityStatus({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
      active ? "border-foreground/20 text-foreground" : "border-border text-muted-foreground line-through")}>
      <span className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-foreground" : "bg-muted-foreground/30")} />
      {label}
    </div>
  );
}

// ─── Step: Basics ─────────────────────────────────────────────────────────────

function StepBasics({ f, u, accounts }: { f: Record<string, any>; u: (k: string, v: any) => void; accounts: { _id: string; name: string }[] }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Environment</SectionLabel>
        <div className="flex gap-2">
          {["BACKTESTING", "DEMO", "LIVE"].map((v) => (
            <Pill key={v} active={f.environment === v} onClick={() => u("environment", v)}>{v}</Pill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Instrument</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map((v) => (
            <Pill key={v} active={f.instrument === v} onClick={() => u("instrument", v)}>{v}</Pill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Direction</SectionLabel>
        <div className="flex gap-2">
          <Pill active={f.direction === "LONG"}  onClick={() => u("direction", "LONG")}>↑ LONG</Pill>
          <Pill active={f.direction === "SHORT"} onClick={() => u("direction", "SHORT")}>↓ SHORT</Pill>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Prices</SectionLabel>
        <PricePair leftLabel="Entry" leftValue={f.entryPrice} onLeft={(v) => u("entryPrice", v)}
          rightLabel="Exit" rightValue={f.exitPrice} onRight={(v) => u("exitPrice", v)} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Size & Fees</SectionLabel>
        <div className="flex gap-2 rounded-xl border bg-muted/20 p-3">
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Lot Size</p>
            <input type="number" step="0.01" value={f.positionSize} onChange={(e) => u("positionSize", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Commission ($)</p>
            <input type="number" step="0.01" value={f.commission} onChange={(e) => u("commission", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none" />
          </div>
        </div>
      </div>

      {accounts.length > 0 && (
        <div className="space-y-3">
          <SectionLabel>Account</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Pill active={f.accountId === "__none__" || !f.accountId} onClick={() => u("accountId", "__none__")}>No account</Pill>
            {accounts.map((a) => (
              <Pill key={a._id} active={f.accountId === String(a._id)} onClick={() => u("accountId", String(a._id))}>{a.name}</Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step: Context ────────────────────────────────────────────────────────────

function StepContext({ f, u }: { f: Record<string, any>; u: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Daily Bias</SectionLabel>
        <div className="flex gap-2">
          {["BULLISH", "NEUTRAL", "BEARISH"].map((v) => (
            <Pill key={v} active={f.dailyBias === v} onClick={() => u("dailyBias", v)}>{v}</Pill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Session</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {["ASIA", "LONDON", "NEW_YORK", "OTHER"].map((v) => (
            <Pill key={v} active={f.session === v} onClick={() => u("session", v)}>{v.replace("_", " ")}</Pill>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Checkbox id="isInKillzone" checked={f.isInKillzone} onCheckedChange={(c) => u("isInKillzone", !!c)} />
          <Label htmlFor="isInKillzone" className="text-sm cursor-pointer">In Killzone (London / NY Open)</Label>
        </div>
      </div>

      <div className="space-y-2">
        <SectionLabel>External Structure (Main Push)</SectionLabel>
        <FlatTextarea value={f.externalStructure} onChange={(v) => u("externalStructure", v)}
          placeholder="Main push direction, key structure levels, where institutions are targeting…" rows={3} />
      </div>

      <div className="space-y-2">
        <SectionLabel>Major Liquidity Pools</SectionLabel>
        <FlatTextarea value={f.majorLiquidityPools} onChange={(v) => u("majorLiquidityPools", v)}
          placeholder="Asia High / Low, Previous D POI, key EQH / EQL…" rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FieldLabel>Internal Structure</FieldLabel>
          <FlatInput value={f.internalStructure} onChange={(v) => u("internalStructure", v)} placeholder="BOS, ChoCH…" />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Current Range</FieldLabel>
          <FlatInput value={f.currentRange} onChange={(v) => u("currentRange", v)} placeholder="e.g. 80 pips" />
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Minor Push Status</FieldLabel>
        <FlatInput value={f.minorPushStatus} onChange={(v) => u("minorPushStatus", v)} placeholder="e.g. Continuing, Exhausting" />
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Trade Model</FieldLabel>
        <div className="flex gap-2">
          <Pill active={f.tradeModel === "CONTINUATION"} onClick={() => u("tradeModel", "CONTINUATION")}>CONTINUATION</Pill>
          <Pill active={f.tradeModel === "REVERSAL"}     onClick={() => u("tradeModel", "REVERSAL")}>REVERSAL</Pill>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Narrative Alignment</SectionLabel>
        <div className="space-y-2">
          <CheckRow id="narrativeAlignment"     label="HTF narrative supports this trade" checked={f.narrativeAlignment}     onChange={(v) => u("narrativeAlignment", v)} />
          <CheckRow id="tradingWithMainPush"     label="Trading WITH the Main Push"        checked={f.tradingWithMainPush}     onChange={(v) => u("tradingWithMainPush", v)} />
          <CheckRow id="noNarrativeMisalignment" label="No narrative misalignment"         checked={f.noNarrativeMisalignment} onChange={(v) => u("noNarrativeMisalignment", v)} />
          <CheckRow id="institutionsReasoned"    label="Institutions reasoned"             checked={f.institutionsReasoned}    onChange={(v) => u("institutionsReasoned", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <FieldLabel>Liquidity Engineering</FieldLabel>
            <div className="flex gap-2">
              <Pill active={f.clearLiquidityEngineering === "CLEAR"}   onClick={() => u("clearLiquidityEngineering", "CLEAR")}>CLEAR</Pill>
              <Pill active={f.clearLiquidityEngineering === "UNCLEAR"} onClick={() => u("clearLiquidityEngineering", "UNCLEAR")}>UNCLEAR</Pill>
            </div>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Approach Dynamics</FieldLabel>
            <FlatInput value={f.approachDynamics} onChange={(v) => u("approachDynamics", v)} placeholder="CP / V-Shape / Other" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Setup ──────────────────────────────────────────────────────────────

function StepSetup({ f, u }: { f: Record<string, any>; u: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      {/* POI */}
      <div className="space-y-3">
        <SectionLabel>POI</SectionLabel>
        <div className="flex gap-2">
          <Pill active={f.poiType === "EXTREME"}    onClick={() => u("poiType", "EXTREME")}>EXTREME</Pill>
          <Pill active={f.poiType === "DECISIONAL"} onClick={() => u("poiType", "DECISIONAL")}>DECISIONAL</Pill>
        </div>
        <div className="flex flex-wrap gap-2">
          {["UNMITIGATED", "MITIGATED_ONCE", "WEAKENED"].map((v) => (
            <Pill key={v} active={f.poiMitigationStatus === v} onClick={() => u("poiMitigationStatus", v)}>
              {v.replace("_", " ")}
            </Pill>
          ))}
        </div>
        <FlatTextarea value={f.poiDescription} onChange={(v) => u("poiDescription", v)}
          placeholder="Describe the POI — type, location, how it formed…" rows={2} />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>Gap size (pips)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.gapSize} onChange={(v) => u("gapSize", v)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Break size (pips)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.breakSize} onChange={(v) => u("breakSize", v)} placeholder="0" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>Inducement resting</FieldLabel>
            <FlatInput value={f.inducementResting} onChange={(v) => u("inducementResting", v)} placeholder="Above / Below" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Distance from POI (pips)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.distanceFromPoi} onChange={(v) => u("distanceFromPoi", v)} placeholder="0" />
          </div>
        </div>
        <CheckRow id="cleanBreak" label="Clean break (convincing structure break)" checked={f.cleanBreak} onChange={(v) => u("cleanBreak", v)} />
      </div>

      {/* Traps */}
      <div className="space-y-3">
        <SectionLabel>Trap</SectionLabel>
        <div className="flex gap-2">
          {["YES", "NO", "PARTIAL"].map((v) => (
            <Pill key={v} active={f.trapSwept === v} onClick={() => u("trapSwept", v)}>{v}</Pill>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>Trap type</FieldLabel>
            <FlatInput value={f.trapType} onChange={(v) => u("trapType", v)} placeholder="Inducement / SMT…" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Trap cleanliness</FieldLabel>
            <FlatInput value={f.trapCleanliness} onChange={(v) => u("trapCleanliness", v)} placeholder="Clean / Messy" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>Trap location (pips from POI)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.trapLocation} onChange={(v) => u("trapLocation", v)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Trap tapped count</FieldLabel>
            <FlatInput type="number" value={f.trapTappedCount} onChange={(v) => u("trapTappedCount", v)} placeholder="0" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>Liquidity engineering</FieldLabel>
            <FlatInput value={f.liquidityEngineering} onChange={(v) => u("liquidityEngineering", v)} placeholder="Stacked / Swept" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Liq. tapped count</FieldLabel>
            <FlatInput type="number" value={f.liquidityTappedCount} onChange={(v) => u("liquidityTappedCount", v)} placeholder="0" />
          </div>
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Retail behavior</FieldLabel>
          <FlatInput value={f.retailBehavior} onChange={(v) => u("retailBehavior", v)} placeholder="Chasing / Stop hunting…" />
        </div>
        <CheckRow id="missingInducement" label="Missing inducement (reduces probability)" checked={f.missingInducement} onChange={(v) => u("missingInducement", v)} />
      </div>

      {/* Trinity status */}
      <div className="space-y-3">
        <SectionLabel>Trinity Check</SectionLabel>
        <div className="space-y-2">
          <TrinityStatus label="1 · Inducement swept"       active={f.trapSwept === "YES"} />
          <TrinityStatus label="2 · LTC / SMS confirmation" active={f.smsAfterTrap} />
          <TrinityStatus label="3 · In Killzone"            active={f.isInKillzone} />
        </div>
        <CheckRow id="smsAfterTrap" label="SMS (Shift in Market Structure) after trap" checked={f.smsAfterTrap} onChange={(v) => u("smsAfterTrap", v)} />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>LTF entry TF</FieldLabel>
            <div className="flex gap-2">
              <Pill active={f.ltfEntryTimeframe === "1M"} onClick={() => u("ltfEntryTimeframe", "1M")}>1M</Pill>
              <Pill active={f.ltfEntryTimeframe === "5M"} onClick={() => u("ltfEntryTimeframe", "5M")}>5M</Pill>
            </div>
          </div>
          <div className="space-y-1.5">
            <FieldLabel>BMS pattern</FieldLabel>
            <FlatInput value={f.bmsPattern} onChange={(v) => u("bmsPattern", v)} placeholder="BOS / ChoCH…" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>SMC / SMG type</FieldLabel>
            <FlatInput value={f.smcType} onChange={(v) => u("smcType", v)} placeholder="Higher High + Higher Low…" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>RTO distance (pips)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.rtoDistance} onChange={(v) => u("rtoDistance", v)} placeholder="0" />
          </div>
        </div>
        <CheckRow id="rtoApplicable" label="RTO (Retest of Origin) applicable" checked={f.rtoApplicable} onChange={(v) => u("rtoApplicable", v)} />
        <SliderRow label="BMS confidence"   value={f.bmsConfidence}   onChange={(v) => u("bmsConfidence", v)} />
        <SliderRow label="Entry confidence" value={f.entryConfidence} onChange={(v) => u("entryConfidence", v)} />
      </div>
    </div>
  );
}

// ─── Step: Risk ───────────────────────────────────────────────────────────────

function StepRisk({ f, u }: { f: Record<string, any>; u: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Stop Loss</SectionLabel>
        <PricePair leftLabel="SL Price" leftValue={f.stopLossPrice} onLeft={(v) => u("stopLossPrice", v)}
          rightLabel="SL Pips" rightValue={f.stopLossPips} onRight={(v) => u("stopLossPips", v)} step="0.1" />
        <div className="flex flex-wrap gap-2">
          {["IFC_ABOVE", "IFC_BELOW", "REFINED_WICK"].map((v) => (
            <Pill key={v} active={f.stopLossPlacement === v} onClick={() => u("stopLossPlacement", v)}>
              {v.replace("_", " ")}
            </Pill>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Risk</SectionLabel>
        <div className="flex gap-2 rounded-xl border bg-muted/20 p-3">
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Amount ($)</p>
            <input type="number" step="0.01" value={f.riskAmount} onChange={(e) => u("riskAmount", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="10.00" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">% of Account</p>
            <input type="number" step="0.1" value={f.riskPercentage} onChange={(e) => u("riskPercentage", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="1.0" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Targets</SectionLabel>
        <div className="flex gap-2 rounded-xl border bg-muted/20 p-3">
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">T1 RR</p>
            <input type="number" step="0.1" value={f.target1RR} onChange={(e) => u("target1RR", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">T2 RR</p>
            <input type="number" step="0.1" value={f.target2RR} onChange={(e) => u("target2RR", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">T1 Price</p>
            <input type="number" step="0.00001" value={f.target1Price} onChange={(e) => u("target1Price", e.target.value)}
              className="w-full bg-transparent text-base font-mono font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="opt." />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">T2 Price</p>
            <input type="number" step="0.00001" value={f.target2Price} onChange={(e) => u("target2Price", e.target.value)}
              className="w-full bg-transparent text-base font-mono font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="opt." />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step: Outcome ────────────────────────────────────────────────────────────

function StepOutcome({ f, u }: { f: Record<string, any>; u: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionLabel>Result</SectionLabel>
        <div className="flex gap-2">
          {["WIN", "BREAK_EVEN", "LOSS"].map((v) => (
            <Pill key={v} active={f.winLossStatus === v} onClick={() => u("winLossStatus", v)}>
              {v.replace("_", " ")}
            </Pill>
          ))}
        </div>
        <div className="flex gap-2 rounded-xl border bg-muted/20 p-3">
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">P&amp;L ($)</p>
            <input type="number" step="0.01" value={f.pnl} onChange={(e) => u("pnl", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="0.00" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">P&amp;L (%)</p>
            <input type="number" step="0.1" value={f.pnlPercentage} onChange={(e) => u("pnlPercentage", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="0.0" />
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1 space-y-0.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Final RR</p>
            <input type="number" step="0.1" value={f.finalRR} onChange={(e) => u("finalRR", e.target.value)}
              className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-muted-foreground/30" placeholder="0.0" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionLabel>Closure</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {["OPEN", "HIT_TARGET_1_RUNNING", "HIT_TARGET_2_COMPLETELY", "STOPPED_OUT", "MANUAL_EXIT"].map((v) => (
            <Pill key={v} active={f.tradeClosureReason === v} onClick={() => u("tradeClosureReason", v)}>
              {v.replace(/_/g, " ")}
            </Pill>
          ))}
        </div>
        <div className="space-y-2">
          <CheckRow id="target1Hit"          label="Target 1 hit"              checked={f.target1Hit}          onChange={(v) => u("target1Hit", v)} />
          <CheckRow id="stopMovedToBE"       label="Stop moved to break even"  checked={f.stopMovedToBE}       onChange={(v) => u("stopMovedToBE", v)} />
          <CheckRow id="breakEvenStopsMoved" label="Break even stops moved"    checked={f.breakEvenStopsMoved} onChange={(v) => u("breakEvenStopsMoved", v)} />
          <CheckRow id="manualExit"          label="Manual exit"               checked={f.manualExit}          onChange={(v) => u("manualExit", v)} />
        </div>
        {f.target1Hit && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <FieldLabel>T1 hit price</FieldLabel>
              <FlatInput type="number" step="0.00001" value={f.target1HitPrice} onChange={(v) => u("target1HitPrice", v)} placeholder="0.00000" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Time to T1 (min)</FieldLabel>
              <FlatInput type="number" value={f.timeToTarget1} onChange={(v) => u("timeToTarget1", v)} placeholder="0" />
            </div>
          </div>
        )}
        {f.manualExit && (
          <div className="space-y-2">
            <FlatInput value={f.manualExitReason} onChange={(v) => u("manualExitReason", v)} placeholder="Why did you exit manually?" />
            <CheckRow id="manualExitAligned" label="Manual exit aligned with plan" checked={f.manualExitAligned} onChange={(v) => u("manualExitAligned", v)} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <SectionLabel>Post-Entry Metrics</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <FieldLabel>Time in trade (min)</FieldLabel>
            <FlatInput type="number" value={f.timeInTradeMinutes} onChange={(v) => u("timeInTradeMinutes", v)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Time to close (min)</FieldLabel>
            <FlatInput type="number" value={f.timeToClose} onChange={(v) => u("timeToClose", v)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Max profit (pips)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.maxProfitReached} onChange={(v) => u("maxProfitReached", v)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Max drawdown (pips)</FieldLabel>
            <FlatInput type="number" step="0.1" value={f.maxDrawdown} onChange={(v) => u("maxDrawdown", v)} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>T2 status</FieldLabel>
            <FlatInput value={f.target2Status} onChange={(v) => u("target2Status", v)} placeholder="Running / Hit / Not Hit" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>T2 closed at</FieldLabel>
            <FlatInput type="number" value={f.target2ClosedAt} onChange={(v) => u("target2ClosedAt", v)} placeholder="Timestamp" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionLabel>Quality Ratings</SectionLabel>
        <SliderRow label="Overall trade quality" value={f.tradeQualityScore} onChange={(v) => u("tradeQualityScore", v)} />
        <div className="space-y-3">
          {[
            { label: "POI quality",        field: "poiQualityRating",        opts: ["PRISTINE","CLEAN","ACCEPTABLE","QUESTIONABLE"] },
            { label: "Inducement quality", field: "inducementQualityRating", opts: ["OBVIOUS","CLEAR","SUBTLE","MISSING"] },
            { label: "Trinity alignment",  field: "trinityAlignmentRating",  opts: ["PERFECT","STRONG","ACCEPTABLE","WEAK"] },
            { label: "Risk execution",     field: "riskExecutionRating",     opts: ["FLAWLESS","GOOD","ACCEPTABLE","POOR"] },
            { label: "Discipline",         field: "disciplineRating",        opts: ["PERFECT_WAIT","MINOR_RUSH","IMPATIENT","FORCED"] },
          ].map(({ label, field, opts }) => (
            <div key={field} className="flex gap-3 items-center py-2 border-b last:border-0">
              <span className="text-xs text-muted-foreground w-32 shrink-0">{label}</span>
              <div className="flex flex-wrap gap-1.5">
                {opts.map((v) => (
                  <Pill key={v} active={f[field] === v} onClick={() => u(field, v)}>{v.replace(/_/g, " ")}</Pill>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step: Reflection ─────────────────────────────────────────────────────────

function StepReflection({ f, u }: { f: Record<string, any>; u: (k: string, v: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SectionLabel>Why did you enter?</SectionLabel>
        <RichTextEditor value={f.whyEntered} onChange={(v) => u("whyEntered", v)}
          placeholder="Describe the setup, what you saw, why you pulled the trigger…" rows={3} />
      </div>

      <CheckRow id="playedAsExpected" label="Move played out as expected" checked={f.playedAsExpected} onChange={(v) => u("playedAsExpected", v)} />

      <div className="space-y-2">
        <SectionLabel>What went right / wrong?</SectionLabel>
        <RichTextEditor value={f.whatWentRight} onChange={(v) => u("whatWentRight", v)} placeholder="What you did well…" rows={2} />
        <RichTextEditor value={f.whatWentWrong} onChange={(v) => u("whatWentWrong", v)} placeholder="What went wrong or could be better…" rows={2} />
      </div>

      <div className="space-y-2">
        <SectionLabel>Expansion & Surprise</SectionLabel>
        <RichTextEditor value={f.expansionDescription} onChange={(v) => u("expansionDescription", v)}
          placeholder="How did the trade expand beyond expectations?" rows={2} />
        <RichTextEditor value={f.surpriseDescription} onChange={(v) => u("surpriseDescription", v)}
          placeholder="Any unexpected movements?" rows={2} />
      </div>

      <div className="space-y-2">
        <SectionLabel>Institutional lessons</SectionLabel>
        <RichTextEditor value={f.institutionalLessons} onChange={(v) => u("institutionalLessons", v)}
          placeholder="What did institutions do? What did you learn about their behaviour?" rows={2} />
      </div>

      <div className="space-y-2">
        <SectionLabel>How this affects the next trade</SectionLabel>
        <RichTextEditor value={f.howAffectsNext} onChange={(v) => u("howAffectsNext", v)}
          placeholder="How does this change your approach going forward?" rows={2} />
      </div>

      <div className="space-y-3">
        <SectionLabel>Rule adherence</SectionLabel>
        <div className="space-y-2">
          <CheckRow id="followedTrinity"       label="Followed the Trinity"          checked={f.followedTrinity}       onChange={(v) => u("followedTrinity", v)} />
          <CheckRow id="correctKillzone"       label="Used correct Killzone"         checked={f.correctKillzone}       onChange={(v) => u("correctKillzone", v)} />
          <CheckRow id="waitedForInducement"   label="Waited for clear inducement"   checked={f.waitedForInducement}   onChange={(v) => u("waitedForInducement", v)} />
          <CheckRow id="respectedHTFNarrative" label="Respected HTF Narrative"       checked={f.respectedHTFNarrative} onChange={(v) => u("respectedHTFNarrative", v)} />
          <CheckRow id="managedRiskPerPlan"    label="Managed risk per plan"         checked={f.managedRiskPerPlan}    onChange={(v) => u("managedRiskPerPlan", v)} />
        </div>
        {!f.followedTrinity && (
          <FlatTextarea value={f.trinityViolationExplanation} onChange={(v) => u("trinityViolationExplanation", v)}
            placeholder="Explain the Trinity violation…" rows={2} />
        )}
      </div>

      <SliderRow label="Discipline score" value={f.disciplineScore} onChange={(v) => u("disciplineScore", v)} />

      <div className="space-y-2">
        <SectionLabel>Screenshots</SectionLabel>
        <ScreenshotUpload value={f.screenshots} onChange={(ids) => u("screenshots", ids)} maxFiles={5} />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditTradePage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as Id<"trades">;
  const trade = useQuery(api.trades.get, { id: tradeId });
  const accounts = useQuery(api.accounts.list) as { _id: string; name: string }[] | undefined;
  const updateTrade = useMutation(api.trades.update);

  const [step, setStep] = useState(0);
  const [f, setF] = useState<Record<string, any>>({});

  useEffect(() => {
    if (trade && Object.keys(f).length === 0) {
      setF({
        accountId: trade.accountId || "",
        instrument: trade.instrument || "EUR/USD",
        direction: trade.direction || "LONG",
        entryPrice: String(trade.entryPrice ?? ""),
        exitPrice: String(trade.exitPrice ?? ""),
        positionSize: String(trade.positionSize ?? "0.01"),
        commission: String(trade.commission ?? "0"),
        environment: trade.environment || "DEMO",
        dailyBias: trade.dailyBias || "NEUTRAL",
        externalStructure: trade.externalStructure || "",
        majorLiquidityPools: trade.majorLiquidityPools || "",
        internalStructure: trade.internalStructure || "",
        currentRange: trade.currentRange || "",
        minorPushStatus: trade.minorPushStatus || "",
        session: trade.session || "LONDON",
        isInKillzone: trade.isInKillzone ?? true,
        poiType: trade.poiType || "EXTREME",
        poiQuality: trade.poiQuality || [],
        poiDescription: trade.poiDescription || "",
        gapSize: String(trade.gapSize ?? ""),
        inducementResting: trade.inducementResting || "",
        inducementType: trade.inducementType || "",
        distanceFromPoi: String(trade.distanceFromPoi ?? ""),
        liquidityPoolDescription: trade.liquidityPoolDescription || "",
        cleanBreak: trade.cleanBreak ?? false,
        breakSize: String(trade.breakSize ?? ""),
        trapSwept: trade.trapSwept || "NO",
        trapType: trade.trapType || "",
        trapLocation: String(trade.trapLocation ?? ""),
        trapTappedCount: String(trade.trapTappedCount ?? ""),
        trapCleanliness: trade.trapCleanliness || "",
        liquidityEngineering: trade.liquidityEngineering || "",
        liquidityTappedCount: String(trade.liquidityTappedCount ?? ""),
        retailBehavior: trade.retailBehavior || "",
        missingInducement: trade.missingInducement ?? false,
        ltfEntryTimeframe: trade.ltfEntryTimeframe || "5M",
        smcType: trade.smcType || "",
        smsAfterTrap: trade.smsAfterTrap ?? false,
        bmsPattern: trade.bmsPattern || "",
        bmsConfidence: String(trade.bmsConfidence ?? "5"),
        rtoApplicable: trade.rtoApplicable ?? false,
        rtoDistance: String(trade.rtoDistance ?? ""),
        entryConfidence: String(trade.entryConfidence ?? "5"),
        tradeModel: trade.tradeModel || "CONTINUATION",
        narrativeAlignment: trade.narrativeAlignment ?? true,
        tradingWithMainPush: trade.tradingWithMainPush ?? true,
        noNarrativeMisalignment: trade.noNarrativeMisalignment ?? true,
        clearLiquidityEngineering: trade.clearLiquidityEngineering || "UNCLEAR",
        institutionsReasoned: trade.institutionsReasoned ?? false,
        poiMitigationStatus: trade.poiMitigationStatus || "UNMITIGATED",
        approachDynamics: trade.approachDynamics || "",
        stopLossPrice: String(trade.stopLossPrice ?? ""),
        stopLossPlacement: trade.stopLossPlacement || "IFC_ABOVE",
        stopLossPips: String(trade.stopLossPips ?? "5"),
        stopLossQuality: trade.stopLossQuality || "CLEAN",
        riskAmount: String(trade.riskAmount ?? "10"),
        riskPercentage: String(trade.riskPercentage ?? "1"),
        target1RR: String(trade.target1RR ?? "3"),
        target2RR: String(trade.target2RR ?? "10"),
        target1Price: String(trade.target1Price ?? ""),
        target2Price: String(trade.target2Price ?? ""),
        timeInTradeMinutes: String(trade.timeInTradeMinutes ?? ""),
        maxProfitReached: String(trade.maxProfitReached ?? ""),
        maxDrawdown: String(trade.maxDrawdown ?? ""),
        target1Hit: trade.target1Hit ?? false,
        target1HitPrice: String(trade.target1HitPrice ?? ""),
        stopMovedToBE: trade.stopMovedToBE ?? false,
        timeToTarget1: String(trade.timeToTarget1 ?? ""),
        target2Status: trade.target2Status || "",
        target2ClosedAt: String(trade.target2ClosedAt ?? ""),
        finalRR: String(trade.finalRR ?? ""),
        timeToClose: String(trade.timeToClose ?? ""),
        breakEvenStopsMoved: trade.breakEvenStopsMoved ?? false,
        manualExit: trade.manualExit ?? false,
        manualExitReason: trade.manualExitReason || "",
        manualExitAligned: trade.manualExitAligned ?? false,
        tradeClosureReason: trade.tradeClosureReason || "OPEN",
        pnl: String(trade.pnl ?? ""),
        pnlPercentage: String(trade.pnlPercentage ?? ""),
        winLossStatus: trade.winLossStatus || "BREAK_EVEN",
        tradeQualityScore: String(trade.tradeQualityScore ?? "5"),
        poiQualityRating: trade.poiQualityRating || "ACCEPTABLE",
        inducementQualityRating: trade.inducementQualityRating || "CLEAR",
        trinityAlignmentRating: trade.trinityAlignmentRating || "ACCEPTABLE",
        riskExecutionRating: trade.riskExecutionRating || "GOOD",
        disciplineRating: trade.disciplineRating || "MINOR_RUSH",
        whyEntered: trade.whyEntered || "",
        playedAsExpected: trade.playedAsExpected ?? true,
        expansionDescription: trade.expansionDescription || "",
        surpriseDescription: trade.surpriseDescription || "",
        whatWentWrong: trade.whatWentWrong || "",
        whatWentRight: trade.whatWentRight || "",
        institutionalLessons: trade.institutionalLessons || "",
        howAffectsNext: trade.howAffectsNext || "",
        followedTrinity: trade.followedTrinity ?? true,
        trinityViolationExplanation: trade.trinityViolationExplanation || "",
        correctKillzone: trade.correctKillzone ?? true,
        respectedHTFNarrative: trade.respectedHTFNarrative ?? true,
        waitedForInducement: trade.waitedForInducement ?? true,
        managedRiskPerPlan: trade.managedRiskPerPlan ?? true,
        disciplineScore: String(trade.disciplineScore ?? "5"),
        screenshots: trade.screenshots || [],
      });
    }
  }, [trade]); // eslint-disable-line react-hooks/exhaustive-deps

  const u = (key: string, value: any) => setF((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (partial = false) => {
    if (!partial && !isComplete(f)) {
      toast.warning("Fill required fields: instrument, direction, entry, SL, risk amount.");
      return;
    }
    try {
      await updateTrade({
        id: tradeId,
        updates: {
          accountId: f.accountId && f.accountId !== "__none__" ? f.accountId as Id<"accounts"> : undefined,
          instrument: f.instrument,
          direction: f.direction,
          entryPrice: Number(f.entryPrice),
          exitPrice: f.exitPrice ? Number(f.exitPrice) : undefined,
          positionSize: Number(f.positionSize),
          commission: Number(f.commission),
          environment: f.environment,
          dailyBias: f.dailyBias,
          externalStructure: f.externalStructure,
          majorLiquidityPools: f.majorLiquidityPools,
          internalStructure: f.internalStructure,
          currentRange: f.currentRange || undefined,
          minorPushStatus: f.minorPushStatus || undefined,
          session: f.session,
          isInKillzone: f.isInKillzone,
          poiType: f.poiType,
          poiQuality: f.poiQuality,
          poiDescription: f.poiDescription || undefined,
          gapSize: f.gapSize ? Number(f.gapSize) : undefined,
          inducementResting: f.inducementResting || undefined,
          inducementType: f.inducementType || undefined,
          distanceFromPoi: f.distanceFromPoi ? Number(f.distanceFromPoi) : undefined,
          liquidityPoolDescription: f.liquidityPoolDescription || undefined,
          cleanBreak: f.cleanBreak || undefined,
          breakSize: f.breakSize ? Number(f.breakSize) : undefined,
          trapSwept: f.trapSwept,
          trapType: f.trapType || undefined,
          trapLocation: f.trapLocation ? Number(f.trapLocation) : undefined,
          trapTappedCount: f.trapTappedCount ? Number(f.trapTappedCount) : undefined,
          trapCleanliness: f.trapCleanliness || undefined,
          liquidityEngineering: f.liquidityEngineering || undefined,
          liquidityTappedCount: f.liquidityTappedCount ? Number(f.liquidityTappedCount) : undefined,
          retailBehavior: f.retailBehavior || undefined,
          missingInducement: f.missingInducement,
          ltfEntryTimeframe: f.ltfEntryTimeframe || undefined,
          smcType: f.smcType || undefined,
          smsAfterTrap: f.smsAfterTrap,
          bmsPattern: f.bmsPattern || undefined,
          bmsConfidence: Number(f.bmsConfidence),
          rtoApplicable: f.rtoApplicable,
          rtoDistance: f.rtoDistance ? Number(f.rtoDistance) : undefined,
          entryConfidence: Number(f.entryConfidence),
          tradeModel: f.tradeModel,
          narrativeAlignment: f.narrativeAlignment,
          tradingWithMainPush: f.tradingWithMainPush,
          noNarrativeMisalignment: f.noNarrativeMisalignment,
          clearLiquidityEngineering: f.clearLiquidityEngineering || undefined,
          institutionsReasoned: f.institutionsReasoned || undefined,
          poiMitigationStatus: f.poiMitigationStatus,
          approachDynamics: f.approachDynamics || undefined,
          stopLossPrice: Number(f.stopLossPrice),
          stopLossPlacement: f.stopLossPlacement,
          stopLossPips: Number(f.stopLossPips),
          stopLossQuality: f.stopLossQuality,
          riskAmount: Number(f.riskAmount),
          riskPercentage: Number(f.riskPercentage),
          target1RR: Number(f.target1RR),
          target2RR: Number(f.target2RR),
          target1Price: f.target1Price ? Number(f.target1Price) : undefined,
          target2Price: f.target2Price ? Number(f.target2Price) : undefined,
          timeInTradeMinutes: f.timeInTradeMinutes ? Number(f.timeInTradeMinutes) : undefined,
          maxProfitReached: f.maxProfitReached ? Number(f.maxProfitReached) : undefined,
          maxDrawdown: f.maxDrawdown ? Number(f.maxDrawdown) : undefined,
          target1Hit: f.target1Hit || undefined,
          target1HitPrice: f.target1HitPrice ? Number(f.target1HitPrice) : undefined,
          stopMovedToBE: f.stopMovedToBE || undefined,
          timeToTarget1: f.timeToTarget1 ? Number(f.timeToTarget1) : undefined,
          target2Status: f.target2Status || undefined,
          target2ClosedAt: f.target2ClosedAt ? Number(f.target2ClosedAt) : undefined,
          finalRR: f.finalRR ? Number(f.finalRR) : undefined,
          timeToClose: f.timeToClose ? Number(f.timeToClose) : undefined,
          breakEvenStopsMoved: f.breakEvenStopsMoved || undefined,
          manualExit: f.manualExit || undefined,
          manualExitReason: f.manualExitReason || undefined,
          manualExitAligned: f.manualExitAligned || undefined,
          tradeClosureReason: f.tradeClosureReason,
          pnl: f.pnl ? Number(f.pnl) : undefined,
          pnlPercentage: f.pnlPercentage ? Number(f.pnlPercentage) : undefined,
          winLossStatus: f.winLossStatus,
          tradeQualityScore: Number(f.tradeQualityScore),
          poiQualityRating: f.poiQualityRating,
          inducementQualityRating: f.inducementQualityRating,
          trinityAlignmentRating: f.trinityAlignmentRating,
          riskExecutionRating: f.riskExecutionRating,
          disciplineRating: f.disciplineRating,
          whyEntered: f.whyEntered || undefined,
          playedAsExpected: f.playedAsExpected,
          expansionDescription: f.expansionDescription || undefined,
          surpriseDescription: f.surpriseDescription || undefined,
          whatWentWrong: f.whatWentWrong || undefined,
          whatWentRight: f.whatWentRight || undefined,
          institutionalLessons: f.institutionalLessons || undefined,
          howAffectsNext: f.howAffectsNext || undefined,
          followedTrinity: f.followedTrinity,
          trinityViolationExplanation: f.trinityViolationExplanation || undefined,
          correctKillzone: f.correctKillzone,
          respectedHTFNarrative: f.respectedHTFNarrative,
          waitedForInducement: f.waitedForInducement,
          managedRiskPerPlan: f.managedRiskPerPlan,
          disciplineScore: Number(f.disciplineScore),
          screenshots: f.screenshots.length > 0 ? f.screenshots : undefined,
        },
      });
      toast.success(partial ? "Changes saved!" : "Trade updated!");
      if (!partial) router.push(`/trades/${tradeId}`);
    } catch {
      toast.error("Failed to update trade");
    }
  };

  if (!trade || Object.keys(f).length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-3 text-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading trade…</p>
        </div>
      </div>
    );
  }

  const isLast = step === STEPS.length - 1;

  const panels = [
    <StepBasics     key="basics"      f={f} u={u} accounts={accounts || []} />,
    <StepContext    key="context"     f={f} u={u} />,
    <StepSetup      key="setup"       f={f} u={u} />,
    <StepRisk       key="risk"        f={f} u={u} />,
    <StepOutcome    key="outcome"     f={f} u={u} />,
    <StepReflection key="reflection"  f={f} u={u} />,
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/trades/${tradeId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Edit Trade</h1>
            <p className="text-xs text-muted-foreground">{trade.instrument} · {trade.direction}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => handleSave(true)}>
          Save changes
        </Button>
      </div>

      {/* Step rail */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button key={s.id} type="button" onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                active ? "bg-foreground text-background" : done ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
        <div className="flex-1 h-px bg-border ml-1" />
        <span className="text-xs text-muted-foreground tabular-nums">{step + 1}/{STEPS.length}</span>
      </div>

      {/* Step panel */}
      <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 min-h-[380px]">
        <div className="mb-6">
          <h2 className="text-base font-semibold">{STEPS[step].label}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[step].description}</p>
        </div>
        {panels[step]}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm"
          onClick={() => step === 0 ? router.push(`/trades/${tradeId}`) : setStep(step - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {isLast ? (
          <Button size="sm" onClick={() => handleSave(false)} className="gap-2">
            <Save className="h-3.5 w-3.5" />Update Trade
          </Button>
        ) : (
          <Button size="sm" onClick={() => setStep(step + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
