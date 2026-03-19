"use client";

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

interface TradeFormProps {
  onClose: () => void;
  trade?: any;
}

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const poiQualityOptions = ["IMBALANCE/FAIR_VALUE_GAP", "INDUCEMENT_RESTING", "CLEAN_BREAK"];

export function TradeForm({ onClose, trade }: TradeFormProps) {
  const createTrade = useMutation(api.trades.create);
  const updateTrade = useMutation(api.trades.update);
  
  const [formData, setFormData] = useState({
    // Basic Info
    instrument: trade?.instrument || "EUR/USD",
    direction: trade?.direction || "LONG",
    entryPrice: trade?.entryPrice || 0,
    exitPrice: trade?.exitPrice || "",
    currentPrice: trade?.currentPrice || "",
    positionSize: trade?.positionSize || 0.01,
    commission: trade?.commission || 0,
    environment: trade?.environment || "DEMO",
    
    // Direction & Analysis
    dailyBias: trade?.dailyBias || "NEUTRAL",
    externalStructure: trade?.externalStructure || "",
    majorLiquidityPools: trade?.majorLiquidityPools || "",
    internalStructure: trade?.internalStructure || "",
    currentRange: trade?.currentRange || "",
    minorPushStatus: trade?.minorPushStatus || "",
    session: trade?.session || "LONDON",
    isInKillzone: trade?.isInKillzone || true,
    
    // POI
    poiType: trade?.poiType || "EXTREME",
    poiQuality: trade?.poiQuality || [],
    poiDescription: trade?.poiDescription || "",
    gapSize: trade?.gapSize || "",
    inducementResting: trade?.inducementResting || "",
    inducementType: trade?.inducementType || "",
    distanceFromPoi: trade?.distanceFromPoi || "",
    cleanBreak: trade?.cleanBreak || false,
    breakSize: trade?.breakSize || "",
    
    // Traps
    trapSwept: trade?.trapSwept || "NO",
    trapType: trade?.trapType || "",
    trapLocation: trade?.trapLocation || "",
    trapTappedCount: trade?.trapTappedCount || "",
    trapCleanliness: trade?.trapCleanliness || "",
    missingInducement: trade?.missingInducement || false,
    
    // Trinity
    ltfEntryTimeframe: trade?.ltfEntryTimeframe || "5M",
    smcType: trade?.smcType || "",
    smsAfterTrap: trade?.smsAfterTrap || false,
    bmsPattern: trade?.bmsPattern || "",
    bmsConfidence: trade?.bmsConfidence || 5,
    rtoApplicable: trade?.rtoApplicable || false,
    rtoDistance: trade?.rtoDistance || "",
    entryConfidence: trade?.entryConfidence || 5,
    
    // Execution
    tradeModel: trade?.tradeModel || "CONTINUATION",
    narrativeAlignment: trade?.narrativeAlignment || true,
    tradingWithMainPush: trade?.tradingWithMainPush || true,
    noNarrativeMisalignment: trade?.noNarrativeMisalignment || true,
    clearLiquidityEngineering: trade?.clearLiquidityEngineering || "UNCLEAR",
    institutionsReasoned: trade?.institutionsReasoned || false,
    poiMitigationStatus: trade?.poiMitigationStatus || "UNMITIGATED",
    approachDynamics: trade?.approachDynamics || "",
    
    // Risk Management
    stopLossPrice: trade?.stopLossPrice || 0,
    stopLossPlacement: trade?.stopLossPlacement || "IFC_ABOVE",
    stopLossPips: trade?.stopLossPips || 5,
    stopLossQuality: trade?.stopLossQuality || "CLEAN",
    riskAmount: trade?.riskAmount || 10,
    riskPercentage: trade?.riskPercentage || 1,
    target1RR: trade?.target1RR || 3,
    target2RR: trade?.target2RR || 10,
    
    // Post-Entry
    timeInTradeMinutes: trade?.timeInTradeMinutes || "",
    maxProfitReached: trade?.maxProfitReached || "",
    maxDrawdown: trade?.maxDrawdown || "",
    target1Hit: trade?.target1Hit || false,
    stopMovedToBE: trade?.stopMovedToBE || false,
    target2Status: trade?.target2Status || "",
    manualExit: trade?.manualExit || false,
    manualExitReason: trade?.manualExitReason || "",
    tradeClosureReason: trade?.tradeClosureReason || "OPEN",
    
    // Outcome
    pnl: trade?.pnl || "",
    winLossStatus: trade?.winLossStatus || "BREAK_EVEN",
    tradeQualityScore: trade?.tradeQualityScore || 5,
    poiQualityRating: trade?.poiQualityRating || "ACCEPTABLE",
    inducementQualityRating: trade?.inducementQualityRating || "CLEAR",
    trinityAlignmentRating: trade?.trinityAlignmentRating || "ACCEPTABLE",
    riskExecutionRating: trade?.riskExecutionRating || "GOOD",
    disciplineRating: trade?.disciplineRating || "MINOR_RUSH",
    
    // Reflection
    whyEntered: trade?.whyEntered || "",
    playedAsExpected: trade?.playedAsExpected || true,
    whatWentWrong: trade?.whatWentWrong || "",
    whatWentRight: trade?.whatWentRight || "",
    institutionalLessons: trade?.institutionalLessons || "",
    followedTrinity: trade?.followedTrinity || true,
    correctKillzone: trade?.correctKillzone || true,
    respectedHTFNarrative: trade?.respectedHTFNarrative || true,
    waitedForInducement: trade?.waitedForInducement || true,
    managedRiskPerPlan: trade?.managedRiskPerPlan || true,
    disciplineScore: trade?.disciplineScore || 5,
  });

  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        currentPrice: formData.currentPrice ? Number(formData.currentPrice) : undefined,
        gapSize: formData.gapSize ? Number(formData.gapSize) : undefined,
        distanceFromPoi: formData.distanceFromPoi ? Number(formData.distanceFromPoi) : undefined,
        trapLocation: formData.trapLocation ? Number(formData.trapLocation) : undefined,
        trapTappedCount: formData.trapTappedCount ? Number(formData.trapTappedCount) : undefined,
        breakSize: formData.breakSize ? Number(formData.breakSize) : undefined,
        bmsConfidence: Number(formData.bmsConfidence),
        entryConfidence: Number(formData.entryConfidence),
        rtoDistance: formData.rtoDistance ? Number(formData.rtoDistance) : undefined,
        stopLossPrice: Number(formData.stopLossPrice),
        stopLossPips: Number(formData.stopLossPips),
        riskAmount: Number(formData.riskAmount),
        riskPercentage: Number(formData.riskPercentage),
        target1RR: Number(formData.target1RR),
        target2RR: Number(formData.target2RR),
        timeInTradeMinutes: formData.timeInTradeMinutes ? Number(formData.timeInTradeMinutes) : undefined,
        maxProfitReached: formData.maxProfitReached ? Number(formData.maxProfitReached) : undefined,
        maxDrawdown: formData.maxDrawdown ? Number(formData.maxDrawdown) : undefined,
        pnl: formData.pnl ? Number(formData.pnl) : undefined,
        tradeQualityScore: Number(formData.tradeQualityScore),
        disciplineScore: Number(formData.disciplineScore),
        poiQuality: formData.poiQuality,
      };

      if (trade?._id) {
        await updateTrade({ id: trade._id, updates: data });
      } else {
        await createTrade(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save trade:", error);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "direction", label: "Direction & Analysis" },
    { id: "poi", label: "POI" },
    { id: "traps", label: "Traps & Inducement" },
    { id: "trinity", label: "Trinity" },
    { id: "execution", label: "Execution" },
    { id: "risk", label: "Risk Management" },
    { id: "postentry", label: "Post-Entry" },
    { id: "outcome", label: "Outcome" },
    { id: "reflection", label: "Reflection" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {trade ? "Edit Trade" : "Log New Trade"}
          </h2>
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
                    : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === "basic" && (
              <div className="grid md:grid-cols-2 gap-4">
                <FormField label="Instrument">
                  <select
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    {instruments.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Direction">
                  <select
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value as "LONG" | "SHORT" })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </FormField>
                <FormField label="Entry Price">
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Exit Price">
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Position Size">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.positionSize}
                    onChange={(e) => setFormData({ ...formData, positionSize: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Commission/Spread ($)">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Environment">
                  <select
                    value={formData.environment}
                    onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="BACKTESTING">Backtesting</option>
                    <option value="DEMO">Demo</option>
                    <option value="LIVE">Live</option>
                  </select>
                </FormField>
              </div>
            )}

            {activeTab === "direction" && (
              <div className="space-y-4">
                <FormField label="Daily Bias">
                  <select
                    value={formData.dailyBias}
                    onChange={(e) => setFormData({ ...formData, dailyBias: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="BULLISH">BULLISH</option>
                    <option value="BEARISH">BEARISH</option>
                    <option value="NEUTRAL">NEUTRAL</option>
                  </select>
                </FormField>
                <FormField label="External Structure (Main Push)">
                  <textarea
                    value={formData.externalStructure}
                    onChange={(e) => setFormData({ ...formData, externalStructure: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="Describe the main push and structure..."
                  />
                </FormField>
                <FormField label="Major Liquidity Pools">
                  <textarea
                    value={formData.majorLiquidityPools}
                    onChange={(e) => setFormData({ ...formData, majorLiquidityPools: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="Asia High, Asia Low, Previous D POI..."
                  />
                </FormField>
                <FormField label="Internal Structure">
                  <textarea
                    value={formData.internalStructure}
                    onChange={(e) => setFormData({ ...formData, internalStructure: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Session">
                  <select
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="ASIA">ASIA</option>
                    <option value="LONDON">LONDON</option>
                    <option value="NEW_YORK">NEW YORK</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </FormField>
                <FormField label="In Killzone?">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isInKillzone}
                      onChange={(e) => setFormData({ ...formData, isInKillzone: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes</span>
                  </label>
                </FormField>
              </div>
            )}

            {activeTab === "poi" && (
              <div className="space-y-4">
                <FormField label="POI Type">
                  <select
                    value={formData.poiType}
                    onChange={(e) => setFormData({ ...formData, poiType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="EXTREME">EXTREME (Origin of Main Push)</option>
                    <option value="DECISIONAL">DECISIONAL (Last Pullback)</option>
                  </select>
                </FormField>
                <FormField label="POI Quality (select all that apply)">
                  <div className="space-y-2">
                    {poiQualityOptions.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.poiQuality.includes(opt)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, poiQuality: [...formData.poiQuality, opt] });
                            } else {
                              setFormData({ ...formData, poiQuality: formData.poiQuality.filter((q: string) => q !== opt) });
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-300"
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{opt.replace(/_/g, " ")}</span>
                      </label>
                    ))}
                  </div>
                </FormField>
                <FormField label="POI Description">
                  <textarea
                    value={formData.poiDescription}
                    onChange={(e) => setFormData({ ...formData, poiDescription: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="POI Mitigation Status">
                  <select
                    value={formData.poiMitigationStatus}
                    onChange={(e) => setFormData({ ...formData, poiMitigationStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="UNMITIGATED">Unmitigated (Fresh Zone)</option>
                    <option value="MITIGATED_ONCE">Mitigated Once (Tapped once)</option>
                    <option value="WEAKENED">Weakened (Multiple taps)</option>
                  </select>
                </FormField>
                <FormField label="Clean Break?">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.cleanBreak}
                      onChange={(e) => setFormData({ ...formData, cleanBreak: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes</span>
                  </label>
                </FormField>
              </div>
            )}

            {activeTab === "traps" && (
              <div className="space-y-4">
                <FormField label="Trap Swept?">
                  <select
                    value={formData.trapSwept}
                    onChange={(e) => setFormData({ ...formData, trapSwept: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                    <option value="PARTIAL">PARTIAL</option>
                  </select>
                </FormField>
                <FormField label="Trap Type">
                  <input
                    type="text"
                    value={formData.trapType}
                    onChange={(e) => setFormData({ ...formData, trapType: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="INDUCEMENT OF CONTROL / TARGET / SMART MONEY TRAP"
                  />
                </FormField>
                <FormField label="Trap Location (pips from POI)">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.trapLocation}
                    onChange={(e) => setFormData({ ...formData, trapLocation: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Missing Inducement?">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.missingInducement}
                      onChange={(e) => setFormData({ ...formData, missingInducement: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes (Reduces probability)</span>
                  </label>
                </FormField>
              </div>
            )}

            {activeTab === "trinity" && (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-3">
                  <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300">The Trinity (all 3 required):</p>
                  <FormField label="1. Inducement (Trap swept?)">
                    <span className={`text-sm ${formData.trapSwept === "YES" ? "text-emerald-600" : "text-red-600"}`}>
                      {formData.trapSwept === "YES" ? "✓ YES" : "✗ " + formData.trapSwept}
                    </span>
                  </FormField>
                  <FormField label="2. LTC Confirmation">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.smsAfterTrap}
                        onChange={(e) => setFormData({ ...formData, smsAfterTrap: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-300"
                      />
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">SMS after trap sweep</span>
                    </label>
                  </FormField>
                  <FormField label="3. Killzone Time">
                    <span className={`text-sm ${formData.isInKillzone ? "text-emerald-600" : "text-red-600"}`}>
                      {formData.isInKillzone ? "✓ In Killzone" : "✗ Outside Killzone"}
                    </span>
                  </FormField>
                </div>
                <FormField label="LTF Entry Timeframe">
                  <select
                    value={formData.ltfEntryTimeframe}
                    onChange={(e) => setFormData({ ...formData, ltfEntryTimeframe: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="1M">1M</option>
                    <option value="5M">5M</option>
                  </select>
                </FormField>
                <FormField label="SMC Type">
                  <input
                    type="text"
                    value={formData.smcType}
                    onChange={(e) => setFormData({ ...formData, smcType: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="HIGHER HIGH + HIGHER LOW, etc."
                  />
                </FormField>
                <FormField label="BMS Confidence (1-10)">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.bmsConfidence}
                    onChange={(e) => setFormData({ ...formData, bmsConfidence: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Entry Confidence (1-10)">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.entryConfidence}
                    onChange={(e) => setFormData({ ...formData, entryConfidence: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
              </div>
            )}

            {activeTab === "execution" && (
              <div className="space-y-4">
                <FormField label="Trade Model">
                  <select
                    value={formData.tradeModel}
                    onChange={(e) => setFormData({ ...formData, tradeModel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="CONTINUATION">CONTINUATION MODEL</option>
                    <option value="REVERSAL">REVERSAL MODEL</option>
                  </select>
                </FormField>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Narrative Alignment Check:</p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.narrativeAlignment}
                      onChange={(e) => setFormData({ ...formData, narrativeAlignment: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">HTF narrative supports this trade</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.tradingWithMainPush}
                      onChange={(e) => setFormData({ ...formData, tradingWithMainPush: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Trading WITH the Main Push</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.noNarrativeMisalignment}
                      onChange={(e) => setFormData({ ...formData, noNarrativeMisalignment: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">No narrative misalignment</span>
                  </label>
                </div>
                <FormField label="Approach Dynamics">
                  <input
                    type="text"
                    value={formData.approachDynamics}
                    onChange={(e) => setFormData({ ...formData, approachDynamics: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="Compression (CP) / V-Shape / Other"
                  />
                </FormField>
              </div>
            )}

            {activeTab === "risk" && (
              <div className="space-y-4">
                <FormField label="Stop Loss Price">
                  <input
                    type="number"
                    step="0.00001"
                    value={formData.stopLossPrice}
                    onChange={(e) => setFormData({ ...formData, stopLossPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Stop Loss Placement">
                  <select
                    value={formData.stopLossPlacement}
                    onChange={(e) => setFormData({ ...formData, stopLossPlacement: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="IFC_ABOVE">IFC ABOVE</option>
                    <option value="IFC_BELOW">IFC BELOW</option>
                    <option value="REFINED_WICK">REFINED WICK</option>
                  </select>
                </FormField>
                <FormField label="Stop Loss Size (pips)">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.stopLossPips}
                    onChange={(e) => setFormData({ ...formData, stopLossPips: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Risk Amount ($)">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.riskAmount}
                    onChange={(e) => setFormData({ ...formData, riskAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Risk % of Account">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.riskPercentage}
                    onChange={(e) => setFormData({ ...formData, riskPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Target 1 RR">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.target1RR}
                      onChange={(e) => setFormData({ ...formData, target1RR: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                  <FormField label="Target 2 RR">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.target2RR}
                      onChange={(e) => setFormData({ ...formData, target2RR: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === "postentry" && (
              <div className="space-y-4">
                <FormField label="Time in Trade (minutes)">
                  <input
                    type="number"
                    value={formData.timeInTradeMinutes}
                    onChange={(e) => setFormData({ ...formData, timeInTradeMinutes: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Max Profit Reached (pips)">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxProfitReached}
                    onChange={(e) => setFormData({ ...formData, maxProfitReached: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Max Drawdown (pips)">
                  <input
                    type="number"
                    step="0.1"
                    value={formData.maxDrawdown}
                    onChange={(e) => setFormData({ ...formData, maxDrawdown: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Target 1 Hit?">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.target1Hit}
                      onChange={(e) => setFormData({ ...formData, target1Hit: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes</span>
                  </label>
                </FormField>
                <FormField label="Manual Exit?">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.manualExit}
                      onChange={(e) => setFormData({ ...formData, manualExit: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes</span>
                  </label>
                </FormField>
                {formData.manualExit && (
                  <FormField label="Manual Exit Reason">
                    <input
                      type="text"
                      value={formData.manualExitReason}
                      onChange={(e) => setFormData({ ...formData, manualExitReason: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    />
                  </FormField>
                )}
                <FormField label="Trade Closure Reason">
                  <select
                    value={formData.tradeClosureReason}
                    onChange={(e) => setFormData({ ...formData, tradeClosureReason: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="OPEN">Open</option>
                    <option value="HIT_TARGET_1_RUNNING">HIT TARGET 1 & RUNNING</option>
                    <option value="HIT_TARGET_2_COMPLETELY">HIT TARGET 2 COMPLETELY</option>
                    <option value="STOPPED_OUT">STOPPED OUT</option>
                    <option value="MANUAL_EXIT">MANUAL EXIT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </FormField>
              </div>
            )}

            {activeTab === "outcome" && (
              <div className="space-y-4">
                <FormField label="P&L ($)">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pnl}
                    onChange={(e) => setFormData({ ...formData, pnl: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Win/Loss Status">
                  <select
                    value={formData.winLossStatus}
                    onChange={(e) => setFormData({ ...formData, winLossStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                    <option value="BREAK_EVEN">BREAK EVEN</option>
                  </select>
                </FormField>
                <FormField label="Trade Quality Score (1-10)">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.tradeQualityScore}
                    onChange={(e) => setFormData({ ...formData, tradeQualityScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="POI Quality">
                    <select
                      value={formData.poiQualityRating}
                      onChange={(e) => setFormData({ ...formData, poiQualityRating: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="PRISTINE">PRISTINE</option>
                      <option value="CLEAN">CLEAN</option>
                      <option value="ACCEPTABLE">ACCEPTABLE</option>
                      <option value="QUESTIONABLE">QUESTIONABLE</option>
                    </select>
                  </FormField>
                  <FormField label="Inducement Quality">
                    <select
                      value={formData.inducementQualityRating}
                      onChange={(e) => setFormData({ ...formData, inducementQualityRating: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="OBVIOUS">OBVIOUS</option>
                      <option value="CLEAR">CLEAR</option>
                      <option value="SUBTLE">SUBTLE</option>
                      <option value="MISSING">MISSING</option>
                    </select>
                  </FormField>
                  <FormField label="Trinity Alignment">
                    <select
                      value={formData.trinityAlignmentRating}
                      onChange={(e) => setFormData({ ...formData, trinityAlignmentRating: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="PERFECT">PERFECT</option>
                      <option value="STRONG">STRONG</option>
                      <option value="ACCEPTABLE">ACCEPTABLE</option>
                      <option value="WEAK">WEAK</option>
                    </select>
                  </FormField>
                  <FormField label="Risk Execution">
                    <select
                      value={formData.riskExecutionRating}
                      onChange={(e) => setFormData({ ...formData, riskExecutionRating: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="FLAWLESS">FLAWLESS</option>
                      <option value="GOOD">GOOD</option>
                      <option value="ACCEPTABLE">ACCEPTABLE</option>
                      <option value="POOR">POOR</option>
                    </select>
                  </FormField>
                  <FormField label="Discipline">
                    <select
                      value={formData.disciplineRating}
                      onChange={(e) => setFormData({ ...formData, disciplineRating: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="PERFECT_WAIT">PERFECT WAIT</option>
                      <option value="MINOR_RUSH">MINOR RUSH</option>
                      <option value="IMPATIENT">IMPATIENT</option>
                      <option value="FORCED">FORCED</option>
                    </select>
                  </FormField>
                </div>
              </div>
            )}

            {activeTab === "reflection" && (
              <div className="space-y-4">
                <FormField label="Why did you enter this trade?">
                  <textarea
                    value={formData.whyEntered}
                    onChange={(e) => setFormData({ ...formData, whyEntered: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="Describe the setup in your own words..."
                  />
                </FormField>
                <FormField label="Did the move play out as expected?">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.playedAsExpected}
                      onChange={(e) => setFormData({ ...formData, playedAsExpected: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Yes</span>
                  </label>
                </FormField>
                <FormField label="What went wrong? (if losing)">
                  <textarea
                    value={formData.whatWentWrong}
                    onChange={(e) => setFormData({ ...formData, whatWentWrong: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="What went right? (if winning)">
                  <textarea
                    value={formData.whatWentRight}
                    onChange={(e) => setFormData({ ...formData, whatWentRight: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
                <FormField label="Institutional Lessons">
                  <textarea
                    value={formData.institutionalLessons}
                    onChange={(e) => setFormData({ ...formData, institutionalLessons: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="What did institutions do in this trade?"
                  />
                </FormField>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Rule Adherence:</p>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.followedTrinity}
                      onChange={(e) => setFormData({ ...formData, followedTrinity: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Followed the Trinity</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.correctKillzone}
                      onChange={(e) => setFormData({ ...formData, correctKillzone: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Used correct Killzone</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.waitedForInducement}
                      onChange={(e) => setFormData({ ...formData, waitedForInducement: e.target.checked })}
                      className="w-4 h-4 rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Waited for clear inducement</span>
                  </label>
                </div>
                <FormField label="Discipline Score (1-10)">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.disciplineScore}
                    onChange={(e) => setFormData({ ...formData, disciplineScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </FormField>
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
              {trade ? "Update Trade" : "Log Trade"}
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
