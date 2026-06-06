import type { Doc } from "@/convex/_generated/dataModel";

export type Trade = Doc<"trades">;

export type TradeFilters = {
  environment: string;
  instrument: string;
  session: string;
  tradeModel: string;
  startDate: string;
  endDate: string;
};

export type GroupStats = {
  key: string;
  label: string;
  count: number;
  wins: number;
  losses: number;
  pnl: number;
  winRate: number;
  avgQuality: number;
  avgPnl: number;
};

export type ComplianceMetric = {
  label: string;
  rate: number;
  followed: number;
  total: number;
  winRateWhenFollowed: number;
  winRateWhenNot: number;
};

export type Insight = {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
};

export type TradeStatistics = {
  total: number;
  wins: number;
  losses: number;
  be: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  biggestWin: number;
  biggestLoss: number;
  avgQuality: number;
  avgTrinity: number;
  avgDiscipline: number;
  avgFinalRR: number;
  avgRiskPct: number;
  avgTimeInTrade: number;
  target1HitRate: number;
  beStopRate: number;
  currentWinStreak: number;
  currentLossStreak: number;
  maxWinStreak: number;
  maxLossStreak: number;
  cont: { total: number; winRate: number; quality: number; pnl: number };
  rev: { total: number; winRate: number; quality: number; pnl: number };
  bySession: GroupStats[];
  byInstrument: GroupStats[];
  byDirection: GroupStats[];
  byEnvironment: GroupStats[];
  byPoiType: GroupStats[];
  byDayOfWeek: GroupStats[];
  compliance: ComplianceMetric[];
  equityCurve: { date: number; pnl: number; cumulative: number; tradeCount: number }[];
  dailyPnl: { date: string; pnl: number; trades: number }[];
  weeklyPnl: { week: string; pnl: number; trades: number; winRate: number }[];
  qualityBuckets: { label: string; count: number; winRate: number; pnl: number }[];
  insights: Insight[];
  bestSession: GroupStats | null;
  worstSession: GroupStats | null;
  bestInstrument: GroupStats | null;
  worstInstrument: GroupStats | null;
};

function groupBy<T extends Trade>(
  trades: T[],
  keyFn: (t: T) => string,
  labelFn?: (key: string) => string,
): GroupStats[] {
  const map: Record<string, { count: number; wins: number; losses: number; pnl: number; quality: number }> = {};

  trades.forEach((t) => {
    const key = keyFn(t);
    if (!map[key]) map[key] = { count: 0, wins: 0, losses: 0, pnl: 0, quality: 0 };
    map[key].count++;
    if (t.winLossStatus === "WIN") map[key].wins++;
    if (t.winLossStatus === "LOSS") map[key].losses++;
    map[key].pnl += t.pnl || 0;
    map[key].quality += t.tradeQualityScore || 0;
  });

  return Object.entries(map)
    .map(([key, d]) => ({
      key,
      label: labelFn ? labelFn(key) : key,
      count: d.count,
      wins: d.wins,
      losses: d.losses,
      pnl: d.pnl,
      winRate: d.count > 0 ? (d.wins / d.count) * 100 : 0,
      avgQuality: d.count > 0 ? d.quality / d.count : 0,
      avgPnl: d.count > 0 ? d.pnl / d.count : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function computeStreaks(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) => a.createdAt - b.createdAt);
  let maxWin = 0;
  let maxLoss = 0;
  let currentWin = 0;
  let currentLoss = 0;
  let streakWin = 0;
  let streakLoss = 0;

  sorted.forEach((t) => {
    if (t.winLossStatus === "WIN") {
      streakWin++;
      streakLoss = 0;
      maxWin = Math.max(maxWin, streakWin);
    } else if (t.winLossStatus === "LOSS") {
      streakLoss++;
      streakWin = 0;
      maxLoss = Math.max(maxLoss, streakLoss);
    } else {
      streakWin = 0;
      streakLoss = 0;
    }
  });

  const last = sorted[sorted.length - 1];
  if (last?.winLossStatus === "WIN") {
    currentWin = streakWin;
  } else if (last?.winLossStatus === "LOSS") {
    currentLoss = streakLoss;
  }

  return { currentWinStreak: currentWin, currentLossStreak: currentLoss, maxWinStreak: maxWin, maxLossStreak: maxLoss };
}

function complianceRate(
  trades: Trade[],
  label: string,
  check: (t: Trade) => boolean | undefined,
): ComplianceMetric {
  const withValue = trades.filter((t) => check(t) !== undefined);
  const followed = withValue.filter((t) => check(t) === true);
  const notFollowed = withValue.filter((t) => check(t) === false);
  const followedWins = followed.filter((t) => t.winLossStatus === "WIN").length;
  const notFollowedWins = notFollowed.filter((t) => t.winLossStatus === "WIN").length;

  return {
    label,
    rate: withValue.length > 0 ? (followed.length / withValue.length) * 100 : 0,
    followed: followed.length,
    total: withValue.length,
    winRateWhenFollowed: followed.length > 0 ? (followedWins / followed.length) * 100 : 0,
    winRateWhenNot: notFollowed.length > 0 ? (notFollowedWins / notFollowed.length) * 100 : 0,
  };
}

function generateInsights(stats: Omit<TradeStatistics, "insights">): Insight[] {
  const insights: Insight[] = [];

  if (stats.total >= 5) {
    if (stats.profitFactor >= 1.5) {
      insights.push({
        type: "positive",
        title: "Strong profit factor",
        description: `Your profit factor of ${stats.profitFactor.toFixed(2)} shows winners significantly outweigh losers.`,
      });
    } else if (stats.profitFactor < 1) {
      insights.push({
        type: "negative",
        title: "Profit factor below 1",
        description: `At ${stats.profitFactor.toFixed(2)}, average losses exceed average wins. Focus on cutting losers or improving R:R.`,
      });
    }

    if (stats.bestSession && stats.worstSession && stats.bestSession.key !== stats.worstSession.key) {
      insights.push({
        type: stats.bestSession.pnl >= 0 ? "positive" : "neutral",
        title: `${stats.bestSession.label} is your strongest session`,
        description: `${stats.bestSession.winRate.toFixed(0)}% win rate and ${stats.bestSession.pnl >= 0 ? "+" : ""}$${stats.bestSession.pnl.toFixed(2)} P&L vs ${stats.worstSession.label} at ${stats.worstSession.winRate.toFixed(0)}%.`,
      });
    }

    const trinity = stats.compliance.find((c) => c.label === "Trinity");
    if (trinity && trinity.total >= 3 && trinity.winRateWhenFollowed - trinity.winRateWhenNot >= 15) {
      insights.push({
        type: "positive",
        title: "Trinity alignment pays off",
        description: `Win rate jumps from ${trinity.winRateWhenNot.toFixed(0)}% to ${trinity.winRateWhenFollowed.toFixed(0)}% when you follow the Trinity framework.`,
      });
    }

    const highQ = stats.qualityBuckets.find((b) => b.label === "8–10");
    const lowQ = stats.qualityBuckets.find((b) => b.label === "1–4");
    if (highQ && lowQ && highQ.count >= 2 && lowQ.count >= 2 && highQ.winRate - lowQ.winRate >= 20) {
      insights.push({
        type: "neutral",
        title: "Quality score predicts outcomes",
        description: `High-quality setups (8–10) win ${highQ.winRate.toFixed(0)}% vs ${lowQ.winRate.toFixed(0)}% for low-quality (1–4). Skip marginal setups.`,
      });
    }

    if (stats.cont.total >= 3 && stats.rev.total >= 3) {
      const better = stats.cont.winRate >= stats.rev.winRate ? "Continuation" : "Reversal";
      const betterRate = Math.max(stats.cont.winRate, stats.rev.winRate);
      const worseRate = Math.min(stats.cont.winRate, stats.rev.winRate);
      if (betterRate - worseRate >= 15) {
        insights.push({
          type: "neutral",
          title: `${better} model outperforms`,
          description: `${better} trades win ${betterRate.toFixed(0)}% vs ${worseRate.toFixed(0)}% for the other model.`,
        });
      }
    }

    if (stats.currentLossStreak >= 3) {
      insights.push({
        type: "negative",
        title: `${stats.currentLossStreak}-trade losing streak active`,
        description: "Consider reducing size or stepping back to review recent trades before continuing.",
      });
    } else if (stats.currentWinStreak >= 3) {
      insights.push({
        type: "positive",
        title: `${stats.currentWinStreak}-trade winning streak`,
        description: "Stay disciplined — don't increase risk just because you're on a hot streak.",
      });
    }
    if (stats.avgFinalRR >= 2) {
      insights.push({
        type: "positive",
        title: "Strong average R:R",
        description: `Your average final R:R of ${stats.avgFinalRR.toFixed(2)} means winners are capturing meaningful reward relative to risk.`,
      });
    }

    if (stats.target1HitRate >= 50 && stats.total >= 5) {
      insights.push({
        type: "positive",
        title: "Target 1 hit rate is solid",
        description: `T1 is hit on ${stats.target1HitRate.toFixed(0)}% of trades — your targets are realistic.`,
      });
    }

    const killzone = stats.compliance.find((c) => c.label === "Killzone");
    if (killzone && killzone.total >= 3 && killzone.winRateWhenFollowed - killzone.winRateWhenNot >= 10) {
      insights.push({
        type: "neutral",
        title: "Killzone timing matters",
        description: `Win rate is ${killzone.winRateWhenFollowed.toFixed(0)}% in killzone vs ${killzone.winRateWhenNot.toFixed(0)}% outside.`,
      });
    }

    if (stats.bestInstrument && stats.worstInstrument && stats.bestInstrument.key !== stats.worstInstrument.key) {
      insights.push({
        type: stats.bestInstrument.pnl >= 0 ? "positive" : "neutral",
        title: `${stats.bestInstrument.label} leads your P&L`,
        description: `${stats.bestInstrument.label}: ${stats.bestInstrument.pnl >= 0 ? "+" : ""}$${stats.bestInstrument.pnl.toFixed(2)} vs ${stats.worstInstrument.label}: $${stats.worstInstrument.pnl.toFixed(2)}.`,
      });
    }
  }

  return insights.slice(0, 8);
}

export function filterTrades(trades: Trade[], filters: TradeFilters): Trade[] {
  return trades.filter((t) => {
    if (filters.environment && t.environment !== filters.environment) return false;
    if (filters.instrument && t.instrument !== filters.instrument) return false;
    if (filters.session && t.session !== filters.session) return false;
    if (filters.tradeModel && t.tradeModel !== filters.tradeModel) return false;
    if (filters.startDate && new Date(t.createdAt) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(t.createdAt) > new Date(filters.endDate + "T23:59:59")) return false;
    return true;
  });
}

export function computeTradeStatistics(trades: Trade[]): TradeStatistics {
  const total = trades.length;
  const wins = trades.filter((t) => t.winLossStatus === "WIN");
  const losses = trades.filter((t) => t.winLossStatus === "LOSS");
  const be = trades.filter((t) => t.winLossStatus === "BREAK_EVEN");

  const winRate = total > 0 ? (wins.length / total) * 100 : 0;
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl || 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl || 0), 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : wins.length > 0 ? Infinity : 0;
  const lossRate = total > 0 ? losses.length / total : 0;
  const winRateDecimal = total > 0 ? wins.length / total : 0;
  const expectancy = winRateDecimal * avgWin - lossRate * avgLoss;

  const pnls = trades.map((t) => t.pnl || 0);
  const biggestWin = pnls.length > 0 ? Math.max(...pnls, 0) : 0;
  const biggestLoss = pnls.length > 0 ? Math.min(...pnls, 0) : 0;

  const avgQuality = total > 0 ? trades.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / total : 0;
  const scoredTrades = trades.filter((t) => t.tradeQualityScore);
  const avgTrinity =
    scoredTrades.length > 0
      ? scoredTrades.reduce((s, t) => {
          return s + ((t.followedTrinity ? 3 : 0) + (t.correctKillzone ? 3 : 0) + ((t.entryConfidence || 5) / 3.33));
        }, 0) / scoredTrades.length
      : 0;
  const avgDiscipline = total > 0 ? trades.reduce((s, t) => s + (t.disciplineScore || 5), 0) / total : 0;

  const rrTrades = trades.filter((t) => t.finalRR !== undefined);
  const avgFinalRR = rrTrades.length > 0 ? rrTrades.reduce((s, t) => s + (t.finalRR || 0), 0) / rrTrades.length : 0;
  const avgRiskPct = total > 0 ? trades.reduce((s, t) => s + (t.riskPercentage || 0), 0) / total : 0;

  const timeTrades = trades.filter((t) => t.timeInTradeMinutes);
  const avgTimeInTrade =
    timeTrades.length > 0 ? timeTrades.reduce((s, t) => s + (t.timeInTradeMinutes || 0), 0) / timeTrades.length : 0;

  const targetTrades = trades.filter((t) => t.target1Hit !== undefined);
  const target1HitRate =
    targetTrades.length > 0 ? (targetTrades.filter((t) => t.target1Hit).length / targetTrades.length) * 100 : 0;

  const beTrades = trades.filter((t) => t.stopMovedToBE !== undefined);
  const beStopRate = beTrades.length > 0 ? (beTrades.filter((t) => t.stopMovedToBE).length / beTrades.length) * 100 : 0;

  const streaks = computeStreaks(trades);

  const cont = trades.filter((t) => t.tradeModel === "CONTINUATION");
  const rev = trades.filter((t) => t.tradeModel === "REVERSAL");

  const modelStats = (arr: Trade[]) => ({
    total: arr.length,
    winRate: arr.length > 0 ? (arr.filter((t) => t.winLossStatus === "WIN").length / arr.length) * 100 : 0,
    quality: arr.length > 0 ? arr.reduce((s, t) => s + (t.tradeQualityScore || 0), 0) / arr.length : 0,
    pnl: arr.reduce((s, t) => s + (t.pnl || 0), 0),
  });

  const bySession = groupBy(trades, (t) => t.session);
  const byInstrument = groupBy(trades, (t) => t.instrument);
  const byDirection = groupBy(trades, (t) => t.direction);
  const byEnvironment = groupBy(trades, (t) => t.environment);
  const byPoiType = groupBy(trades, (t) => t.poiType);
  const byDayOfWeek = groupBy(
    trades,
    (t) => String(new Date(t.createdAt).getDay()),
    (key) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[Number(key)] ?? key;
  });

  const compliance = [
    complianceRate(trades, "Trinity", (t) => t.followedTrinity),
    complianceRate(trades, "Killzone", (t) => t.correctKillzone),
    complianceRate(trades, "Inducement", (t) => t.waitedForInducement),
    complianceRate(trades, "HTF Narrative", (t) => t.respectedHTFNarrative),
    complianceRate(trades, "Risk Plan", (t) => t.managedRiskPerPlan),
  ];

  const sorted = [...trades].sort((a, b) => a.createdAt - b.createdAt);
  let cumulative = 0;
  const equityCurve = sorted.map((t) => {
    cumulative += t.pnl || 0;
    return { date: t.createdAt, pnl: t.pnl || 0, cumulative, tradeCount: 1 };
  });

  const dailyMap: Record<string, { pnl: number; trades: number }> = {};
  sorted.forEach((t) => {
    const date = new Date(t.createdAt).toISOString().split("T")[0];
    if (!dailyMap[date]) dailyMap[date] = { pnl: 0, trades: 0 };
    dailyMap[date].pnl += t.pnl || 0;
    dailyMap[date].trades++;
  });
  const dailyPnl = Object.entries(dailyMap)
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeklyMap: Record<string, { pnl: number; trades: number; wins: number }> = {};
  sorted.forEach((t) => {
    const d = new Date(t.createdAt);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const week = monday.toISOString().split("T")[0];
    if (!weeklyMap[week]) weeklyMap[week] = { pnl: 0, trades: 0, wins: 0 };
    weeklyMap[week].pnl += t.pnl || 0;
    weeklyMap[week].trades++;
    if (t.winLossStatus === "WIN") weeklyMap[week].wins++;
  });
  const weeklyPnl = Object.entries(weeklyMap)
    .map(([week, d]) => ({
      week,
      pnl: d.pnl,
      trades: d.trades,
      winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const qualityBuckets = [
    { label: "1–4", min: 1, max: 4 },
    { label: "5–7", min: 5, max: 7 },
    { label: "8–10", min: 8, max: 10 },
  ].map(({ label, min, max }) => {
    const bucket = trades.filter((t) => {
      const q = t.tradeQualityScore;
      return q !== undefined && q >= min && q <= max;
    });
    const bucketWins = bucket.filter((t) => t.winLossStatus === "WIN").length;
    return {
      label,
      count: bucket.length,
      winRate: bucket.length > 0 ? (bucketWins / bucket.length) * 100 : 0,
      pnl: bucket.reduce((s, t) => s + (t.pnl || 0), 0),
    };
  });

  const sessionsWithData = bySession.filter((s) => s.count >= 2);
  const instrumentsWithData = byInstrument.filter((s) => s.count >= 2);

  const partial: Omit<TradeStatistics, "insights"> = {
    total,
    wins: wins.length,
    losses: losses.length,
    be: be.length,
    winRate,
    totalPnl,
    avgWin,
    avgLoss,
    profitFactor: profitFactor === Infinity ? 999 : profitFactor,
    expectancy,
    biggestWin,
    biggestLoss,
    avgQuality,
    avgTrinity,
    avgDiscipline,
    avgFinalRR,
    avgRiskPct,
    avgTimeInTrade,
    target1HitRate,
    beStopRate,
    ...streaks,
    cont: modelStats(cont),
    rev: modelStats(rev),
    bySession,
    byInstrument,
    byDirection,
    byEnvironment,
    byPoiType,
    byDayOfWeek,
    compliance,
    equityCurve,
    dailyPnl,
    weeklyPnl,
    qualityBuckets,
    bestSession: sessionsWithData.length > 0 ? [...sessionsWithData].sort((a, b) => b.pnl - a.pnl)[0] : null,
    worstSession: sessionsWithData.length > 0 ? [...sessionsWithData].sort((a, b) => a.pnl - b.pnl)[0] : null,
    bestInstrument: instrumentsWithData.length > 0 ? [...instrumentsWithData].sort((a, b) => b.pnl - a.pnl)[0] : null,
    worstInstrument: instrumentsWithData.length > 0 ? [...instrumentsWithData].sort((a, b) => a.pnl - b.pnl)[0] : null,
  };

  return { ...partial, insights: generateInsights(partial) };
}

export const EMPTY_FILTERS: TradeFilters = {
  environment: "",
  instrument: "",
  session: "",
  tradeModel: "",
  startDate: "",
  endDate: "",
};

export function activeFilterCount(filters: TradeFilters): number {
  return Object.values(filters).filter(Boolean).length;
}

export function getPeriodStart(period: "7d" | "30d" | "90d" | "all"): string {
  if (period === "all") return "";
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
