import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const screenshotValidator = v.object({
  storageId: v.id("_storage"),
  caption: v.optional(v.string()),
});

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
      .withIndex("by_weekStart", (q) => q.eq("weekStart", args.weekStart))
      .collect();
    return reviews[0] ?? null;
  },
});

export const create = mutation({
  args: {
    weekStart: v.string(),
    weekEnd: v.string(),
    topPriorityImprovement: v.string(),
    specificActionToImprove: v.string(),
    successMetric: v.string(),
    confidenceNextWeek: v.number(),
    readinessScore: v.number(),
    finalizedAt: v.optional(v.number()),
    biggestLessonMarket: v.optional(v.string()),
    biggestLessonSelf: v.optional(v.string()),
    adjustmentNextWeek: v.optional(v.string()),
    secondPriority: v.optional(v.string()),
    secondSpecificAction: v.optional(v.string()),
    secondSuccessMetric: v.optional(v.string()),
    setupsToAvoid: v.optional(v.string()),
    howFeeling: v.optional(v.string()),
    emotionsAffectedTrading: v.optional(v.boolean()),
    emotionManagementPlan: v.optional(v.string()),
    contextNotes: v.optional(v.string()),
    screenshots: v.optional(v.array(screenshotValidator)),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("weeklyReviews", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
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
