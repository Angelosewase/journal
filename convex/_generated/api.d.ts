/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dailyBias from "../dailyBias.js";
import type * as dailyNotes from "../dailyNotes.js";
import type * as trades from "../trades.js";
import type * as weeklyFundamentalAnalysis from "../weeklyFundamentalAnalysis.js";
import type * as weeklyReviews from "../weeklyReviews.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dailyBias: typeof dailyBias;
  dailyNotes: typeof dailyNotes;
  trades: typeof trades;
  weeklyFundamentalAnalysis: typeof weeklyFundamentalAnalysis;
  weeklyReviews: typeof weeklyReviews;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
