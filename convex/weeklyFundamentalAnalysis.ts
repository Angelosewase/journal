import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeklyFundamentalAnalysis").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("weeklyFundamentalAnalysis") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByWeekStart = query({
  args: { weekStart: v.string() },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("weeklyFundamentalAnalysis")
      .filter((q) => q.eq(q.field("weekStart"), args.weekStart))
      .collect();
    return analyses[0] || null;
  },
});

export const create = mutation({
  args: {
    weekStart: v.string(),
    weekEnd: v.string(),
    
    // Macro Overview
    overallRiskSentiment: v.union(v.literal("RISK_ON"), v.literal("RISK_OFF"), v.literal("NEUTRAL")),
    riskSentimentDirection: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("SIDEWAYS")),
    dxyWeeklyBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    dxyDirection: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("SIDEWAYS")),
    us10yrYield: v.optional(v.number()),
    us10yrDirection: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("SIDEWAYS")),
    vixLevel: v.optional(v.number()),
    vixDirection: v.union(v.literal("ABOVE_20"), v.literal("BELOW_20")),
    goldDirection: v.union(v.literal("UP"), v.literal("DOWN"), v.literal("FLAT")),
    wtiOil: v.optional(v.number()),
    wtiDirection: v.union(v.literal("UP"), v.literal("DOWN")),
    
    // Key Events This Week
    mondayEvents: v.optional(v.string()),
    tuesdayEvents: v.optional(v.string()),
    wednesdayEvents: v.optional(v.string()),
    thursdayEvents: v.optional(v.string()),
    fridayEvents: v.optional(v.string()),
    highestImpactEvent: v.optional(v.string()),
    expectedMarketReaction: v.optional(v.string()),
    
    // Central Bank Watch - Fed
    fedMeetingsSpeeches: v.optional(v.string()),
    fedCurrentRate: v.optional(v.number()),
    fedMarketExpects: v.optional(v.string()),
    fedHoldProbability: v.optional(v.number()),
    fedCutProbability: v.optional(v.number()),
    fedHikeProbability: v.optional(v.number()),
    
    // ECB
    ecbMeetingsSpeeches: v.optional(v.string()),
    ecbCurrentRate: v.optional(v.number()),
    ecbTone: v.optional(v.string()),
    
    // BoE
    boeMeetingsSpeeches: v.optional(v.string()),
    boeCurrentRate: v.optional(v.number()),
    boeVoteSplit: v.optional(v.string()),
    
    // BoJ
    bojMeetingsSpeeches: v.optional(v.string()),
    yccStatus: v.optional(v.string()),
    
    // Inflation & Growth Data
    usCPIHeadline: v.optional(v.number()),
    usCPIHeadlinePrior: v.optional(v.number()),
    usCPIHeadlineTrend: v.optional(v.union(v.literal("RISING"), v.literal("FALLING"), v.literal("STICKY"))),
    usCoreCPI: v.optional(v.number()),
    usCoreCPIPrior: v.optional(v.number()),
    usCoreCPITrend: v.optional(v.union(v.literal("RISING"), v.literal("FALLING"), v.literal("STICKY"))),
    corePCE: v.optional(v.number()),
    corePCEPrior: v.optional(v.number()),
    corePCETrend: v.optional(v.union(v.literal("RISING"), v.literal("FALLING"), v.literal("STICKY"))),
    nfpJobsAdded: v.optional(v.number()),
    nfpPrior: v.optional(v.number()),
    nfpTrend: v.optional(v.union(v.literal("ACCELERATING"), v.literal("DECELERATING"))),
    unemploymentRate: v.optional(v.number()),
    unemploymentTrend: v.optional(v.union(v.literal("TIGHTENING"), v.literal("LOOSENING"))),
    usGDP: v.optional(v.number()),
    usGDPPrior: v.optional(v.number()),
    usGDPTrend: v.optional(v.union(v.literal("ACCELERATING"), v.literal("DECELERATING"))),
    inflationNarrative: v.optional(v.string()),
    growthNarrative: v.optional(v.string()),
    
    // COT Report Analysis
    eurNetPositions: v.optional(v.number()),
    eurPositionChange: v.optional(v.number()),
    eurSignal: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    gbpNetPositions: v.optional(v.number()),
    gbpPositionChange: v.optional(v.number()),
    gbpSignal: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    jpyNetPositions: v.optional(v.number()),
    jpyPositionChange: v.optional(v.number()),
    jpySignal: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    audNetPositions: v.optional(v.number()),
    audPositionChange: v.optional(v.number()),
    audSignal: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    cadNetPositions: v.optional(v.number()),
    cadPositionChange: v.optional(v.number()),
    cadSignal: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    nzdNetPositions: v.optional(v.number()),
    nzdPositionChange: v.optional(v.number()),
    nzdSignal: v.optional(v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL"))),
    extremePositioningAlert: v.optional(v.string()),
    
    // Currency Bias
    usdBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    usdReason: v.optional(v.string()),
    eurBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    eurReason: v.optional(v.string()),
    gbpBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    gbpReason: v.optional(v.string()),
    jpyBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    jpyReason: v.optional(v.string()),
    cadBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    cadReason: v.optional(v.string()),
    audBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    audReason: v.optional(v.string()),
    chfBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    chfReason: v.optional(v.string()),
    nzdBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    nzdReason: v.optional(v.string()),
    
    // Trade Ideas
    trade1Pair: v.optional(v.string()),
    trade1Direction: v.optional(v.union(v.literal("LONG"), v.literal("SHORT"))),
    trade1Reason: v.optional(v.string()),
    trade1KeyLevel: v.optional(v.string()),
    trade1Invalidation: v.optional(v.string()),
    trade2Pair: v.optional(v.string()),
    trade2Direction: v.optional(v.union(v.literal("LONG"), v.literal("SHORT"))),
    trade2Reason: v.optional(v.string()),
    trade2KeyLevel: v.optional(v.string()),
    trade2Invalidation: v.optional(v.string()),
    
    // High Risk Events to Avoid
    highRiskEvent1: v.optional(v.string()),
    highRiskDate1: v.optional(v.string()),
    highRiskReason1: v.optional(v.string()),
    highRiskEvent2: v.optional(v.string()),
    highRiskDate2: v.optional(v.string()),
    highRiskReason2: v.optional(v.string()),
    
    // Geopolitical Watch
    activeRisks: v.optional(v.string()),
    potentialShockEvents: v.optional(v.string()),
    safeHavenBias: v.optional(v.string()),
    
    // End of Week Review
    confirmationOfBias: v.optional(v.string()),
    surprisingData: v.optional(v.string()),
    missedAnalysis: v.optional(v.string()),
    adjustmentsNextWeek: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("weeklyFundamentalAnalysis", { ...args, createdAt: now, updatedAt: now });
  },
});

export const update = mutation({
  args: { id: v.id("weeklyFundamentalAnalysis"), updates: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("weeklyFundamentalAnalysis") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});