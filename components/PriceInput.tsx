"use client";

import { useState } from "react";
import { ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPriceDecimals } from "@/lib/instrument-utils";
import { formatPips, priceDistancePips } from "@/lib/trade-calculations";

type PriceInputProps = Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  instrument: string;
  referencePrice?: number;
  levelChips?: { label: string; value: number }[];
  className?: string;
}>;

export function PriceInput({
  label,
  value,
  onChange,
  instrument,
  referencePrice,
  levelChips = [],
  className,
}: PriceInputProps) {
  const [focused, setFocused] = useState(false);
  const decimals = getPriceDecimals(instrument);
  const step = (1 / 10 ** decimals).toString();

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const num = Number(text.trim());
      if (Number.isFinite(num)) onChange(num.toFixed(decimals));
    } catch {
      /* clipboard denied */
    }
  };

  const pipHint =
    referencePrice !== undefined && value
      ? formatPips(priceDistancePips(referencePrice, Number(value), instrument))
      : null;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{label}</span>
        {pipHint && <span className="text-[10px] text-muted-foreground">{pipHint} to ref</span>}
      </div>
      <div
        className={cn(
          "flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-800",
          focused && "border-zinc-400 dark:border-zinc-600",
        )}
      >
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={"0." + "0".repeat(decimals)}
          className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => void pasteFromClipboard()}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Paste from clipboard"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
        </button>
      </div>
      {levelChips.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {levelChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChange(chip.value.toFixed(decimals))}
              className="rounded-md border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
