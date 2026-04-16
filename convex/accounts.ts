import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("accounts").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    startingBalance: v.number(),
    currentBalance: v.number(),
    currency: v.string(),
    leverage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("accounts", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("accounts"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { ...args.updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const tradesWithAccount = await ctx.db
      .query("trades")
      .filter((q) => q.eq(q.field("accountId"), args.id))
      .collect();
    
    for (const trade of tradesWithAccount) {
      await ctx.db.patch(trade._id, { accountId: undefined });
    }
    
    const movements = await ctx.db
      .query("capitalMovements")
      .filter((q) => q.eq(q.field("accountId"), args.id))
      .collect();
    
    for (const movement of movements) {
      await ctx.db.delete(movement._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

export const getCapitalMovements = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("capitalMovements")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .order("desc")
      .collect();
  },
});

export const addCapitalMovement = mutation({
  args: {
    accountId: v.id("accounts"),
    type: v.union(v.literal("DEPOSIT"), v.literal("WITHDRAWAL")),
    amount: v.number(),
    date: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("capitalMovements", {
      ...args,
      createdAt: now,
    });
  },
});

export const removeCapitalMovement = mutation({
  args: { id: v.id("capitalMovements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getAccountSummary = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) return null;

    const trades = await ctx.db
      .query("trades")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .collect();

    const movements = await ctx.db
      .query("capitalMovements")
      .filter((q) => q.eq(q.field("accountId"), args.accountId))
      .collect();

    const totalDeposits = movements
      .filter((m) => m.type === "DEPOSIT")
      .reduce((sum, m) => sum + m.amount, 0);

    const totalWithdrawals = movements
      .filter((m) => m.type === "WITHDRAWAL")
      .reduce((sum, m) => sum + m.amount, 0);

    const netProfit =
      account.currentBalance -
      account.startingBalance -
      totalDeposits +
      totalWithdrawals;

    const percentReturn =
      account.startingBalance > 0
        ? (netProfit / account.startingBalance) * 100
        : 0;

    return {
      account,
      totalTrades: trades.length,
      netProfit: Math.round(netProfit * 100) / 100,
      percentReturn: Math.round(percentReturn * 10) / 10,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
    };
  },
});

export const getAccountsWithSummary = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("accounts").order("desc").collect();
    
    const summaries = await Promise.all(
      accounts.map(async (account) => {
        const trades = await ctx.db
          .query("trades")
          .filter((q) => q.eq(q.field("accountId"), account._id))
          .collect();

        const movements = await ctx.db
          .query("capitalMovements")
          .filter((q) => q.eq(q.field("accountId"), account._id))
          .collect();

        const totalDeposits = movements
          .filter((m) => m.type === "DEPOSIT")
          .reduce((sum, m) => sum + m.amount, 0);

        const totalWithdrawals = movements
          .filter((m) => m.type === "WITHDRAWAL")
          .reduce((sum, m) => sum + m.amount, 0);

        const netProfit =
          account.currentBalance -
          account.startingBalance -
          totalDeposits +
          totalWithdrawals;

        const percentReturn =
          account.startingBalance > 0
            ? (netProfit / account.startingBalance) * 100
            : 0;

        return {
          ...account,
          totalTrades: trades.length,
          netProfit: Math.round(netProfit * 100) / 100,
          percentReturn: Math.round(percentReturn * 10) / 10,
          totalDeposits,
          totalWithdrawals,
        };
      })
    );

    return summaries;
  },
});