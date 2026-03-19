"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { WeeklyReviewForm } from "@/components/WeeklyReviewForm";
import { WeeklyReviewDetail } from "@/components/WeeklyReviewDetail";

export default function WeeklyPage() {
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const selectedReviewData = weeklyReviews?.find((r) => r._id === selectedReview);

  const sortedReviews = useMemo(() => {
    if (!weeklyReviews) return [];
    return [...weeklyReviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [weeklyReviews]);

  const getWeekNumber = (dateStr: string) => {
    const date = new Date(dateStr);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Weekly Review</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Analyze your trading performance each week
          </p>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <PlusIcon />
          Add Weekly Review
        </button>
      </div>

      <div className="grid gap-4">
        {sortedReviews.map((review) => (
          <div
            key={review._id}
            onClick={() => setSelectedReview(review._id)}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  Week of {new Date(review.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(review.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {review.totalTrades} trades | {review.winningTrades}W / {review.losingTrades}L
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${
                  review.totalPnl >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  ${review.totalPnl.toFixed(2)}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {review.totalTrades > 0 ? Math.round((review.winningTrades / review.totalTrades) * 100) : 0}% Win Rate
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Quality</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {review.overallSetupQualityScore}/10
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Trinity Score</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {review.avgTrinityScore}/10
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Patience</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {review.patienceScore}/10
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Profit Factor</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {review.profitFactor.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {sortedReviews.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <CalendarIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-2">
              No weekly reviews yet
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Start documenting your weekly performance to track your progress.
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Create your first weekly review
            </button>
          </div>
        )}
      </div>

      {showReviewForm && (
        <WeeklyReviewForm onClose={() => setShowReviewForm(false)} />
      )}

      {selectedReview && selectedReviewData && (
        <WeeklyReviewDetail
          review={selectedReviewData}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
