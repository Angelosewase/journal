import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  trades: defineTable({
    createdAt: v.number(),
    updatedAt: v.number(),
    
    // Basic Trade Info
    instrument: v.string(),
    direction: v.union(v.literal("LONG"), v.literal("SHORT")),
    entryPrice: v.number(),
    exitPrice: v.optional(v.number()),
    currentPrice: v.optional(v.number()),
    positionSize: v.number(),
    commission: v.number(),
    environment: v.union(v.literal("BACKTESTING"), v.literal("DEMO"), v.literal("LIVE")),
    
    // WWA Framework - Direction & Analysis
    dailyBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    externalStructure: v.string(),
    majorLiquidityPools: v.string(),
    internalStructure: v.string(),
    currentRange: v.string(),
    minorPushStatus: v.string(),
    session: v.union(v.literal("ASIA"), v.literal("LONDON"), v.literal("NEW_YORK"), v.literal("OTHER")),
    isInKillzone: v.boolean(),
    
    // WWA Framework - Area of Interest (POI)
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
    
    // WWA Framework - Traps & Inducement
    trapSwept: v.union(v.literal("YES"), v.literal("NO"), v.literal("PARTIAL")),
    trapType: v.optional(v.string()),
    trapLocation: v.optional(v.number()),
    trapTappedCount: v.optional(v.number()),
    trapCleanliness: v.optional(v.string()),
    liquidityEngineering: v.optional(v.string()),
    liquidityTappedCount: v.optional(v.number()),
    retailBehavior: v.optional(v.string()),
    missingInducement: v.boolean(),
    
    // WWA Framework - Entry & Confirmation (Trinity)
    ltfEntryTimeframe: v.optional(v.string()),
    smcType: v.optional(v.string()),
    smsAfterTrap: v.boolean(),
    bmsPattern: v.optional(v.string()),
    bmsConfidence: v.optional(v.number()),
    rtoApplicable: v.boolean(),
    rtoDistance: v.optional(v.number()),
    entryConfidence: v.optional(v.number()),
    
    // Trade Execution
    tradeModel: v.union(v.literal("CONTINUATION"), v.literal("REVERSAL")),
    narrativeAlignment: v.boolean(),
    tradingWithMainPush: v.boolean(),
    noNarrativeMisalignment: v.boolean(),
    clearLiquidityEngineering: v.optional(v.string()),
    institutionsReasoned: v.optional(v.boolean()),
    poiMitigationStatus: v.union(v.literal("UNMITIGATED"), v.literal("MITIGATED_ONCE"), v.literal("WEAKENED")),
    approachDynamics: v.optional(v.string()),
    
    // Risk Management
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
    
    // Post-Entry Trade Management
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
    
    // Trade Outcome & Analysis
    pnl: v.optional(v.number()),
    pnlPercentage: v.optional(v.number()),
    winLossStatus: v.union(v.literal("WIN"), v.literal("LOSS"), v.literal("BREAK_EVEN")),
    tradeQualityScore: v.optional(v.number()),
    poiQualityRating: v.optional(v.string()),
    inducementQualityRating: v.optional(v.string()),
    trinityAlignmentRating: v.optional(v.string()),
    riskExecutionRating: v.optional(v.string()),
    disciplineRating: v.optional(v.string()),
    
    // Post-Trade Reflection
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
  }).index("by_createdAt", ["createdAt"])
    .index("by_instrument", ["instrument"])
    .index("by_session", ["session"])
    .index("by_tradeModel", ["tradeModel"])
    .index("by_winLoss", ["winLossStatus"])
    .index("by_environment", ["environment"]),

  dailyBias: defineTable({
    date: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    
    // Morning Bias
    currentDailyBias: v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    biasConfidence: v.number(),
    biasReason: v.string(),
    asiaHigh: v.optional(v.number()),
    asiaLow: v.optional(v.number()),
    previousDayHigh: v.optional(v.number()),
    previousDayLow: v.optional(v.number()),
    htfPoiTargeted: v.optional(v.string()),
    
    // Session Expectations
    asiaExpectedBehavior: v.optional(v.string()),
    asiaLiquidityToWatch: v.optional(v.string()),
    asiaSetupTypes: v.optional(v.string()),
    londonExpectedBehavior: v.optional(v.string()),
    londonBreakoutExpectation: v.optional(v.string()),
    londonKeyLiquidity: v.optional(v.string()),
    nyExpectedBehavior: v.optional(v.string()),
    nyTargets: v.optional(v.string()),
    nyKeyLiquidity: v.optional(v.string()),
    
    // Trading Plan
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
    
    // Evening Review
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
  }).index("by_date", ["date"]),

  weeklyReviews: defineTable({
    weekStart: v.string(),
    weekEnd: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    
    // Weekly Numbers
    totalTrades: v.number(),
    winningTrades: v.number(),
    losingTrades: v.number(),
    totalPnl: v.number(),
    biggestWin: v.number(),
    biggestLoss: v.number(),
    avgWin: v.number(),
    avgLoss: v.number(),
    profitFactor: v.number(),
    
    // Trinity Compliance
    inducementPercentage: v.number(),
    ltcPercentage: v.number(),
    killzonePercentage: v.number(),
    avgTrinityScore: v.number(),
    
    // Narrative Alignment
    tradesAgainstHtf: v.number(),
    thoseLostMore: v.boolean(),
    narrativeAbilityScore: v.number(),
    
    // POI Quality
    avgPoiQualityScore: v.number(),
    pristineCleanSetups: v.number(),
    questionableSetups: v.number(),
    lossesOnLowQuality: v.boolean(),
    
    // Inducement Recognition
    inducementRecognitionScore: v.number(),
    prematureEntries: v.number(),
    prematureEntryCost: v.number(),
    improvePatienceNote: v.optional(v.string()),
    
    // Patience & Discipline
    forcedTrades: v.number(),
    waitedTrades: v.number(),
    forcedTradesLostMore: v.boolean(),
    patienceScore: v.number(),
    skippedObviousSetups: v.boolean(),
    skippedSetupsReason: v.optional(v.string()),
    
    // Market Conditions
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
    
    // Edge Assessment
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
    
    // Setup Quality Scores
    poiIdentificationScore: v.number(),
    inducementRecognitionScore2: v.number(),
    entryExecutionScore: v.number(),
    riskManagementScore: v.number(),
    overallSetupQualityScore: v.number(),
    
    // Action Items
    topPriorityImprovement: v.string(),
    specificActionToImprove: v.string(),
    successMetric: v.string(),
    secondPriority: v.optional(v.string()),
    secondSpecificAction: v.optional(v.string()),
    secondSuccessMetric: v.optional(v.string()),
    setupsToAvoid: v.optional(v.string()),
    confidenceNextWeek: v.number(),
    
    // Mental/Emotional
    howFeeling: v.optional(v.string()),
    emotionsAffectedTrading: v.optional(v.boolean()),
    emotionManagementPlan: v.optional(v.string()),
    readinessScore: v.number(),
  }).index("by_weekStart", ["weekStart"]),
});
