export function formatMoney(
  amount: number,
  currency: string,
  options?: { showSign?: boolean },
): string {
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign =
    options?.showSign && amount > 0 ? "+" : options?.showSign && amount < 0 ? "" : "";
  return `${sign}${currency}${formatted}`;
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
