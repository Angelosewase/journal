import type { Doc } from "@/convex/_generated/dataModel";

export type Trade = Doc<"trades">;
export type TradeCapture = NonNullable<Trade["captures"]>[number];

export {
  getWeekStart,
  getWeekEnd,
  getCurrentWeekStart,
  tradeDateKey,
  tradesForWeek,
  computeWeeklyPnlSeries,
  type WeeklyPnlPoint,
} from "./weekly-review";

import { getWeekEnd } from "./weekly-review";

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
  thumbnailId?: string;
};

export type SessionBreakdown = {
  session: string;
  label: string;
  trades: number;
  pnl: number;
  winRate: number;
  bestTrade?: WeeklyTradeRow;
  worstTrade?: WeeklyTradeRow;
  bestInstrument?: string;
  worstInstrument?: string;
};

export type ReviewStats = {
  weekStart: string;
  weekEnd: string;
  hasTrades: boolean;
  rows: WeeklyTradeRow[];
  sessionBreakdown: SessionBreakdown[];

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

  inducementPercentage: number;
  ltcPercentage: number;
  killzonePercentage: number;
  avgTrinityScore: number;
  htfNarrativePercentage: number;
  riskPlanPercentage: number;

  avgPoiQualityScore: number;
  pristineCleanSetups: number;
  questionableSetups: number;
  lossesOnLowQuality: boolean;

  tradesAgainstHtf: number;
  thoseLostMore: boolean;
  forcedTrades: number;
  waitedTrades: number;
  forcedTradesLostMore: boolean;
  prematureEntries: number;
  prematureEntryCost: number;
  mostCommonTrapType: string;
  narrativeAbilityScore: number;
  patienceScore: number;

  poiIdentificationScore: number;
  inducementRecognitionScore: number;
  entryExecutionScore: number;
  riskManagementScore: number;
  overallSetupQualityScore: number;

  bestTradeDescription: string;
  whyBestWorked: string;
  worstTradeDescription: string;
  whyWorstFailed: string;
};

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

function booleanRate(
  trades: Trade[],
  pick: (t: Trade) => boolean | undefined,
): number | null {
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

export function describeTrade(t: Trade): string {
  const dir = t.direction === "LONG" ? "Long" : "Short";
  const pnl = t.pnl ?? 0;
  const sign = pnl >= 0 ? "+" : "";
  const rr = t.finalRR !== undefined ? `, ${t.finalRR.toFixed(1)}R` : "";
  const session = SESSION_LABELS[t.session] ?? t.session;
  return `${dir} ${t.instrument} (${session}) — ${sign}$${pnl.toFixed(2)}${rr}`;
}

export function getTradeThumbnail(trade: Trade): string | undefined {
  const captures = trade.captures ?? [];
  const preferred = captures.find((c) => c.label === "ENTRY")
    ?? captures.find((c) => c.label === "HTF")
    ?? captures[0];
  if (preferred) return preferred.storageId;
  return trade.screenshots?.[0];
}

function tradeToRow(t: Trade): WeeklyTradeRow {
  return {
    id: t._id,
    date: new Date(t.createdAt).toISOString().split("T")[0],
    instrument: t.instrument,
    direction: t.direction,
    session: t.session,
    sessionLabel: SESSION_LABELS[t.session] ?? t.session,
    pnl: t.pnl ?? 0,
    status: t.winLossStatus,
    quality: t.tradeQualityScore ?? null,
    finalRR: t.finalRR ?? null,
    thumbnailId: getTradeThumbnail(t),
  };
}

function mode(values: string[]): string {
  if (values.length === 0) return "";
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let best = "";
  let bestCount = 0;
  counts.forEach((count, key) => {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  });
  return best;
}

function bestWorstInstrument(trades: Trade[]): {
  bestInstrument?: string;
  worstInstrument?: string;
} {
  const byInst = new Map<string, number>();
  trades.forEach((t) => {
    byInst.set(t.instrument, (byInst.get(t.instrument) ?? 0) + (t.pnl || 0));
  });
  let bestInstrument: string | undefined;
  let worstInstrument: string | undefined;
  let bestPnl = -Infinity;
  let worstPnl = Infinity;
  byInst.forEach((pnl, inst) => {
    if (pnl > bestPnl) {
      bestPnl = pnl;
      bestInstrument = inst;
    }
    if (pnl < worstPnl) {
      worstPnl = pnl;
      worstInstrument = inst;
    }
  });
  return { bestInstrument, worstInstrument };
}

export function computeReviewStats(
  allTrades: Trade[] | undefined,
  start: string,
  end: string,
): ReviewStats {
  const trades = allTrades
    ? allTrades.filter((t) => {
        const key = new Date(t.createdAt).toISOString().split("T")[0];
        return key >= start && key <= end;
      })
    : [];

  const wins = trades.filter((t) => t.winLossStatus === "WIN");
  const losses = trades.filter((t) => t.winLossStatus === "LOSS");
  const be = trades.filter((t) => t.winLossStatus === "BREAK_EVEN");

  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const grossProfit = wins.reduce((s, t) => s + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0));
  const avgWin = wins.length ? grossProfit / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? grossProfit : 0;

  const biggestWin = wins.length ? Math.max(...wins.map((t) => t.pnl || 0)) : 0;
  const biggestLoss = losses.length ? Math.min(...losses.map((t) => t.pnl || 0)) : 0;

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
  const htfNarrativePercentage =
    booleanRate(trades, (t) => t.respectedHTFNarrative) ??
    booleanRate(trades, (t) => t.narrativeAlignment) ??
    0;
  const riskPlanPercentage = booleanRate(trades, (t) => t.managedRiskPerPlan) ?? 0;

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

  const scored = trades.filter((t) => (t.tradeQualityScore ?? 0) > 0);
  const avgQuality = scored.length
    ? scored.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / scored.length
    : 0;
  const avgPoiQualityScore = scored.length ? clampScore(avgQuality) : 5;
  const pristineCleanSetups = trades.filter(isPristine).length;
  const questionableSetups = trades.filter(isQuestionable).length;
  const lowQualityLosses = losses.filter(isQuestionable).length;
  const lossesOnLowQuality =
    losses.length > 0 && lowQualityLosses / losses.length >= 0.5;

  const againstHtf = trades.filter(
    (t) =>
      t.respectedHTFNarrative === false ||
      (t.respectedHTFNarrative === undefined && t.narrativeAlignment === false),
  );
  const withHtf = trades.filter((t) => !againstHtf.includes(t));
  const thoseLostMore =
    againstHtf.length > 0 && withHtf.length > 0 && avgPnl(againstHtf) < avgPnl(withHtf);

  const forced = trades.filter(
    (t) =>
      t.waitedForInducement === false ||
      (t.waitedForInducement === undefined && t.missingInducement === true),
  );
  const waited = trades.filter((t) => !forced.includes(t));
  const forcedTradesLostMore =
    forced.length > 0 && waited.length > 0 && avgPnl(forced) < avgPnl(waited);

  const premature = trades.filter((t) => t.waitedForInducement === false);
  const prematureEntryCost = premature.reduce((s, t) => s + (t.pnl || 0), 0);
  const mostCommonTrapType = mode(
    trades.map((t) => t.trapType).filter((v): v is string => !!v),
  );

  const narrativeAbilityScore = clampScore(
    (htfNarrativePercentage / 100) * 10 - (thoseLostMore ? 1 : 0),
  );
  const patienceScore = clampScore(
    (inducementRate / 100) * 10 - (forcedTradesLostMore ? 1 : 0),
  );

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

  const bestTrade = wins.length
    ? wins.reduce((best, t) => ((t.pnl || 0) > (best.pnl || 0) ? t : best))
    : undefined;
  const worstTrade = losses.length
    ? losses.reduce((worst, t) => ((t.pnl || 0) < (worst.pnl || 0) ? t : worst))
    : undefined;

  const rows = [...trades]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map(tradeToRow);

  const sessionMap = new Map<string, Trade[]>();
  trades.forEach((t) => {
    const list = sessionMap.get(t.session) ?? [];
    list.push(t);
    sessionMap.set(t.session, list);
  });

  const sessionBreakdown: SessionBreakdown[] = Array.from(sessionMap.entries())
    .map(([session, sessionTrades]) => {
      const sessionWins = sessionTrades.filter((t) => t.winLossStatus === "WIN").length;
      const sessionPnl = sessionTrades.reduce((s, t) => s + (t.pnl || 0), 0);
      const sessionWinsList = sessionTrades.filter((t) => t.winLossStatus === "WIN");
      const sessionLossList = sessionTrades.filter((t) => t.winLossStatus === "LOSS");
      const best = sessionWinsList.length
        ? sessionWinsList.reduce((a, b) => ((a.pnl || 0) > (b.pnl || 0) ? a : b))
        : undefined;
      const worst = sessionLossList.length
        ? sessionLossList.reduce((a, b) => ((a.pnl || 0) < (b.pnl || 0) ? a : b))
        : undefined;
      const { bestInstrument, worstInstrument } = bestWorstInstrument(sessionTrades);
      return {
        session,
        label: SESSION_LABELS[session] ?? session,
        trades: sessionTrades.length,
        pnl: sessionPnl,
        winRate: pct(sessionWins, sessionTrades.length),
        bestTrade: best ? tradeToRow(best) : undefined,
        worstTrade: worst ? tradeToRow(worst) : undefined,
        bestInstrument,
        worstInstrument,
      };
    })
    .sort((a, b) => b.trades - a.trades);

  return {
    weekStart: start,
    weekEnd: end,
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
    htfNarrativePercentage,
    riskPlanPercentage,
    avgPoiQualityScore,
    pristineCleanSetups,
    questionableSetups,
    lossesOnLowQuality,
    tradesAgainstHtf: againstHtf.length,
    thoseLostMore,
    forcedTrades: forced.length,
    waitedTrades: waited.length,
    forcedTradesLostMore,
    prematureEntries: premature.length,
    prematureEntryCost,
    mostCommonTrapType,
    narrativeAbilityScore,
    patienceScore,
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

export function computeWeekReviewStats(
  allTrades: Trade[] | undefined,
  weekStart: string,
): ReviewStats {
  return computeReviewStats(allTrades, weekStart, getWeekEnd(weekStart));
}

export function computeDayReviewStats(
  allTrades: Trade[] | undefined,
  date: string,
): ReviewStats {
  return computeReviewStats(allTrades, date, date);
}

export function computeSessionReviewStats(
  allTrades: Trade[] | undefined,
  session: Trade["session"],
  start: string,
  end: string,
): ReviewStats {
  const rangeStats = computeReviewStats(allTrades, start, end);
  const sessionBreakdown = rangeStats.sessionBreakdown.find((s) => s.session === session);
  const sessionTrades = (allTrades ?? []).filter((t) => {
    const key = new Date(t.createdAt).toISOString().split("T")[0];
    return key >= start && key <= end && t.session === session;
  });
  return {
    ...rangeStats,
    hasTrades: sessionTrades.length > 0,
    rows: sessionTrades.map(tradeToRow),
    sessionBreakdown: sessionBreakdown ? [sessionBreakdown] : [],
    totalTrades: sessionTrades.length,
    winningTrades: sessionTrades.filter((t) => t.winLossStatus === "WIN").length,
    losingTrades: sessionTrades.filter((t) => t.winLossStatus === "LOSS").length,
    breakEvenTrades: sessionTrades.filter((t) => t.winLossStatus === "BREAK_EVEN").length,
    winRate: pct(
      sessionTrades.filter((t) => t.winLossStatus === "WIN").length,
      sessionTrades.length,
    ),
    totalPnl: sessionTrades.reduce((s, t) => s + (t.pnl || 0), 0),
  };
}

export type DayReviewDerived = {
  tradesTaken: number;
  tradesWorked: number;
  tradesFailed: number;
  /** Computed from trade compliance; null when there are no trades to derive from. */
  overallDiscipline: number | null;
};

export function deriveDayReviewFields(stats: ReviewStats): DayReviewDerived {
  const tradesTaken = stats.totalTrades;
  const tradesWorked = stats.winningTrades;
  const tradesFailed = stats.losingTrades;
  if (stats.totalTrades === 0) {
    return { tradesTaken, tradesWorked, tradesFailed, overallDiscipline: null };
  }
  const complianceAvg =
    (stats.inducementPercentage +
      stats.ltcPercentage +
      stats.killzonePercentage +
      stats.htfNarrativePercentage +
      stats.riskPlanPercentage) /
    5;
  const overallDiscipline = clampScore(complianceAvg / 10);
  return { tradesTaken, tradesWorked, tradesFailed, overallDiscipline };
}

/** @deprecated Use computeWeekReviewStats */
export const computeWeeklyReviewStats = computeWeekReviewStats;
export type WeeklyReviewStats = ReviewStats;
