import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeklyReviews").order("desc").collect();
  },
});

export const getByWeekStart = query({
  args: { weekStart: v.string() },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("weeklyReviews")
      .filter((q) => q.eq(q.field("weekStart"), args.weekStart))
      .collect();
    return reviews[0] || null;
  },
});

export const create = mutation({
  args: {
    weekStart: v.string(),
    weekEnd: v.string(),
    totalTrades: v.number(),
    winningTrades: v.number(),
    losingTrades: v.number(),
    totalPnl: v.number(),
    biggestWin: v.number(),
    biggestLoss: v.number(),
    avgWin: v.number(),
    avgLoss: v.number(),
    profitFactor: v.number(),
    inducementPercentage: v.number(),
    ltcPercentage: v.number(),
    killzonePercentage: v.number(),
    avgTrinityScore: v.number(),
    tradesAgainstHtf: v.number(),
    thoseLostMore: v.boolean(),
    narrativeAbilityScore: v.number(),
    avgPoiQualityScore: v.number(),
    pristineCleanSetups: v.number(),
    questionableSetups: v.number(),
    lossesOnLowQuality: v.boolean(),
    inducementRecognitionScore: v.number(),
    prematureEntries: v.number(),
    prematureEntryCost: v.number(),
    improvePatienceNote: v.optional(v.string()),
    forcedTrades: v.number(),
    waitedTrades: v.number(),
    forcedTradesLostMore: v.boolean(),
    patienceScore: v.number(),
    skippedObviousSetups: v.boolean(),
    skippedSetupsReason: v.optional(v.string()),
    asiaRangeClarity: v.optional(v.string()),
    asiaBestInstruments: v.optional(v.string()),
    asiaWorstInstruments: v.optional(v.string()),
    londonTrapsObvious: v.optional(v.boolean()),
    londonBestTrade: v.optional(v.string()),
    londonWorstTrade: v.optional(v.string()),
    nyContinuationPattern: v.optional(v.string()),
    nyBestTrade: v.optional(v.string()),
    nyWorstTrade: v.optional(v.string()),
    mostCommonTrapType: v.optional(v.string()),
    institutionsObvious: v.optional(v.boolean()),
    unusualPatterns: v.optional(v.string()),
    patternsObservation: v.optional(v.string()),
    bestTradeDescription: v.optional(v.string()),
    whyBestWorked: v.optional(v.string()),
    patternToLookFor: v.optional(v.string()),
    patternConfidence: v.optional(v.number()),
    worstTradeDescription: v.optional(v.string()),
    whyWorstFailed: v.optional(v.string()),
    howToAvoidNextWeek: v.optional(v.string()),
    biggestLessonMarket: v.optional(v.string()),
    biggestLessonSelf: v.optional(v.string()),
    adjustmentNextWeek: v.optional(v.string()),
    poiIdentificationScore: v.number(),
    inducementRecognitionScore2: v.number(),
    entryExecutionScore: v.number(),
    riskManagementScore: v.number(),
    overallSetupQualityScore: v.number(),
    topPriorityImprovement: v.string(),
    specificActionToImprove: v.string(),
    successMetric: v.string(),
    secondPriority: v.optional(v.string()),
    secondSpecificAction: v.optional(v.string()),
    secondSuccessMetric: v.optional(v.string()),
    setupsToAvoid: v.optional(v.string()),
    confidenceNextWeek: v.number(),
    howFeeling: v.optional(v.string()),
    emotionsAffectedTrading: v.optional(v.boolean()),
    emotionManagementPlan: v.optional(v.string()),
    readinessScore: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("weeklyReviews", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { id: v.id("weeklyReviews"), updates: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("weeklyReviews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
