import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dailyBias").order("desc").collect();
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const biases = await ctx.db
      .query("dailyBias")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();
    return biases[0] || null;
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    currentDailyBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    biasConfidence: v.number(),
    biasReason: v.string(),
    asiaHigh: v.optional(v.number()),
    asiaLow: v.optional(v.number()),
    previousDayHigh: v.optional(v.number()),
    previousDayLow: v.optional(v.number()),
    htfPoiTargeted: v.optional(v.string()),
    asiaExpectedBehavior: v.optional(v.string()),
    asiaLiquidityToWatch: v.optional(v.string()),
    asiaSetupTypes: v.optional(v.string()),
    londonExpectedBehavior: v.optional(v.string()),
    londonBreakoutExpectation: v.optional(v.string()),
    londonKeyLiquidity: v.optional(v.string()),
    nyExpectedBehavior: v.optional(v.string()),
    nyTargets: v.optional(v.string()),
    nyKeyLiquidity: v.optional(v.string()),
    bestInstrument: v.optional(v.string()),
    bestInstrumentReason: v.optional(v.string()),
    secondChoice: v.optional(v.string()),
    secondChoiceReason: v.optional(v.string()),
    avoidInstrument: v.optional(v.string()),
    avoidReason: v.optional(v.string()),
    sessionToTrade: v.union(v.literal("ASIA"), v.literal("LONDON"), v.literal("NY"), v.literal("MULTIPLE")),
    supportLevels: v.optional(v.string()),
    resistanceLevels: v.optional(v.string()),
    equalHighsLows: v.optional(v.string()),
    trendlines: v.optional(v.string()),
    modelToFocus: v.union(v.literal("CONTINUATION"), v.literal("REVERSAL"), v.literal("BOTH")),
    minimumPoiQuality: v.union(v.literal("PRISTINE"), v.literal("CLEAN"), v.literal("ACCEPTABLE")),
    willTradeWithoutInducement: v.boolean(),
    targetTrades: v.optional(v.number()),
    maxDailyLoss: v.optional(v.number()),
    confidenceForToday: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("dailyBias", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyBias"),
    date: v.optional(v.string()),
    currentDailyBias: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    biasConfidence: v.optional(v.number()),
    biasReason: v.optional(v.string()),
    asiaHigh: v.optional(v.number()),
    asiaLow: v.optional(v.number()),
    previousDayHigh: v.optional(v.number()),
    previousDayLow: v.optional(v.number()),
    htfPoiTargeted: v.optional(v.string()),
    asiaExpectedBehavior: v.optional(v.string()),
    asiaLiquidityToWatch: v.optional(v.string()),
    asiaSetupTypes: v.optional(v.string()),
    londonExpectedBehavior: v.optional(v.string()),
    londonBreakoutExpectation: v.optional(v.string()),
    londonKeyLiquidity: v.optional(v.string()),
    nyExpectedBehavior: v.optional(v.string()),
    nyTargets: v.optional(v.string()),
    nyKeyLiquidity: v.optional(v.string()),
    bestInstrument: v.optional(v.string()),
    bestInstrumentReason: v.optional(v.string()),
    secondChoice: v.optional(v.string()),
    secondChoiceReason: v.optional(v.string()),
    avoidInstrument: v.optional(v.string()),
    avoidReason: v.optional(v.string()),
    sessionToTrade: v.optional(v.union(v.literal("ASIA"), v.literal("LONDON"), v.literal("NY"), v.literal("MULTIPLE"))),
    supportLevels: v.optional(v.string()),
    resistanceLevels: v.optional(v.string()),
    equalHighsLows: v.optional(v.string()),
    trendlines: v.optional(v.string()),
    modelToFocus: v.optional(v.union(v.literal("CONTINUATION"), v.literal("REVERSAL"), v.literal("BOTH"))),
    minimumPoiQuality: v.optional(v.union(v.literal("PRISTINE"), v.literal("CLEAN"), v.literal("ACCEPTABLE"))),
    willTradeWithoutInducement: v.optional(v.boolean()),
    targetTrades: v.optional(v.number()),
    maxDailyLoss: v.optional(v.number()),
    confidenceForToday: v.optional(v.number()),
    actualMovement: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"), v.literal("SIDEWAYS"))),
    wasCorrect: v.optional(v.union(v.literal("YES"), v.literal("NO"), v.literal("PARTIAL"))),
    accuracyScore: v.optional(v.number()),
    asiaExpected: v.optional(v.string()),
    asiaActual: v.optional(v.string()),
    asiaSurprise: v.optional(v.string()),
    londonExpected: v.optional(v.string()),
    londonActual: v.optional(v.string()),
    londonTrapsPresent: v.optional(v.string()),
    nyExpected: v.optional(v.string()),
    nyActual: v.optional(v.string()),
    nyMajorMove: v.optional(v.string()),
    mostObviousTrap: v.optional(v.string()),
    institutionsShowedHand: v.optional(v.boolean()),
    retailBehavior: v.optional(v.string()),
    howAffectsTomorrow: v.optional(v.string()),
    tradesTaken: v.optional(v.number()),
    tradesWorked: v.optional(v.number()),
    tradesFailed: v.optional(v.number()),
    followedPlan: v.optional(v.boolean()),
    planViolationExplanation: v.optional(v.string()),
    overallDiscipline: v.optional(v.number()),
    tomorrowDirection: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    tomorrowConfidence: v.optional(v.number()),
    whatChanged: v.optional(v.string()),
    keyLevelsTomorrow: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("dailyBias") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
