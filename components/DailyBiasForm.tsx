"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

interface DailyBiasFormProps {
  onClose: () => void;
  mode?: "morning" | "evening";
  existingBias?: any;
}

export function DailyBiasForm({ onClose, mode = "morning", existingBias }: DailyBiasFormProps) {
  const createBias = useMutation(api.dailyBias.create);
  const updateBias = useMutation(api.dailyBias.update);
  const dailyBiases = useQuery(api.dailyBias.list);
  
  const today = new Date().toISOString().split("T")[0];
  const todayBias = existingBias || dailyBiases?.find((b: any) => b.date === today);
  
  const [formData, setFormData] = useState({
    // Morning
    currentDailyBias: todayBias?.currentDailyBias || "NEUTRAL",
    biasConfidence: todayBias?.biasConfidence || 5,
    biasReason: todayBias?.biasReason || "",
    asiaHigh: todayBias?.asiaHigh || "",
    asiaLow: todayBias?.asiaLow || "",
    previousDayHigh: todayBias?.previousDayHigh || "",
    previousDayLow: todayBias?.previousDayLow || "",
    
    asiaExpectedBehavior: todayBias?.asiaExpectedBehavior || "",
    asiaLiquidityToWatch: todayBias?.asiaLiquidityToWatch || "",
    asiaSetupTypes: todayBias?.asiaSetupTypes || "",
    londonExpectedBehavior: todayBias?.londonExpectedBehavior || "",
    londonBreakoutExpectation: todayBias?.londonBreakoutExpectation || "",
    londonKeyLiquidity: todayBias?.londonKeyLiquidity || "",
    nyExpectedBehavior: todayBias?.nyExpectedBehavior || "",
    nyTargets: todayBias?.nyTargets || "",
    nyKeyLiquidity: todayBias?.nyKeyLiquidity || "",
    
    bestInstrument: todayBias?.bestInstrument || "",
    bestInstrumentReason: todayBias?.bestInstrumentReason || "",
    secondChoice: todayBias?.secondChoice || "",
    secondChoiceReason: todayBias?.secondChoiceReason || "",
    avoidInstrument: todayBias?.avoidInstrument || "",
    avoidReason: todayBias?.avoidReason || "",
    sessionToTrade: todayBias?.sessionToTrade || "LONDON",
    supportLevels: todayBias?.supportLevels || "",
    resistanceLevels: todayBias?.resistanceLevels || "",
    equalHighsLows: todayBias?.equalHighsLows || "",
    trendlines: todayBias?.trendlines || "",
    modelToFocus: todayBias?.modelToFocus || "BOTH",
    minimumPoiQuality: todayBias?.minimumPoiQuality || "CLEAN",
    willTradeWithoutInducement: todayBias?.willTradeWithoutInducement || false,
    targetTrades: todayBias?.targetTrades || "",
    maxDailyLoss: todayBias?.maxDailyLoss || "",
    confidenceForToday: todayBias?.confidenceForToday || 5,
    
    // Evening
    actualMovement: todayBias?.actualMovement || "",
    wasCorrect: todayBias?.wasCorrect || "",
    accuracyScore: todayBias?.accuracyScore || 5,
    asiaExpected: todayBias?.asiaExpected || "",
    asiaActual: todayBias?.asiaActual || "",
    asiaSurprise: todayBias?.asiaSurprise || "",
    londonExpected: todayBias?.londonExpected || "",
    londonActual: todayBias?.londonActual || "",
    londonTrapsPresent: todayBias?.londonTrapsPresent || "",
    nyExpected: todayBias?.nyExpected || "",
    nyActual: todayBias?.nyActual || "",
    nyMajorMove: todayBias?.nyMajorMove || "",
    mostObviousTrap: todayBias?.mostObviousTrap || "",
    institutionsShowedHand: todayBias?.institutionsShowedHand || false,
    retailBehavior: todayBias?.retailBehavior || "",
    howAffectsTomorrow: todayBias?.howAffectsTomorrow || "",
    tradesTaken: todayBias?.tradesTaken || "",
    tradesWorked: todayBias?.tradesWorked || "",
    tradesFailed: todayBias?.tradesFailed || "",
    followedPlan: todayBias?.followedPlan || true,
    planViolationExplanation: todayBias?.planViolationExplanation || "",
    overallDiscipline: todayBias?.overallDiscipline || 5,
    tomorrowDirection: todayBias?.tomorrowDirection || "",
    tomorrowConfidence: todayBias?.tomorrowConfidence || 5,
    whatChanged: todayBias?.whatChanged || "",
    keyLevelsTomorrow: todayBias?.keyLevelsTomorrow || "",
  });

  const [activeTab, setActiveTab] = useState(mode === "evening" ? "evening" : "morning");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        date: today,
        asiaHigh: formData.asiaHigh ? Number(formData.asiaHigh) : undefined,
        asiaLow: formData.asiaLow ? Number(formData.asiaLow) : undefined,
        previousDayHigh: formData.previousDayHigh ? Number(formData.previousDayHigh) : undefined,
        previousDayLow: formData.previousDayLow ? Number(formData.previousDayLow) : undefined,
        targetTrades: formData.targetTrades ? Number(formData.targetTrades) : undefined,
        maxDailyLoss: formData.maxDailyLoss ? Number(formData.maxDailyLoss) : undefined,
        tradesTaken: formData.tradesTaken ? Number(formData.tradesTaken) : undefined,
        tradesWorked: formData.tradesWorked ? Number(formData.tradesWorked) : undefined,
        tradesFailed: formData.tradesFailed ? Number(formData.tradesFailed) : undefined,
      };

      if (todayBias?._id) {
        await updateBias({
          id: todayBias._id,
          date: today,
          currentDailyBias: formData.currentDailyBias as any,
          biasConfidence: Number(formData.biasConfidence),
          biasReason: formData.biasReason,
          asiaHigh: formData.asiaHigh ? Number(formData.asiaHigh) : undefined,
          asiaLow: formData.asiaLow ? Number(formData.asiaLow) : undefined,
          previousDayHigh: formData.previousDayHigh ? Number(formData.previousDayHigh) : undefined,
          previousDayLow: formData.previousDayLow ? Number(formData.previousDayLow) : undefined,
          htfPoiTargeted: undefined,
          asiaExpectedBehavior: formData.asiaExpectedBehavior,
          asiaLiquidityToWatch: formData.asiaLiquidityToWatch,
          asiaSetupTypes: formData.asiaSetupTypes,
          londonExpectedBehavior: formData.londonExpectedBehavior,
          londonBreakoutExpectation: formData.londonBreakoutExpectation,
          londonKeyLiquidity: formData.londonKeyLiquidity,
          nyExpectedBehavior: formData.nyExpectedBehavior,
          nyTargets: formData.nyTargets,
          nyKeyLiquidity: formData.nyKeyLiquidity,
          bestInstrument: formData.bestInstrument,
          bestInstrumentReason: formData.bestInstrumentReason,
          secondChoice: formData.secondChoice,
          secondChoiceReason: formData.secondChoiceReason,
          avoidInstrument: formData.avoidInstrument,
          avoidReason: formData.avoidReason,
          sessionToTrade: formData.sessionToTrade as any,
          supportLevels: formData.supportLevels,
          resistanceLevels: formData.resistanceLevels,
          equalHighsLows: formData.equalHighsLows,
          trendlines: formData.trendlines,
          modelToFocus: formData.modelToFocus as any,
          minimumPoiQuality: formData.minimumPoiQuality as any,
          willTradeWithoutInducement: formData.willTradeWithoutInducement,
          targetTrades: formData.targetTrades ? Number(formData.targetTrades) : undefined,
          maxDailyLoss: formData.maxDailyLoss ? Number(formData.maxDailyLoss) : undefined,
          confidenceForToday: Number(formData.confidenceForToday),
          actualMovement: formData.actualMovement as any,
          wasCorrect: formData.wasCorrect as any,
          accuracyScore: formData.accuracyScore ? Number(formData.accuracyScore) : undefined,
          asiaExpected: formData.asiaExpected,
          asiaActual: formData.asiaActual,
          asiaSurprise: formData.asiaSurprise,
          londonExpected: formData.londonExpected,
          londonActual: formData.londonActual,
          londonTrapsPresent: formData.londonTrapsPresent,
          nyExpected: formData.nyExpected,
          nyActual: formData.nyActual,
          nyMajorMove: formData.nyMajorMove,
          mostObviousTrap: formData.mostObviousTrap,
          institutionsShowedHand: formData.institutionsShowedHand || undefined,
          retailBehavior: formData.retailBehavior,
          howAffectsTomorrow: formData.howAffectsTomorrow,
          tradesTaken: formData.tradesTaken ? Number(formData.tradesTaken) : undefined,
          tradesWorked: formData.tradesWorked ? Number(formData.tradesWorked) : undefined,
          tradesFailed: formData.tradesFailed ? Number(formData.tradesFailed) : undefined,
          followedPlan: formData.followedPlan || undefined,
          planViolationExplanation: formData.planViolationExplanation,
          overallDiscipline: formData.overallDiscipline ? Number(formData.overallDiscipline) : undefined,
          tomorrowDirection: formData.tomorrowDirection as any,
          tomorrowConfidence: formData.tomorrowConfidence ? Number(formData.tomorrowConfidence) : undefined,
          whatChanged: formData.whatChanged,
          keyLevelsTomorrow: formData.keyLevelsTomorrow,
        });
      } else {
        await createBias(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save daily bias:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              {mode === "evening" ? "Evening Review" : "Morning Bias"}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab("morning")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "morning"
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
              }`}
            >
              Morning Bias
            </button>
            <button
              onClick={() => setActiveTab("evening")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "evening"
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
              }`}
            >
              Evening Review
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === "morning" && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Daily Bias</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Current Bias">
                      <select
                        value={formData.currentDailyBias}
                        onChange={(e) => setFormData({ ...formData, currentDailyBias: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="BULLISH">BULLISH</option>
                        <option value="BEARISH">BEARISH</option>
                        <option value="NEUTRAL">NEUTRAL</option>
                      </select>
                    </FormField>
                    <FormField label="Confidence (1-10)">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.biasConfidence}
                        onChange={(e) => setFormData({ ...formData, biasConfidence: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                  <FormField label="Reason for Bias">
                    <textarea
                      value={formData.biasReason}
                      onChange={(e) => setFormData({ ...formData, biasReason: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Liquidity Levels</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField label="Asia High">
                      <input
                        type="number"
                        step="0.00001"
                        value={formData.asiaHigh}
                        onChange={(e) => setFormData({ ...formData, asiaHigh: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Asia Low">
                      <input
                        type="number"
                        step="0.00001"
                        value={formData.asiaLow}
                        onChange={(e) => setFormData({ ...formData, asiaLow: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Prev Day High">
                      <input
                        type="number"
                        step="0.00001"
                        value={formData.previousDayHigh}
                        onChange={(e) => setFormData({ ...formData, previousDayHigh: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Prev Day Low">
                      <input
                        type="number"
                        step="0.00001"
                        value={formData.previousDayLow}
                        onChange={(e) => setFormData({ ...formData, previousDayLow: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Session Expectations</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="ASIA Expected Behavior">
                      <input
                        type="text"
                        value={formData.asiaExpectedBehavior}
                        onChange={(e) => setFormData({ ...formData, asiaExpectedBehavior: e.target.value })}
                        placeholder="RANGING / BREAKOUT / etc."
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="LONDON Expected">
                      <input
                        type="text"
                        value={formData.londonExpectedBehavior}
                        onChange={(e) => setFormData({ ...formData, londonExpectedBehavior: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="NY Expected">
                      <input
                        type="text"
                        value={formData.nyExpectedBehavior}
                        onChange={(e) => setFormData({ ...formData, nyExpectedBehavior: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Session to Trade">
                      <select
                        value={formData.sessionToTrade}
                        onChange={(e) => setFormData({ ...formData, sessionToTrade: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="ASIA">ASIA</option>
                        <option value="LONDON">LONDON</option>
                        <option value="NY">NEW YORK</option>
                        <option value="MULTIPLE">MULTIPLE</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Trading Plan</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Best Instrument">
                      <input
                        type="text"
                        value={formData.bestInstrument}
                        onChange={(e) => setFormData({ ...formData, bestInstrument: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Model to Focus">
                      <select
                        value={formData.modelToFocus}
                        onChange={(e) => setFormData({ ...formData, modelToFocus: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="CONTINUATION">CONTINUATION</option>
                        <option value="REVERSAL">REVERSAL</option>
                        <option value="BOTH">BOTH</option>
                      </select>
                    </FormField>
                    <FormField label="Min POI Quality">
                      <select
                        value={formData.minimumPoiQuality}
                        onChange={(e) => setFormData({ ...formData, minimumPoiQuality: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="PRISTINE">PRISTINE</option>
                        <option value="CLEAN">CLEAN</option>
                        <option value="ACCEPTABLE">ACCEPTABLE</option>
                      </select>
                    </FormField>
                    <FormField label="Confidence (1-10)">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.confidenceForToday}
                        onChange={(e) => setFormData({ ...formData, confidenceForToday: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                  <FormField label="Will trade without clear inducement?">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.willTradeWithoutInducement}
                        onChange={(e) => setFormData({ ...formData, willTradeWithoutInducement: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-300"
                      />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes (not recommended)</span>
                    </label>
                  </FormField>
                </div>
              </>
            )}

            {activeTab === "evening" && (
              <>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bias Accuracy</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField label="Morning Bias">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        formData.currentDailyBias === "BULLISH" ? "bg-emerald-100 text-emerald-700" :
                        formData.currentDailyBias === "BEARISH" ? "bg-red-100 text-red-700" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {formData.currentDailyBias}
                      </span>
                    </FormField>
                    <FormField label="Actual Movement">
                      <select
                        value={formData.actualMovement}
                        onChange={(e) => setFormData({ ...formData, actualMovement: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="">Select...</option>
                        <option value="BULLISH">BULLISH</option>
                        <option value="BEARISH">BEARISH</option>
                        <option value="NEUTRAL">NEUTRAL</option>
                        <option value="SIDEWAYS">SIDEWAYS</option>
                      </select>
                    </FormField>
                    <FormField label="Were you correct?">
                      <select
                        value={formData.wasCorrect}
                        onChange={(e) => setFormData({ ...formData, wasCorrect: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="">Select...</option>
                        <option value="YES">YES</option>
                        <option value="NO">NO</option>
                        <option value="PARTIAL">PARTIAL</option>
                      </select>
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">What Happened</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="ASIA Actual">
                      <input
                        type="text"
                        value={formData.asiaActual}
                        onChange={(e) => setFormData({ ...formData, asiaActual: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="LONDON Actual">
                      <input
                        type="text"
                        value={formData.londonActual}
                        onChange={(e) => setFormData({ ...formData, londonActual: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="NY Actual">
                      <input
                        type="text"
                        value={formData.nyActual}
                        onChange={(e) => setFormData({ ...formData, nyActual: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Most Obvious Trap">
                      <input
                        type="text"
                        value={formData.mostObviousTrap}
                        onChange={(e) => setFormData({ ...formData, mostObviousTrap: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Your Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Trades Taken">
                      <input
                        type="number"
                        value={formData.tradesTaken}
                        onChange={(e) => setFormData({ ...formData, tradesTaken: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Worked">
                      <input
                        type="number"
                        value={formData.tradesWorked}
                        onChange={(e) => setFormData({ ...formData, tradesWorked: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                    <FormField label="Failed">
                      <input
                        type="number"
                        value={formData.tradesFailed}
                        onChange={(e) => setFormData({ ...formData, tradesFailed: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                  <FormField label="Did you follow your plan?">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.followedPlan}
                        onChange={(e) => setFormData({ ...formData, followedPlan: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-300"
                      />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes</span>
                    </label>
                  </FormField>
                  <FormField label="Overall Discipline (1-10)">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.overallDiscipline}
                      onChange={(e) => setFormData({ ...formData, overallDiscipline: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tomorrow&apos;s Bias</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label="Expected Direction">
                      <select
                        value={formData.tomorrowDirection}
                        onChange={(e) => setFormData({ ...formData, tomorrowDirection: e.target.value as any })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="">Select...</option>
                        <option value="BULLISH">BULLISH</option>
                        <option value="BEARISH">BEARISH</option>
                        <option value="NEUTRAL">NEUTRAL</option>
                      </select>
                    </FormField>
                    <FormField label="Confidence (1-10)">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.tomorrowConfidence}
                        onChange={(e) => setFormData({ ...formData, tomorrowConfidence: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      />
                    </FormField>
                  </div>
                  <FormField label="What changed from today?">
                    <textarea
                      value={formData.whatChanged}
                      onChange={(e) => setFormData({ ...formData, whatChanged: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>
              </>
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
              Save
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
