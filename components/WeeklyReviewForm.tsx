"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

interface WeeklyReviewFormProps {
  onClose: () => void;
  existingReview?: any;
}

export function WeeklyReviewForm({ onClose, existingReview }: WeeklyReviewFormProps) {
  const createReview = useMutation(api.weeklyReviews.create);
  const trades = useQuery(api.trades.list);
  
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const weekEndStr = weekEnd.toISOString().split("T")[0];
  
  const weekTrades = trades?.filter((t: any) => {
    const tradeDate = new Date(t.createdAt).toISOString().split("T")[0];
    return tradeDate >= weekStartStr && tradeDate <= weekEndStr;
  }) || [];
  
  const autoStats = {
    totalTrades: weekTrades.length,
    winningTrades: weekTrades.filter((t: any) => t.winLossStatus === "WIN").length,
    losingTrades: weekTrades.filter((t: any) => t.winLossStatus === "LOSS").length,
    totalPnl: weekTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0),
    biggestWin: Math.max(0, ...weekTrades.filter((t: any) => t.winLossStatus === "WIN").map((t: any) => t.pnl || 0)),
    biggestLoss: Math.min(0, ...weekTrades.filter((t: any) => t.winLossStatus === "LOSS").map((t: any) => t.pnl || 0)),
    avgWin: weekTrades.filter((t: any) => t.winLossStatus === "WIN").length > 0
      ? weekTrades.filter((t: any) => t.winLossStatus === "WIN").reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) / weekTrades.filter((t: any) => t.winLossStatus === "WIN").length
      : 0,
    avgLoss: weekTrades.filter((t: any) => t.winLossStatus === "LOSS").length > 0
      ? Math.abs(weekTrades.filter((t: any) => t.winLossStatus === "LOSS").reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) / weekTrades.filter((t: any) => t.winLossStatus === "LOSS").length)
      : 0,
    profitFactor: 0,
  };
  
  autoStats.profitFactor = autoStats.avgLoss > 0 ? autoStats.avgWin / autoStats.avgLoss : 0;

  const [formData, setFormData] = useState({
    weekStart: existingReview?.weekStart || weekStartStr,
    weekEnd: existingReview?.weekEnd || weekEndStr,
    
    // Auto-calculated (can override)
    totalTrades: existingReview?.totalTrades || autoStats.totalTrades,
    winningTrades: existingReview?.winningTrades || autoStats.winningTrades,
    losingTrades: existingReview?.losingTrades || autoStats.losingTrades,
    totalPnl: existingReview?.totalPnl || autoStats.totalPnl,
    biggestWin: existingReview?.biggestWin || autoStats.biggestWin,
    biggestLoss: existingReview?.biggestLoss || autoStats.biggestLoss,
    avgWin: existingReview?.avgWin || autoStats.avgWin,
    avgLoss: existingReview?.avgLoss || autoStats.avgLoss,
    profitFactor: existingReview?.profitFactor || autoStats.profitFactor,
    
    // Trinity Compliance
    inducementPercentage: existingReview?.inducementPercentage || 100,
    ltcPercentage: existingReview?.ltcPercentage || 100,
    killzonePercentage: existingReview?.killzonePercentage || 100,
    avgTrinityScore: existingReview?.avgTrinityScore || 8,
    
    // Narrative Alignment
    tradesAgainstHtf: existingReview?.tradesAgainstHtf || 0,
    thoseLostMore: existingReview?.thoseLostMore || false,
    narrativeAbilityScore: existingReview?.narrativeAbilityScore || 8,
    
    // POI Quality
    avgPoiQualityScore: existingReview?.avgPoiQualityScore || 7,
    pristineCleanSetups: existingReview?.pristineCleanSetups || 0,
    questionableSetups: existingReview?.questionableSetups || 0,
    lossesOnLowQuality: existingReview?.lossesOnLowQuality || false,
    
    // Inducement
    inducementRecognitionScore: existingReview?.inducementRecognitionScore || 7,
    prematureEntries: existingReview?.prematureEntries || 0,
    prematureEntryCost: existingReview?.prematureEntryCost || 0,
    
    // Patience
    forcedTrades: existingReview?.forcedTrades || 0,
    waitedTrades: existingReview?.waitedTrades || autoStats.totalTrades,
    forcedTradesLostMore: existingReview?.forcedTradesLostMore || false,
    patienceScore: existingReview?.patienceScore || 8,
    skippedObviousSetups: existingReview?.skippedObviousSetups || false,
    
    // Market Conditions
    asiaRangeClarity: existingReview?.asiaRangeClarity || "",
    londonTrapsObvious: existingReview?.londonTrapsObvious || false,
    mostCommonTrapType: existingReview?.mostCommonTrapType || "",
    institutionsObvious: existingReview?.institutionsObvious || false,
    
    // Edge Assessment
    bestTradeDescription: existingReview?.bestTradeDescription || "",
    whyBestWorked: existingReview?.whyBestWorked || "",
    patternToLookFor: existingReview?.patternToLookFor || "",
    patternConfidence: existingReview?.patternConfidence || 8,
    worstTradeDescription: existingReview?.worstTradeDescription || "",
    whyWorstFailed: existingReview?.whyWorstFailed || "",
    howToAvoidNextWeek: existingReview?.howToAvoidNextWeek || "",
    biggestLessonMarket: existingReview?.biggestLessonMarket || "",
    biggestLessonSelf: existingReview?.biggestLessonSelf || "",
    adjustmentNextWeek: existingReview?.adjustmentNextWeek || "",
    
    // Setup Quality
    poiIdentificationScore: existingReview?.poiIdentificationScore || 7,
    inducementRecognitionScore2: existingReview?.inducementRecognitionScore2 || 7,
    entryExecutionScore: existingReview?.entryExecutionScore || 7,
    riskManagementScore: existingReview?.riskManagementScore || 7,
    overallSetupQualityScore: existingReview?.overallSetupQualityScore || 7,
    
    // Action Items
    topPriorityImprovement: existingReview?.topPriorityImprovement || "",
    specificActionToImprove: existingReview?.specificActionToImprove || "",
    successMetric: existingReview?.successMetric || "",
    secondPriority: existingReview?.secondPriority || "",
    setupsToAvoid: existingReview?.setupsToAvoid || "",
    confidenceNextWeek: existingReview?.confidenceNextWeek || 8,
    
    // Mental
    howFeeling: existingReview?.howFeeling || "",
    emotionsAffectedTrading: existingReview?.emotionsAffectedTrading || false,
    readinessScore: existingReview?.readinessScore || 8,
  });

  const [activeTab, setActiveTab] = useState("numbers");

  const tabs = [
    { id: "numbers", label: "Weekly Numbers" },
    { id: "compliance", label: "Trinity Compliance" },
    { id: "analysis", label: "Analysis" },
    { id: "action", label: "Action Items" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        totalTrades: Number(formData.totalTrades),
        winningTrades: Number(formData.winningTrades),
        losingTrades: Number(formData.losingTrades),
        totalPnl: Number(formData.totalPnl),
        biggestWin: Number(formData.biggestWin),
        biggestLoss: Number(formData.biggestLoss),
        avgWin: Number(formData.avgWin),
        avgLoss: Number(formData.avgLoss),
        profitFactor: Number(formData.profitFactor),
        inducementPercentage: Number(formData.inducementPercentage),
        ltcPercentage: Number(formData.ltcPercentage),
        killzonePercentage: Number(formData.killzonePercentage),
        avgTrinityScore: Number(formData.avgTrinityScore),
        tradesAgainstHtf: Number(formData.tradesAgainstHtf),
        narrativeAbilityScore: Number(formData.narrativeAbilityScore),
        avgPoiQualityScore: Number(formData.avgPoiQualityScore),
        prematureEntries: Number(formData.prematureEntries),
        prematureEntryCost: Number(formData.prematureEntryCost),
        forcedTrades: Number(formData.forcedTrades),
        waitedTrades: Number(formData.waitedTrades),
        patienceScore: Number(formData.patienceScore),
        patternConfidence: Number(formData.patternConfidence),
        poiIdentificationScore: Number(formData.poiIdentificationScore),
        inducementRecognitionScore2: Number(formData.inducementRecognitionScore2),
        entryExecutionScore: Number(formData.entryExecutionScore),
        riskManagementScore: Number(formData.riskManagementScore),
        overallSetupQualityScore: Number(formData.overallSetupQualityScore),
        confidenceNextWeek: Number(formData.confidenceNextWeek),
        readinessScore: Number(formData.readinessScore),
      };

      if (existingReview?._id) {
        // Update would go here
      } else {
        await createReview(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save weekly review:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {existingReview ? "Edit" : "New"} Weekly Review
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Week of {new Date(formData.weekStart).toLocaleDateString()} - {new Date(formData.weekEnd).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <div className="flex px-4 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === "numbers" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField label="Total Trades">
                    <input
                      type="number"
                      value={formData.totalTrades}
                      onChange={(e) => setFormData({ ...formData, totalTrades: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Winning Trades">
                    <input
                      type="number"
                      value={formData.winningTrades}
                      onChange={(e) => setFormData({ ...formData, winningTrades: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Losing Trades">
                    <input
                      type="number"
                      value={formData.losingTrades}
                      onChange={(e) => setFormData({ ...formData, losingTrades: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Total P&L ($)">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalPnl}
                      onChange={(e) => setFormData({ ...formData, totalPnl: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Biggest Win ($)">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.biggestWin}
                      onChange={(e) => setFormData({ ...formData, biggestWin: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Biggest Loss ($)">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.biggestLoss}
                      onChange={(e) => setFormData({ ...formData, biggestLoss: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Avg Win ($)">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.avgWin}
                      onChange={(e) => setFormData({ ...formData, avgWin: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Avg Loss ($)">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.avgLoss}
                      onChange={(e) => setFormData({ ...formData, avgLoss: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Trinity Compliance (%)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField label="Clear Inducement">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.inducementPercentage}
                        onChange={(e) => setFormData({ ...formData, inducementPercentage: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="LTC Confirmation">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.ltcPercentage}
                        onChange={(e) => setFormData({ ...formData, ltcPercentage: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="In Killzone">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.killzonePercentage}
                        onChange={(e) => setFormData({ ...formData, killzonePercentage: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Avg Trinity Score">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.avgTrinityScore}
                        onChange={(e) => setFormData({ ...formData, avgTrinityScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">POI Quality</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField label="Avg POI Score (1-10)">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.avgPoiQualityScore}
                        onChange={(e) => setFormData({ ...formData, avgPoiQualityScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Pristine/Clean Setups">
                      <input
                        type="number"
                        value={formData.pristineCleanSetups}
                        onChange={(e) => setFormData({ ...formData, pristineCleanSetups: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Questionable Setups">
                      <input
                        type="number"
                        value={formData.questionableSetups}
                        onChange={(e) => setFormData({ ...formData, questionableSetups: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Losses on Low Quality?">
                      <select
                        value={formData.lossesOnLowQuality ? "yes" : "no"}
                        onChange={(e) => setFormData({ ...formData, lossesOnLowQuality: e.target.value === "yes" })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Patience & Discipline</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField label="Forced Trades">
                      <input
                        type="number"
                        value={formData.forcedTrades}
                        onChange={(e) => setFormData({ ...formData, forcedTrades: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Waited Trades">
                      <input
                        type="number"
                        value={formData.waitedTrades}
                        onChange={(e) => setFormData({ ...formData, waitedTrades: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Forced Trades Lost More?">
                      <select
                        value={formData.forcedTradesLostMore ? "yes" : "no"}
                        onChange={(e) => setFormData({ ...formData, forcedTradesLostMore: e.target.value === "yes" })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </FormField>
                    <FormField label="Patience Score (1-10)">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.patienceScore}
                        onChange={(e) => setFormData({ ...formData, patienceScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analysis" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Best Trade</h3>
                  <FormField label="Description">
                    <textarea
                      value={formData.bestTradeDescription}
                      onChange={(e) => setFormData({ ...formData, bestTradeDescription: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Why it worked">
                    <textarea
                      value={formData.whyBestWorked}
                      onChange={(e) => setFormData({ ...formData, whyBestWorked: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Worst Trade</h3>
                  <FormField label="Description">
                    <textarea
                      value={formData.worstTradeDescription}
                      onChange={(e) => setFormData({ ...formData, worstTradeDescription: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Why it failed">
                    <textarea
                      value={formData.whyWorstFailed}
                      onChange={(e) => setFormData({ ...formData, whyWorstFailed: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Biggest Lessons</h3>
                  <FormField label="About the market">
                    <textarea
                      value={formData.biggestLessonMarket}
                      onChange={(e) => setFormData({ ...formData, biggestLessonMarket: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="About yourself">
                    <textarea
                      value={formData.biggestLessonSelf}
                      onChange={(e) => setFormData({ ...formData, biggestLessonSelf: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Adjustment for next week">
                    <textarea
                      value={formData.adjustmentNextWeek}
                      onChange={(e) => setFormData({ ...formData, adjustmentNextWeek: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Setup Quality Scores (1-10)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <FormField label="POI ID">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.poiIdentificationScore}
                        onChange={(e) => setFormData({ ...formData, poiIdentificationScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Inducement">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.inducementRecognitionScore2}
                        onChange={(e) => setFormData({ ...formData, inducementRecognitionScore2: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Entry">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.entryExecutionScore}
                        onChange={(e) => setFormData({ ...formData, entryExecutionScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Risk Mgmt">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.riskManagementScore}
                        onChange={(e) => setFormData({ ...formData, riskManagementScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Overall">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.overallSetupQualityScore}
                        onChange={(e) => setFormData({ ...formData, overallSetupQualityScore: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "action" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Focus Areas for Next Week</h3>
                  <FormField label="Top Priority">
                    <input
                      type="text"
                      value={formData.topPriorityImprovement}
                      onChange={(e) => setFormData({ ...formData, topPriorityImprovement: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Specific Action">
                    <textarea
                      value={formData.specificActionToImprove}
                      onChange={(e) => setFormData({ ...formData, specificActionToImprove: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Success Metric">
                    <input
                      type="text"
                      value={formData.successMetric}
                      onChange={(e) => setFormData({ ...formData, successMetric: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mental/Emotional</h3>
                  <FormField label="How are you feeling?">
                    <input
                      type="text"
                      value={formData.howFeeling}
                      onChange={(e) => setFormData({ ...formData, howFeeling: e.target.value })}
                      placeholder="disciplined / frustrated / calm / anxious"
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Emotions affected trading?">
                    <select
                      value={formData.emotionsAffectedTrading ? "yes" : "no"}
                      onChange={(e) => setFormData({ ...formData, emotionsAffectedTrading: e.target.value === "yes" })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </FormField>
                  <FormField label="Readiness Score (1-10)">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.readinessScore}
                      onChange={(e) => setFormData({ ...formData, readinessScore: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Confidence for Next Week (1-10)">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.confidenceNextWeek}
                      onChange={(e) => setFormData({ ...formData, confidenceNextWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Save Weekly Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
        {label}
      </label>
      {children}
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
