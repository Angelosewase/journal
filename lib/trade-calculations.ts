import { getPriceDecimals } from "./instrument-utils";

export function pipSize(instrument: string): number {
  return instrument.toUpperCase().includes("JPY") ? 0.01 : 0.0001;
}

export function priceDistancePips(
  from: number,
  to: number,
  instrument: string,
): number {
  const pip = pipSize(instrument);
  return Math.abs(from - to) / pip;
}

export function calculateStopLossPips(
  entry: number,
  stopLoss: number,
  instrument: string,
): number {
  return priceDistancePips(entry, stopLoss, instrument);
}

export function calculateRiskReward(
  entry: number,
  stopLoss: number,
  exit: number,
  direction: "LONG" | "SHORT",
): number | null {
  const risk = Math.abs(entry - stopLoss);
  if (risk === 0) return null;
  const reward =
    direction === "LONG" ? exit - entry : entry - exit;
  return reward / risk;
}

export function calculatePnlPreview(
  entry: number,
  exit: number,
  direction: "LONG" | "SHORT",
  positionSize: number,
  commission = 0,
): number {
  const raw =
    direction === "LONG"
      ? (exit - entry) * positionSize
      : (entry - exit) * positionSize;
  return raw - commission;
}

export function formatPips(pips: number): string {
  return `${pips.toFixed(1)} pips`;
}

export function formatPrice(value: number, instrument: string): string {
  return value.toFixed(getPriceDecimals(instrument));
}
