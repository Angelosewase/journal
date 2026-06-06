import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const screenshotValidator = v.object({
  storageId: v.id("_storage"),
  caption: v.optional(v.string()),
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeklyGameplans").order("desc").collect();
  },
});

export const getByWeekStart = query({
  args: { weekStart: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("weeklyGameplans")
      .withIndex("by_weekStart", (q) => q.eq("weekStart", args.weekStart))
      .collect();
    return rows[0] ?? null;
  },
});

export const create = mutation({
  args: {
    weekStart: v.string(),
    weekEnd: v.string(),
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
      v.union(v.literal("ASIA"), v.literal("LONDON"), v.literal("NEW_YORK")),
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
    screenshots: v.optional(v.array(screenshotValidator)),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("weeklyGameplans", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("weeklyGameplans"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("weeklyGameplans") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
