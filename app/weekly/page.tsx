"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyReviewForm } from "@/components/WeeklyReviewForm";
import { WeeklyReviewDetail } from "@/components/WeeklyReviewDetail";
import { Plus, Calendar, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function WeeklyPage() {
  const weeklyReviews = useQuery(api.weeklyReviews.list);
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const selectedReviewData = weeklyReviews?.find((r) => r._id === selectedReview);

  const sortedReviews = useMemo(() => {
    if (!weeklyReviews) return [];
    return [...weeklyReviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  }, [weeklyReviews]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weekly Review</h1>
          <p className="text-sm text-muted-foreground">
            Analyze your trading performance each week
          </p>
        </div>
        <Button onClick={() => setShowReviewForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Weekly Review
        </Button>
      </div>

      <div className="grid gap-4">
        {sortedReviews.map((review) => {
          const winRate = review.totalTrades > 0 ? Math.round((review.winningTrades / review.totalTrades) * 100) : 0;
          return (
            <Card
              key={review._id}
              className="hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition-colors"
              onClick={() => setSelectedReview(review._id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Week of {new Date(review.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(review.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </CardTitle>
                      <CardDescription>
                        {review.totalTrades} trades | {review.winningTrades}W / {review.losingTrades}L | {winRate}% Win Rate
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${review.totalPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      ${review.totalPnl.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quality</p>
                      <p className="font-medium">{review.overallSetupQualityScore}/10</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.avgTrinityScore >= 7 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Trinity</p>
                      <p className="font-medium">{review.avgTrinityScore}/10</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.patienceScore >= 7 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Patience</p>
                      <p className="font-medium">{review.patienceScore}/10</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit Factor</p>
                    <p className="font-medium">{review.profitFactor.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Best Trade</p>
                    <p className="font-medium text-emerald-600">${review.biggestWin.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {sortedReviews.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No weekly reviews yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Start documenting your weekly performance to track your progress and identify patterns in your trading.
              </p>
              <Button onClick={() => setShowReviewForm(true)}>
                Create your first weekly review
              </Button>
            </CardContent>
          </Card>
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
