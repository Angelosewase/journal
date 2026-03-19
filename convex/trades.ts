import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("trades").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("trades") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    instrument: v.string(),
    direction: v.union(v.literal("LONG"), v.literal("SHORT")),
    entryPrice: v.number(),
    exitPrice: v.optional(v.number()),
    currentPrice: v.optional(v.number()),
    positionSize: v.number(),
    commission: v.number(),
    environment: v.union(v.literal("BACKTESTING"), v.literal("DEMO"), v.literal("LIVE")),
    dailyBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    externalStructure: v.string(),
    majorLiquidityPools: v.string(),
    internalStructure: v.string(),
    currentRange: v.string(),
    minorPushStatus: v.string(),
    session: v.union(v.literal("ASIA"), v.literal("LONDON"), v.literal("NEW_YORK"), v.literal("OTHER")),
    isInKillzone: v.boolean(),
    poiType: v.union(v.literal("EXTREME"), v.literal("DECISIONAL")),
    poiQuality: v.array(v.string()),
    poiDescription: v.optional(v.string()),
    gapSize: v.optional(v.number()),
    inducementResting: v.optional(v.string()),
    inducementType: v.optional(v.string()),
    distanceFromPoi: v.optional(v.number()),
    liquidityPoolDescription: v.optional(v.string()),
    cleanBreak: v.optional(v.boolean()),
    breakSize: v.optional(v.number()),
    trapSwept: v.union(v.literal("YES"), v.literal("NO"), v.literal("PARTIAL")),
    trapType: v.optional(v.string()),
    trapLocation: v.optional(v.number()),
    trapTappedCount: v.optional(v.number()),
    trapCleanliness: v.optional(v.string()),
    liquidityEngineering: v.optional(v.string()),
    liquidityTappedCount: v.optional(v.number()),
    retailBehavior: v.optional(v.string()),
    missingInducement: v.boolean(),
    ltfEntryTimeframe: v.optional(v.string()),
    smcType: v.optional(v.string()),
    smsAfterTrap: v.boolean(),
    bmsPattern: v.optional(v.string()),
    bmsConfidence: v.optional(v.number()),
    rtoApplicable: v.boolean(),
    rtoDistance: v.optional(v.number()),
    entryConfidence: v.optional(v.number()),
    tradeModel: v.union(v.literal("CONTINUATION"), v.literal("REVERSAL")),
    narrativeAlignment: v.boolean(),
    tradingWithMainPush: v.boolean(),
    noNarrativeMisalignment: v.boolean(),
    clearLiquidityEngineering: v.optional(v.string()),
    institutionsReasoned: v.optional(v.boolean()),
    poiMitigationStatus: v.union(v.literal("UNMITIGATED"), v.literal("MITIGATED_ONCE"), v.literal("WEAKENED")),
    approachDynamics: v.optional(v.string()),
    stopLossPrice: v.number(),
    stopLossPlacement: v.string(),
    stopLossPips: v.number(),
    stopLossQuality: v.string(),
    riskAmount: v.number(),
    riskPercentage: v.number(),
    target1RR: v.number(),
    target2RR: v.number(),
    target1Price: v.optional(v.number()),
    target2Price: v.optional(v.number()),
    timeInTradeMinutes: v.optional(v.number()),
    maxProfitReached: v.optional(v.number()),
    maxDrawdown: v.optional(v.number()),
    target1Hit: v.optional(v.boolean()),
    target1HitPrice: v.optional(v.number()),
    stopMovedToBE: v.optional(v.boolean()),
    timeToTarget1: v.optional(v.number()),
    target2Status: v.optional(v.string()),
    target2ClosedAt: v.optional(v.number()),
    finalRR: v.optional(v.number()),
    timeToClose: v.optional(v.number()),
    breakEvenStopsMoved: v.optional(v.boolean()),
    manualExit: v.optional(v.boolean()),
    manualExitReason: v.optional(v.string()),
    manualExitAligned: v.optional(v.boolean()),
    tradeClosureReason: v.string(),
    pnl: v.optional(v.number()),
    pnlPercentage: v.optional(v.number()),
    winLossStatus: v.union(v.literal("WIN"), v.literal("LOSS"), v.literal("BREAK_EVEN")),
    tradeQualityScore: v.optional(v.number()),
    poiQualityRating: v.optional(v.string()),
    inducementQualityRating: v.optional(v.string()),
    trinityAlignmentRating: v.optional(v.string()),
    riskExecutionRating: v.optional(v.string()),
    disciplineRating: v.optional(v.string()),
    whyEntered: v.optional(v.string()),
    playedAsExpected: v.optional(v.boolean()),
    expansionDescription: v.optional(v.string()),
    surpriseDescription: v.optional(v.string()),
    whatWentWrong: v.optional(v.string()),
    whatWentRight: v.optional(v.string()),
    institutionalLessons: v.optional(v.string()),
    howAffectsNext: v.optional(v.string()),
    followedTrinity: v.optional(v.boolean()),
    trinityViolationExplanation: v.optional(v.string()),
    correctKillzone: v.optional(v.boolean()),
    respectedHTFNarrative: v.optional(v.boolean()),
    waitedForInducement: v.optional(v.boolean()),
    managedRiskPerPlan: v.optional(v.boolean()),
    disciplineScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("trades", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { id: v.id("trades"), updates: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("trades") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getByDateRange = query({
  args: { startDate: v.number(), endDate: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trades")
      .filter((q) => q.and(
        q.gte(q.field("createdAt"), args.startDate),
        q.lte(q.field("createdAt"), args.endDate)
      ))
      .collect();
  },
});

export const getByFilters = query({
  args: {
    environment: v.optional(v.string()),
    instrument: v.optional(v.string()),
    session: v.optional(v.string()),
    tradeModel: v.optional(v.string()),
    winLossStatus: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let trades = await ctx.db.query("trades").collect();
    
    if (args.environment) {
      trades = trades.filter(t => t.environment === args.environment);
    }
    if (args.instrument) {
      trades = trades.filter(t => t.instrument === args.instrument);
    }
    if (args.session) {
      trades = trades.filter(t => t.session === args.session);
    }
    if (args.tradeModel) {
      trades = trades.filter(t => t.tradeModel === args.tradeModel);
    }
    if (args.winLossStatus) {
      trades = trades.filter(t => t.winLossStatus === args.winLossStatus);
    }
    if (args.startDate) {
      trades = trades.filter(t => t.createdAt >= args.startDate!);
    }
    if (args.endDate) {
      trades = trades.filter(t => t.createdAt <= args.endDate!);
    }
    
    return trades.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getStatistics = query({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => t.winLossStatus === "WIN");
    const losingTrades = trades.filter(t => t.winLossStatus === "LOSS");
    const breakEvenTrades = trades.filter(t => t.winLossStatus === "BREAK_EVEN");
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length) 
      : 0;
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    const avgQuality = trades.length > 0 
      ? trades.reduce((sum, t) => sum + (t.tradeQualityScore || 0), 0) / trades.length 
      : 0;
    
    const avgTrinityScore = trades.length > 0 
      ? trades.filter(t => t.tradeQualityScore).reduce((sum, t) => {
          const score = (t.followedTrinity ? 3 : 0) + (t.correctKillzone ? 3 : 0) + ((t.entryConfidence || 5) / 3.33);
          return sum + score;
        }, 0) / trades.length 
      : 0;
    
    const avgDisciplineScore = trades.length > 0 
      ? trades.reduce((sum, t) => sum + (t.disciplineScore || 5), 0) / trades.length 
      : 0;
    
    const continuationTrades = trades.filter(t => t.tradeModel === "CONTINUATION");
    const reversalTrades = trades.filter(t => t.tradeModel === "REVERSAL");
    
    const bySession: Record<string, { count: number; wins: number; pnl: number; quality: number }> = {};
    const byInstrument: Record<string, { count: number; wins: number; pnl: number }> = {};
    
    trades.forEach(t => {
      if (!bySession[t.session]) {
        bySession[t.session] = { count: 0, wins: 0, pnl: 0, quality: 0 };
      }
      bySession[t.session].count++;
      bySession[t.session].wins += t.winLossStatus === "WIN" ? 1 : 0;
      bySession[t.session].pnl += t.pnl || 0;
      bySession[t.session].quality += t.tradeQualityScore || 0;
      
      if (!byInstrument[t.instrument]) {
        byInstrument[t.instrument] = { count: 0, wins: 0, pnl: 0 };
      }
      byInstrument[t.instrument].count++;
      byInstrument[t.instrument].wins += t.winLossStatus === "WIN" ? 1 : 0;
      byInstrument[t.instrument].pnl += t.pnl || 0;
    });
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      winRate: Math.round(winRate * 10) / 10,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgTrinityScore: Math.round(avgTrinityScore * 10) / 10,
      avgDisciplineScore: Math.round(avgDisciplineScore * 10) / 10,
      continuationModel: {
        total: continuationTrades.length,
        winRate: continuationTrades.length > 0 
          ? Math.round((continuationTrades.filter(t => t.winLossStatus === "WIN").length / continuationTrades.length) * 1000) / 10 
          : 0,
        avgQuality: continuationTrades.length > 0 
          ? Math.round(continuationTrades.reduce((sum, t) => sum + (t.tradeQualityScore || 0), 0) / continuationTrades.length * 10) / 10 
          : 0,
      },
      reversalModel: {
        total: reversalTrades.length,
        winRate: reversalTrades.length > 0 
          ? Math.round((reversalTrades.filter(t => t.winLossStatus === "WIN").length / reversalTrades.length) * 1000) / 10 
          : 0,
        avgQuality: reversalTrades.length > 0 
          ? Math.round(reversalTrades.reduce((sum, t) => sum + (t.tradeQualityScore || 0), 0) / reversalTrades.length * 10) / 10 
          : 0,
      },
      bySession: Object.entries(bySession).map(([session, data]) => ({
        session,
        count: data.count,
        winRate: data.count > 0 ? Math.round((data.wins / data.count) * 1000) / 10 : 0,
        avgQuality: data.count > 0 ? Math.round((data.quality / data.count) * 10) / 10 : 0,
        totalPnl: Math.round(data.pnl * 100) / 100,
      })),
      byInstrument: Object.entries(byInstrument).map(([instrument, data]) => ({
        instrument,
        count: data.count,
        winRate: data.count > 0 ? Math.round((data.wins / data.count) * 1000) / 10 : 0,
        totalPnl: Math.round(data.pnl * 100) / 100,
      })),
    };
  },
});

export const getAllData = query({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    const dailyBiases = await ctx.db.query("dailyBias").collect();
    const weeklyReviews = await ctx.db.query("weeklyReviews").collect();
    
    return { trades, dailyBiases, weeklyReviews };
  },
});
