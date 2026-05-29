import type { Doc } from "@/convex/_generated/dataModel";

export type Trade = Doc<"trades">;

// ─── Week boundaries (ISO, Monday-start) ────────────────────────────────────
// Standardised across the weekly hub, the review forms and the P&L chart so a
// review created for "this week" always lines up with the trades it summarises.

export function getWeekStart(date: Date | string | number): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // back to Monday
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
}

export function getWeekEnd(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end.toISOString().split("T")[0];
}

export function getCurrentWeekStart(): string {
  return getWeekStart(new Date());
}

export function tradeDateKey(trade: Trade): string {
  return new Date(trade.createdAt).toISOString().split("T")[0];
}

export function tradesForWeek(
  trades: Trade[] | undefined,
  weekStart: string,
  weekEnd: string,
): Trade[] {
  if (!trades) return [];
  return trades.filter((t) => {
    const key = tradeDateKey(t);
    return key >= weekStart && key <= weekEnd;
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const SESSION_LABELS: Record<string, string> = {
  ASIA: "Asia",
  LONDON: "London",
  NEW_YORK: "New York",
  OTHER: "Other",
};

function clampScore(n: number, min = 1, max = 10): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n * 10) / 10));
}

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** % of trades for which `pick` returns true, only counting trades where it is defined. */
function booleanRate(trades: Trade[], pick: (t: Trade) => boolean | undefined): number | null {
  const defined = trades.filter((t) => pick(t) !== undefined);
  if (defined.length === 0) return null;
  const yes = defined.filter((t) => pick(t) === true).length;
  return pct(yes, defined.length);
}

function avgPnl(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  return trades.reduce((s, t) => s + (t.pnl || 0), 0) / trades.length;
}

function isPristine(t: Trade): boolean {
  const rating = (t.poiQualityRating || "").toUpperCase();
  if (rating === "PRISTINE" || rating === "CLEAN") return true;
  return (t.tradeQualityScore ?? 0) >= 8;
}

function isQuestionable(t: Trade): boolean {
  const rating = (t.poiQualityRating || "").toUpperCase();
  if (rating === "QUESTIONABLE" || rating === "POOR") return true;
  const q = t.tradeQualityScore;
  return q !== undefined && q > 0 && q <= 5;
}

function describeTrade(t: Trade): string {
  const dir = t.direction === "LONG" ? "Long" : "Short";
  const pnl = t.pnl ?? 0;
  const sign = pnl >= 0 ? "+" : "";
  const rr = t.finalRR !== undefined ? `, ${t.finalRR.toFixed(1)}R` : "";
  const session = SESSION_LABELS[t.session] ?? t.session;
  return `${dir} ${t.instrument} (${session}) — ${sign}$${pnl.toFixed(2)}${rr}`;
}

// ─── Per-trade preview row (for the form UI) ────────────────────────────────

export type WeeklyTradeRow = {
  id: string;
  date: string;
  instrument: string;
  direction: "LONG" | "SHORT";
  session: string;
  sessionLabel: string;
  pnl: number;
  status: Trade["winLossStatus"];
  quality: number | null;
  finalRR: number | null;
};

export type SessionBreakdown = {
  session: string;
  label: string;
  trades: number;
  pnl: number;
  winRate: number;
};

// ─── Full auto-fill result ──────────────────────────────────────────────────

export type WeeklyReviewStats = {
  weekStart: string;
  weekEnd: string;
  hasTrades: boolean;
  rows: WeeklyTradeRow[];
  sessionBreakdown: SessionBreakdown[];

  // Numbers
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number;
  totalPnl: number;
  biggestWin: number;
  biggestLoss: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;

  // Compliance
  inducementPercentage: number;
  ltcPercentage: number;
  killzonePercentage: number;
  avgTrinityScore: number;

  // POI quality
  avgPoiQualityScore: number;
  pristineCleanSetups: number;
  questionableSetups: number;
  lossesOnLowQuality: boolean;

  // Narrative & patience
  tradesAgainstHtf: number;
  thoseLostMore: boolean;
  forcedTrades: number;
  waitedTrades: number;
  forcedTradesLostMore: boolean;

  // Skill scores (derived)
  poiIdentificationScore: number;
  inducementRecognitionScore: number;
  entryExecutionScore: number;
  riskManagementScore: number;
  overallSetupQualityScore: number;

  // Narrative text
  bestTradeDescription: string;
  whyBestWorked: string;
  worstTradeDescription: string;
  whyWorstFailed: string;
};

export function computeWeeklyReviewStats(
  allTrades: Trade[] | undefined,
  weekStart: string,
  weekEnd: string,
): WeeklyReviewStats {
  const trades = tradesForWeek(allTrades, weekStart, weekEnd);
  const wins = trades.filter((t) => t.winLossStatus === "WIN");
  const losses = trades.filter((t) => t.winLossStatus === "LOSS");
  const be = trades.filter((t) => t.winLossStatus === "BREAK_EVEN");

  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const grossProfit = wins.reduce((s, t) => s + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0));
  const avgWin = wins.length ? grossProfit / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

  const biggestWin = wins.length ? Math.max(...wins.map((t) => t.pnl || 0)) : 0;
  const biggestLoss = losses.length ? Math.min(...losses.map((t) => t.pnl || 0)) : 0;

  // Compliance: prefer post-trade reflection booleans, fall back to required fields.
  const inducementRate =
    booleanRate(trades, (t) => t.waitedForInducement) ??
    booleanRate(trades, (t) => !t.missingInducement) ??
    0;
  const ltcRate =
    booleanRate(trades, (t) => t.followedTrinity) ??
    booleanRate(trades, (t) => t.smsAfterTrap) ??
    0;
  const killzoneRate =
    booleanRate(trades, (t) => t.correctKillzone) ??
    booleanRate(trades, (t) => t.isInKillzone) ??
    0;

  // Trinity score: fraction of satisfied framework signals per trade, scaled to /10.
  const trinityScores = trades.map((t) => {
    const signals = [
      t.followedTrinity ?? t.smsAfterTrap,
      t.correctKillzone ?? t.isInKillzone,
      t.waitedForInducement ?? !t.missingInducement,
      t.respectedHTFNarrative ?? t.narrativeAlignment,
    ].filter((v) => v !== undefined) as boolean[];
    if (signals.length === 0) return 5;
    return (signals.filter(Boolean).length / signals.length) * 10;
  });
  const avgTrinityScore = trinityScores.length
    ? clampScore(trinityScores.reduce((s, n) => s + n, 0) / trinityScores.length)
    : 5;

  // POI quality.
  const scored = trades.filter((t) => (t.tradeQualityScore ?? 0) > 0);
  const avgQuality = scored.length
    ? scored.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / scored.length
    : 0;
  const avgPoiQualityScore = scored.length ? clampScore(avgQuality) : 5;
  const pristineCleanSetups = trades.filter(isPristine).length;
  const questionableSetups = trades.filter(isQuestionable).length;
  const lowQualityLosses = losses.filter(isQuestionable).length;
  const lossesOnLowQuality = losses.length > 0 && lowQualityLosses / losses.length >= 0.5;

  // Narrative alignment.
  const againstHtf = trades.filter(
    (t) => t.respectedHTFNarrative === false || (t.respectedHTFNarrative === undefined && t.narrativeAlignment === false),
  );
  const withHtf = trades.filter((t) => !againstHtf.includes(t));
  const thoseLostMore =
    againstHtf.length > 0 && withHtf.length > 0 && avgPnl(againstHtf) < avgPnl(withHtf);

  // Patience.
  const forced = trades.filter(
    (t) => t.waitedForInducement === false || (t.waitedForInducement === undefined && t.missingInducement === true),
  );
  const waited = trades.filter((t) => !forced.includes(t));
  const forcedTradesLostMore =
    forced.length > 0 && waited.length > 0 && avgPnl(forced) < avgPnl(waited);

  // Derived skill scores.
  const entryConfidenceTrades = trades.filter((t) => t.entryConfidence !== undefined);
  const entryExecutionScore = entryConfidenceTrades.length
    ? clampScore(
        entryConfidenceTrades.reduce((s, t) => s + (t.entryConfidence || 0), 0) /
          entryConfidenceTrades.length,
      )
    : clampScore(avgTrinityScore);
  const riskRate = booleanRate(trades, (t) => t.managedRiskPerPlan);
  const riskManagementScore =
    riskRate !== null ? clampScore(riskRate / 10) : clampScore(avgTrinityScore);

  // Narrative text from the standout trades.
  const bestTrade = wins.length
    ? wins.reduce((best, t) => ((t.pnl || 0) > (best.pnl || 0) ? t : best))
    : undefined;
  const worstTrade = losses.length
    ? losses.reduce((worst, t) => ((t.pnl || 0) < (worst.pnl || 0) ? t : worst))
    : undefined;

  const rows: WeeklyTradeRow[] = [...trades]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((t) => ({
      id: t._id,
      date: tradeDateKey(t),
      instrument: t.instrument,
      direction: t.direction,
      session: t.session,
      sessionLabel: SESSION_LABELS[t.session] ?? t.session,
      pnl: t.pnl ?? 0,
      status: t.winLossStatus,
      quality: t.tradeQualityScore ?? null,
      finalRR: t.finalRR ?? null,
    }));

  const sessionMap = new Map<string, { trades: number; pnl: number; wins: number }>();
  trades.forEach((t) => {
    const cur = sessionMap.get(t.session) ?? { trades: 0, pnl: 0, wins: 0 };
    cur.trades += 1;
    cur.pnl += t.pnl || 0;
    if (t.winLossStatus === "WIN") cur.wins += 1;
    sessionMap.set(t.session, cur);
  });
  const sessionBreakdown: SessionBreakdown[] = Array.from(sessionMap.entries())
    .map(([session, d]) => ({
      session,
      label: SESSION_LABELS[session] ?? session,
      trades: d.trades,
      pnl: d.pnl,
      winRate: pct(d.wins, d.trades),
    }))
    .sort((a, b) => b.trades - a.trades);

  return {
    weekStart,
    weekEnd,
    hasTrades: trades.length > 0,
    rows,
    sessionBreakdown,

    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakEvenTrades: be.length,
    winRate: pct(wins.length, trades.length),
    totalPnl,
    biggestWin,
    biggestLoss,
    avgWin,
    avgLoss,
    profitFactor,

    inducementPercentage: inducementRate,
    ltcPercentage: ltcRate,
    killzonePercentage: killzoneRate,
    avgTrinityScore,

    avgPoiQualityScore,
    pristineCleanSetups,
    questionableSetups,
    lossesOnLowQuality,

    tradesAgainstHtf: againstHtf.length,
    thoseLostMore,
    forcedTrades: forced.length,
    waitedTrades: waited.length,
    forcedTradesLostMore,

    poiIdentificationScore: avgPoiQualityScore,
    inducementRecognitionScore: clampScore(inducementRate / 10),
    entryExecutionScore,
    riskManagementScore,
    overallSetupQualityScore: avgPoiQualityScore,

    bestTradeDescription: bestTrade ? describeTrade(bestTrade) : "",
    whyBestWorked: bestTrade?.whatWentRight || bestTrade?.institutionalLessons || "",
    worstTradeDescription: worstTrade ? describeTrade(worstTrade) : "",
    whyWorstFailed: worstTrade?.whatWentWrong || worstTrade?.trinityViolationExplanation || "",
  };
}

/**
 * Maps the auto-computed stats to the string-based form state used by the
 * review forms. Only the fields that can be derived from trades are returned.
 */
export function weeklyStatsToFormValues(stats: WeeklyReviewStats): Record<string, string | boolean> {
  return {
    totalTrades: String(stats.totalTrades),
    winningTrades: String(stats.winningTrades),
    losingTrades: String(stats.losingTrades),
    totalPnl: stats.totalPnl.toFixed(2),
    biggestWin: stats.biggestWin.toFixed(2),
    biggestLoss: stats.biggestLoss.toFixed(2),
    avgWin: stats.avgWin.toFixed(2),
    avgLoss: stats.avgLoss.toFixed(2),
    profitFactor: stats.profitFactor.toFixed(2),

    inducementPercentage: String(stats.inducementPercentage),
    ltcPercentage: String(stats.ltcPercentage),
    killzonePercentage: String(stats.killzonePercentage),
    avgTrinityScore: String(Math.round(stats.avgTrinityScore)),

    avgPoiQualityScore: String(Math.round(stats.avgPoiQualityScore)),
    pristineCleanSetups: String(stats.pristineCleanSetups),
    questionableSetups: String(stats.questionableSetups),
    lossesOnLowQuality: stats.lossesOnLowQuality,

    tradesAgainstHtf: String(stats.tradesAgainstHtf),
    thoseLostMore: stats.thoseLostMore,
    forcedTrades: String(stats.forcedTrades),
    waitedTrades: String(stats.waitedTrades),
    forcedTradesLostMore: stats.forcedTradesLostMore,

    inducementRecognitionScore: String(Math.round(stats.inducementRecognitionScore)),
    poiIdentificationScore: String(Math.round(stats.poiIdentificationScore)),
    inducementRecognitionScore2: String(Math.round(stats.inducementRecognitionScore)),
    entryExecutionScore: String(Math.round(stats.entryExecutionScore)),
    riskManagementScore: String(Math.round(stats.riskManagementScore)),
    overallSetupQualityScore: String(Math.round(stats.overallSetupQualityScore)),

    bestTradeDescription: stats.bestTradeDescription,
    whyBestWorked: stats.whyBestWorked,
    worstTradeDescription: stats.worstTradeDescription,
    whyWorstFailed: stats.whyWorstFailed,
  };
}

// ─── Weekly P&L series (for the chart) ──────────────────────────────────────

export type WeeklyPnlPoint = {
  weekStart: string;
  weekEnd: string;
  pnl: number;
  trades: number;
  wins: number;
  winRate: number;
  cumulative: number;
  hasReview: boolean;
};

/**
 * Buckets raw trades into Monday-start weeks and returns an ordered series
 * (oldest → newest) with running cumulative P&L. Live trade data so the chart
 * always reflects the latest trades, independent of saved review snapshots.
 */
export function computeWeeklyPnlSeries(
  trades: Trade[] | undefined,
  reviewedWeekStarts: Set<string> = new Set(),
): WeeklyPnlPoint[] {
  if (!trades || trades.length === 0) return [];

  const map = new Map<string, { pnl: number; trades: number; wins: number }>();
  trades.forEach((t) => {
    const week = getWeekStart(t.createdAt);
    const cur = map.get(week) ?? { pnl: 0, trades: 0, wins: 0 };
    cur.pnl += t.pnl || 0;
    cur.trades += 1;
    if (t.winLossStatus === "WIN") cur.wins += 1;
    map.set(week, cur);
  });

  let cumulative = 0;
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, d]) => {
      cumulative += d.pnl;
      return {
        weekStart,
        weekEnd: getWeekEnd(weekStart),
        pnl: d.pnl,
        trades: d.trades,
        wins: d.wins,
        winRate: pct(d.wins, d.trades),
        cumulative,
        hasReview: reviewedWeekStarts.has(weekStart),
      };
    });
}
