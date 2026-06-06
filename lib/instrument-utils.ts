/** Instrument-aware decimal places for price inputs */
export function getPriceDecimals(instrument: string): number {
  const normalized = instrument.toUpperCase().replace(/\s/g, "");
  if (normalized.includes("JPY")) return 3;
  return 5;
}

export function formatPrice(value: number, instrument: string): string {
  return value.toFixed(getPriceDecimals(instrument));
}

export function parsePriceInput(value: string, instrument: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  return Number(num.toFixed(getPriceDecimals(instrument)));
}

export function isJpyPair(instrument: string): boolean {
  return instrument.toUpperCase().includes("JPY");
}

export const COMMON_INSTRUMENTS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "NZD/USD",
  "EUR/GBP",
  "GBP/JPY",
] as const;
