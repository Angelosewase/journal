"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { WeeklyReviewForm } from "./WeeklyReviewForm";

interface WeeklyReviewDetailProps {
  review: any;
  onClose: () => void;
}

export function WeeklyReviewDetail({ review, onClose }: WeeklyReviewDetailProps) {
  const removeReview = useMutation(api.weeklyReviews.remove);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this weekly review?")) {
      await removeReview({ id: review._id });
      onClose();
    }
  };

  if (isEditing) {
    return <WeeklyReviewForm existingReview={review} onClose={onClose} />;
  }

  const winRate = review.totalTrades > 0 ? (review.winningTrades / review.totalTrades) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Weekly Review
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {new Date(review.weekStart).toLocaleDateString()} - {new Date(review.weekEnd).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Total Trades</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{review.totalTrades}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Win Rate</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{winRate.toFixed(1)}%</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Total P&L</p>
              <p className={`text-2xl font-bold mt-1 ${
                review.totalPnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}>
                ${review.totalPnl.toFixed(2)}
              </p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Profit Factor</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{review.profitFactor.toFixed(2)}</p>
            </div>
          </div>

          <Section title="Trade Breakdown">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Field label="Winning Trades" value={review.winningTrades} />
              <Field label="Losing Trades" value={review.losingTrades} />
              <Field label="Biggest Win" value={`$${review.biggestWin.toFixed(2)}`} />
              <Field label="Biggest Loss" value={`$${review.biggestLoss.toFixed(2)}`} />
              <Field label="Avg Win" value={`$${review.avgWin.toFixed(2)}`} />
              <Field label="Avg Loss" value={`$${review.avgLoss.toFixed(2)}`} />
            </div>
          </Section>

          <Section title="WWA Compliance">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Field label="Trinity Score" value={`${review.avgTrinityScore}/10`} />
              <Field label="Inducement %" value={`${review.inducementPercentage}%`} />
              <Field label="LTC %" value={`${review.ltcPercentage}%`} />
              <Field label="Killzone %" value={`${review.killzonePercentage}%`} />
            </div>
          </Section>

          <Section title="Quality Metrics">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <Field label="Overall Quality" value={`${review.overallSetupQualityScore}/10`} />
              <Field label="POI ID" value={`${review.poiIdentificationScore}/10`} />
              <Field label="Inducement" value={`${review.inducementRecognitionScore2}/10`} />
              <Field label="Entry" value={`${review.entryExecutionScore}/10`} />
              <Field label="Risk Mgmt" value={`${review.riskManagementScore}/10`} />
            </div>
          </Section>

          <Section title="Patience & Discipline">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Patience Score" value={`${review.patienceScore}/10`} />
              <Field label="Forced Trades" value={review.forcedTrades} />
              <Field label="Waited Trades" value={review.waitedTrades} />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              {review.forcedTradesLostMore
                ? "Forced trades lost more often than waited trades."
                : "Waited trades performed better than forced trades."}
            </p>
          </Section>

          {review.bestTradeDescription && (
            <Section title="Best Trade">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.bestTradeDescription}</p>
              {review.whyBestWorked && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  <span className="font-medium">Why it worked:</span> {review.whyBestWorked}
                </p>
              )}
            </Section>
          )}

          {review.worstTradeDescription && (
            <Section title="Worst Trade">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.worstTradeDescription}</p>
              {review.whyWorstFailed && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  <span className="font-medium">Why it failed:</span> {review.whyWorstFailed}
                </p>
              )}
            </Section>
          )}

          <Section title="Biggest Lessons">
            {review.biggestLessonMarket && (
              <div className="mb-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">About the Market</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.biggestLessonMarket}</p>
              </div>
            )}
            {review.biggestLessonSelf && (
              <div className="mb-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">About Yourself</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.biggestLessonSelf}</p>
              </div>
            )}
            {review.adjustmentNextWeek && (
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase">Adjustment for Next Week</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.adjustmentNextWeek}</p>
              </div>
            )}
          </Section>

          <Section title="Action Items for Next Week">
            <div className="space-y-3">
              {review.topPriorityImprovement && (
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Priority</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{review.topPriorityImprovement}</p>
                  {review.specificActionToImprove && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">{review.specificActionToImprove}</p>
                  )}
                </div>
              )}
              {review.confidenceNextWeek && (
                <p className="text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Confidence for Next Week:</span>{" "}
                  <span className="font-medium">{review.confidenceNextWeek}/10</span>
                </p>
              )}
            </div>
          </Section>

          {review.howFeeling && (
            <Section title="Mental/Emotional">
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-zinc-500 dark:text-zinc-400">Feeling:</span>{" "}
                  <span className="text-zinc-700 dark:text-zinc-300">{review.howFeeling}</span>
                </p>
                {review.emotionsAffectedTrading !== undefined && (
                  <p>
                    <span className="text-zinc-500 dark:text-zinc-400">Emotions affected trading:</span>{" "}
                    <span className={review.emotionsAffectedTrading ? "text-red-600" : "text-emerald-600"}>
                      {review.emotionsAffectedTrading ? "Yes" : "No"}
                    </span>
                  </p>
                )}
                <p>
                  <span className="text-zinc-500 dark:text-zinc-400">Readiness:</span>{" "}
                  <span className="font-medium">{review.readinessScore}/10</span>
                </p>
              </div>
            </Section>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Delete Review
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Edit Review
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
