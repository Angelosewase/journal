import { v } from "convex/values";
import { query } from "./_generated/server";

/** @deprecated Fundamentals removed — returns empty for stale clients. */
export const list = query({
  args: {},
  handler: async () => {
    return [];
  },
});

/** @deprecated */
export const getByWeekStart = query({
  args: { weekStart: v.string() },
  handler: async () => {
    return null;
  },
});
