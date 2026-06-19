import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const tradeCaptureValidator = v.object({
  storageId: v.id("_storage"),
  label: v.union(
    v.literal("HTF"),
    v.literal("ENTRY"),
    v.literal("EXIT"),
    v.literal("OTHER"),
  ),
  caption: v.optional(v.string()),
  capturedAt: v.optional(v.number()),
});

const screenshotWithCaptionValidator = v.object({
  storageId: v.id("_storage"),
  caption: v.optional(v.string()),
});

export default defineSchema({
  accounts: defineTable({
    name: v.string(),
    startingBalance: v.number(),
    currency: v.string(),
    leverage: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  capitalMovements: defineTable({
    accountId: v.id("accounts"),
    type: v.union(v.literal("DEPOSIT"), v.literal("WITHDRAWAL")),
    amount: v.number(),
    date: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_accountId", ["accountId"])
    .index("by_date", ["date"]),

  trades: defineTable({
    accountId: v.optional(v.id("accounts")),
    createdAt: v.number(),
    updatedAt: v.number(),

    instrument: v.string(),
    direction: v.union(v.literal("LONG"), v.literal("SHORT")),
    entryPrice: v.number(),
    exitPrice: v.optional(v.number()),
    currentPrice: v.optional(v.number()),
    positionSize: v.number(),
    commission: v.number(),
    environment: v.union(
      v.literal("BACKTESTING"),
      v.literal("DEMO"),
      v.literal("LIVE"),
    ),

    dailyBias: v.union(
      v.literal("BULLISH"),
      v.literal("BEARISH"),
      v.literal("NEUTRAL"),
    ),
    externalStructure: v.optional(v.string()),
    majorLiquidityPools: v.optional(v.string()),
    internalStructure: v.optional(v.string()),
    currentRange: v.optional(v.string()),
    minorPushStatus: v.optional(v.string()),
    session: v.union(
      v.literal("ASIA"),
      v.literal("LONDON"),
      v.literal("NEW_YORK"),
      v.literal("OTHER"),
    ),
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
    poiMitigationStatus: v.union(
      v.literal("UNMITIGATED"),
      v.literal("MITIGATED_ONCE"),
      v.literal("WEAKENED"),
    ),
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
    winLossStatus: v.union(
      v.literal("WIN"),
      v.literal("LOSS"),
      v.literal("BREAK_EVEN"),
    ),
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

    captures: v.optional(v.array(tradeCaptureValidator)),
    screenshots: v.optional(v.array(v.id("_storage"))),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_instrument", ["instrument"])
    .index("by_session", ["session"])
    .index("by_tradeModel", ["tradeModel"])
    .index("by_winLoss", ["winLossStatus"])
    .index("by_environment", ["environment"])
    .index("by_accountId", ["accountId"]),

  dailyBias: defineTable({
    date: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),

    currentDailyBias: v.union(
      v.literal("BULLISH"),
      v.literal("BEARISH"),
      v.literal("NEUTRAL"),
    ),
    biasConfidence: v.number(),
    biasReason: v.string(),
    asiaHigh: v.optional(v.number()),
    asiaLow: v.optional(v.number()),
    previousDayHigh: v.optional(v.number()),
    previousDayLow: v.optional(v.number()),
    htfPoiTargeted: v.optional(v.string()),

    morningContextNotes: v.optional(v.string()),
    morningScreenshots: v.optional(v.array(screenshotWithCaptionValidator)),
    eveningContextNotes: v.optional(v.string()),
    eveningScreenshots: v.optional(v.array(screenshotWithCaptionValidator)),
    sessionScreenshots: v.optional(
      v.object({
        ASIA: v.optional(v.array(v.id("_storage"))),
        LONDON: v.optional(v.array(v.id("_storage"))),
        NY: v.optional(v.array(v.id("_storage"))),
      }),
    ),

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
    sessionToTrade: v.union(
      v.literal("ASIA"),
      v.literal("LONDON"),
      v.literal("NY"),
      v.literal("MULTIPLE"),
    ),
    supportLevels: v.optional(v.string()),
    resistanceLevels: v.optional(v.string()),
    equalHighsLows: v.optional(v.string()),
    trendlines: v.optional(v.string()),
    modelToFocus: v.union(
      v.literal("CONTINUATION"),
      v.literal("REVERSAL"),
      v.literal("BOTH"),
    ),
    minimumPoiQuality: v.union(
      v.literal("PRISTINE"),
      v.literal("CLEAN"),
      v.literal("ACCEPTABLE"),
    ),
    willTradeWithoutInducement: v.boolean(),
    targetTrades: v.optional(v.number()),
    maxDailyLoss: v.optional(v.number()),
    confidenceForToday: v.number(),

    actualMovement: v.optional(
      v.union(
        v.literal("BULLISH"),
        v.literal("BEARISH"),
        v.literal("NEUTRAL"),
        v.literal("SIDEWAYS"),
      ),
    ),
    wasCorrect: v.optional(
      v.union(v.literal("YES"), v.literal("NO"), v.literal("PARTIAL")),
    ),
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
    tomorrowDirection: v.optional(
      v.union(v.literal("BULLISH"), v.literal("BEARISH"), v.literal("NEUTRAL")),
    ),
    tomorrowConfidence: v.optional(v.number()),
    whatChanged: v.optional(v.string()),
    keyLevelsTomorrow: v.optional(v.string()),
  }).index("by_date", ["date"]),

  weeklyReviews: defineTable({
    weekStart: v.string(),
    weekEnd: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    finalizedAt: v.optional(v.number()),

    biggestLessonMarket: v.optional(v.string()),
    biggestLessonSelf: v.optional(v.string()),
    adjustmentNextWeek: v.optional(v.string()),

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

    contextNotes: v.optional(v.string()),
    screenshots: v.optional(v.array(screenshotWithCaptionValidator)),
  }).index("by_weekStart", ["weekStart"]),

  weeklyGameplans: defineTable({
    weekStart: v.string(),
    weekEnd: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),

    weeklyBias: v.union(
      v.literal("BULLISH"),
      v.literal("BEARISH"),
      v.literal("NEUTRAL"),
    ),
    biasConfidence: v.number(),
    biasReason: v.string(),

    instrumentsToFocus: v.optional(v.string()),
    instrumentsToAvoid: v.optional(v.string()),
    sessionFocus: v.optional(
      v.union(
        v.literal("ASIA"),
        v.literal("LONDON"),
        v.literal("NEW_YORK"),
      ),
    ),
    modelToFocus: v.optional(
      v.union(v.literal("CONTINUATION"), v.literal("REVERSAL"), v.literal("BOTH")),
    ),
    minimumPoiQuality: v.optional(
      v.union(v.literal("PRISTINE"), v.literal("CLEAN"), v.literal("ACCEPTABLE")),
    ),

    targetTrades: v.optional(v.number()),
    maxWeeklyLoss: v.optional(v.number()),
    willTradeWithoutInducement: v.boolean(),
    eventsToAvoid: v.optional(v.string()),

    carryForwardNotes: v.optional(v.string()),
    confidenceForWeek: v.number(),

    contextNotes: v.optional(v.string()),
    screenshots: v.optional(v.array(screenshotWithCaptionValidator)),
  }).index("by_weekStart", ["weekStart"]),

  dailyNotes: defineTable({
    date: v.string(),
    notes: v.string(),
    screenshots: v.optional(v.array(v.id("_storage"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_date", ["date"]),
});
