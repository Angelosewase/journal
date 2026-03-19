import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dailyNotes").order("desc").collect();
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("dailyNotes")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();
    return notes[0] || null;
  },
});

export const get = query({
  args: { id: v.id("dailyNotes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    notes: v.string(),
    screenshots: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("dailyNotes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dailyNotes"),
    notes: v.optional(v.string()),
    screenshots: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("dailyNotes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
