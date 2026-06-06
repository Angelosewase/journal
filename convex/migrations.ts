import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

function slimWeeklyReview(review: Doc<"weeklyReviews">) {
  return {
    weekStart: review.weekStart,
    weekEnd: review.weekEnd,
    createdAt: review.createdAt,
    updatedAt: Date.now(),
    finalizedAt: review.finalizedAt,
    biggestLessonMarket: review.biggestLessonMarket,
    biggestLessonSelf: review.biggestLessonSelf,
    adjustmentNextWeek: review.adjustmentNextWeek,
    topPriorityImprovement: review.topPriorityImprovement,
    specificActionToImprove: review.specificActionToImprove,
    successMetric: review.successMetric,
    secondPriority: review.secondPriority,
    secondSpecificAction: review.secondSpecificAction,
    secondSuccessMetric: review.secondSuccessMetric,
    setupsToAvoid: review.setupsToAvoid,
    confidenceNextWeek: review.confidenceNextWeek,
    howFeeling: review.howFeeling,
    emotionsAffectedTrading: review.emotionsAffectedTrading,
    emotionManagementPlan: review.emotionManagementPlan,
    readinessScore: review.readinessScore,
    contextNotes: review.contextNotes,
    screenshots: review.screenshots,
  };
}

async function planningRefactorMigrationHandler(
  ctx: MutationCtx,
): Promise<{ notesMigrated: number; tradesMigrated: number; reviewsStripped: number }> {
  const notes = await ctx.db.query("dailyNotes").collect();
  for (const note of notes) {
    const biases = await ctx.db
      .query("dailyBias")
      .withIndex("by_date", (q) => q.eq("date", note.date))
      .collect();
    const screenshots = (note.screenshots ?? []).map((storageId) => ({
      storageId,
    }));
    if (biases[0]) {
      const existing = biases[0];
      await ctx.db.patch(existing._id, {
        morningContextNotes: existing.morningContextNotes ?? note.notes,
        morningScreenshots:
          existing.morningScreenshots ??
          (screenshots.length > 0 ? screenshots : undefined),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("dailyBias", {
        date: note.date,
        currentDailyBias: "NEUTRAL",
        biasConfidence: 5,
        biasReason: "",
        sessionToTrade: "MULTIPLE",
        modelToFocus: "BOTH",
        minimumPoiQuality: "ACCEPTABLE",
        willTradeWithoutInducement: false,
        confidenceForToday: 5,
        morningContextNotes: note.notes,
        morningScreenshots: screenshots.length > 0 ? screenshots : undefined,
        createdAt: note.createdAt,
        updatedAt: Date.now(),
      });
    }
  }

  const trades = await ctx.db.query("trades").collect();
  let tradesMigrated = 0;
  for (const trade of trades) {
    if (trade.captures && trade.captures.length > 0) continue;
    if (!trade.screenshots || trade.screenshots.length === 0) continue;
    tradesMigrated += 1;
    await ctx.db.patch(trade._id, {
      captures: trade.screenshots.map((storageId) => ({
        storageId,
        label: "OTHER" as const,
        capturedAt: trade.createdAt,
      })),
      updatedAt: Date.now(),
    });
  }

  const reviews = await ctx.db.query("weeklyReviews").collect();
  for (const review of reviews) {
    await ctx.db.replace(review._id, slimWeeklyReview(review));
  }

  return {
    notesMigrated: notes.length,
    tradesMigrated,
    reviewsStripped: reviews.length,
  };
}

/** One-time migration: dailyNotes -> dailyBias, trade screenshots -> captures */
export const runPlanningRefactorMigration = internalMutation({
  args: {},
  handler: planningRefactorMigrationHandler,
});
