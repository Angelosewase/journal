import type { Doc } from "@/convex/_generated/dataModel";

type TradeFullLogContentProps = Readonly<{
  trade: Doc<"trades">;
}>;

export function TradeFullLogContent({ trade }: TradeFullLogContentProps) {
  return (
    <div className="space-y-6 ">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Entry / Exit" value={`${trade.entryPrice} / ${trade.exitPrice ?? "Open"}`} />
        <SummaryCard
          label="P&L"
          value={trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "Open"}
          valueClassName={
            trade.pnl !== undefined
              ? trade.pnl >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
              : undefined
          }
        />
        <SummaryCard label="Status" value={trade.winLossStatus} />
      </div>

      <Section title="Basic Info">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <Field label="Instrument" value={trade.instrument} />
          <Field label="Direction" value={trade.direction} />
          <Field label="Session" value={trade.session} />
          <Field label="Environment" value={trade.environment} />
          <Field label="Position Size" value={trade.positionSize} />
          <Field label="Commission" value={`$${trade.commission.toFixed(2)}`} />
          <Field label="Trade Model" value={trade.tradeModel} />
          <Field label="Closure Reason" value={trade.tradeClosureReason} />
        </div>
      </Section>

      <Section title="WWA Framework — Direction">
        <div className="space-y-3 text-sm">
          <Field label="Daily Bias" value={trade.dailyBias} />
          <Field label="External Structure" value={trade.externalStructure} />
          <Field label="Major Liquidity Pools" value={trade.majorLiquidityPools} />
          <Field label="Internal Structure" value={trade.internalStructure} />
          <Field label="Current Range" value={trade.currentRange} />
          <Field label="Minor Push Status" value={trade.minorPushStatus} />
          <Field label="Killzone" value={trade.isInKillzone ? "Yes" : "No"} />
        </div>
      </Section>

      <Section title="Point of Interest (POI)">
        <div className="space-y-3 text-sm">
          <Field label="Type" value={trade.poiType} />
          <Field label="Mitigation" value={trade.poiMitigationStatus.replace(/_/g, " ")} />
          <Field label="POI Quality" value={trade.poiQuality?.join(", ") || "N/A"} />
          <Field label="Description" value={trade.poiDescription} />
          <Field label="Clean Break" value={trade.cleanBreak === undefined ? undefined : trade.cleanBreak ? "Yes" : "No"} />
          <Field label="Gap Size" value={trade.gapSize} />
          <Field label="Break Size" value={trade.breakSize} />
          <Field label="Distance from POI" value={trade.distanceFromPoi} />
          <Field label="Inducement Resting" value={trade.inducementResting} />
          <Field label="Inducement Type" value={trade.inducementType} />
          <Field label="Liquidity Pool" value={trade.liquidityPoolDescription} />
          <Field label="Approach Dynamics" value={trade.approachDynamics} />
        </div>
      </Section>

      <Section title="Traps & Inducement">
        <div className="space-y-3 text-sm">
          <Field label="Trap Swept" value={trade.trapSwept} />
          <Field label="Trap Type" value={trade.trapType} />
          <Field label="Trap Location" value={trade.trapLocation !== undefined ? `${trade.trapLocation} pips from POI` : undefined} />
          <Field label="Trap Tapped Count" value={trade.trapTappedCount} />
          <Field label="Trap Cleanliness" value={trade.trapCleanliness} />
          <Field label="Liquidity Engineering" value={trade.liquidityEngineering} />
          <Field label="Liquidity Tapped Count" value={trade.liquidityTappedCount} />
          <Field label="Retail Behavior" value={trade.retailBehavior} />
          <Field label="Missing Inducement" value={trade.missingInducement ? "Yes (Reduced probability)" : "No"} />
        </div>
      </Section>

      <Section title="The Trinity & Entry">
        <div className="space-y-3 text-sm">
          <Field label="SMS After Trap" value={trade.smsAfterTrap ? "Yes" : "No"} />
          <Field label="LTF Entry Timeframe" value={trade.ltfEntryTimeframe} />
          <Field label="SMC Type" value={trade.smcType} />
          <Field label="BMS Pattern" value={trade.bmsPattern} />
          <Field label="BMS Confidence" value={trade.bmsConfidence !== undefined ? `${trade.bmsConfidence}/10` : undefined} />
          <Field label="Entry Confidence" value={trade.entryConfidence !== undefined ? `${trade.entryConfidence}/10` : undefined} />
          <Field label="RTO Applicable" value={trade.rtoApplicable ? "Yes" : "No"} />
          <Field label="RTO Distance" value={trade.rtoDistance} />
          <Field label="Followed Trinity" value={trade.followedTrinity === undefined ? undefined : trade.followedTrinity ? "Yes" : "No"} />
          <Field label="Trinity Violation" value={trade.trinityViolationExplanation} />
          <Field label="Correct Killzone" value={trade.correctKillzone === undefined ? undefined : trade.correctKillzone ? "Yes" : "No"} />
          <Field label="Narrative Alignment" value={trade.narrativeAlignment ? "Yes" : "No"} />
          <Field label="Trading With Main Push" value={trade.tradingWithMainPush ? "Yes" : "No"} />
          <Field label="No Narrative Misalignment" value={trade.noNarrativeMisalignment ? "Yes" : "No"} />
          <Field label="Clear Liquidity Engineering" value={trade.clearLiquidityEngineering} />
          <Field label="Institutions Reasoned" value={trade.institutionsReasoned === undefined ? undefined : trade.institutionsReasoned ? "Yes" : "No"} />
        </div>
      </Section>

      <Section title="Risk Management">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <Field label="Stop Loss" value={trade.stopLossPrice} />
          <Field label="SL Placement" value={trade.stopLossPlacement} />
          <Field label="SL Size" value={`${trade.stopLossPips} pips`} />
          <Field label="SL Quality" value={trade.stopLossQuality} />
          <Field label="Risk Amount" value={`$${trade.riskAmount.toFixed(2)}`} />
          <Field label="Risk %" value={`${trade.riskPercentage}%`} />
          <Field label="Target 1" value={`${trade.target1RR}:1 RR`} />
          <Field label="Target 2" value={`${trade.target2RR}:1 RR`} />
          <Field label="Target 1 Price" value={trade.target1Price} />
          <Field label="Target 2 Price" value={trade.target2Price} />
        </div>
      </Section>

      {trade.pnl !== undefined && (
        <Section title="Trade Outcome">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <Field label="Final R" value={trade.finalRR?.toFixed(1)} />
            <Field label="Quality Score" value={trade.tradeQualityScore !== undefined ? `${trade.tradeQualityScore}/10` : undefined} />
            <Field label="POI Quality Rating" value={trade.poiQualityRating} />
            <Field label="Inducement Quality" value={trade.inducementQualityRating} />
            <Field label="Trinity Alignment" value={trade.trinityAlignmentRating} />
            <Field label="Risk Execution" value={trade.riskExecutionRating} />
            <Field label="Discipline" value={trade.disciplineRating?.replace(/_/g, " ")} />
            <Field label="Discipline Score" value={trade.disciplineScore !== undefined ? `${trade.disciplineScore}/10` : undefined} />
            <Field label="Time in Trade" value={trade.timeInTradeMinutes !== undefined ? `${trade.timeInTradeMinutes} min` : undefined} />
            <Field label="Max Profit" value={trade.maxProfitReached} />
            <Field label="Max Drawdown" value={trade.maxDrawdown} />
            <Field label="Target 1 Hit" value={trade.target1Hit === undefined ? undefined : trade.target1Hit ? "Yes" : "No"} />
            <Field label="Target 2 Status" value={trade.target2Status} />
            <Field label="Manual Exit" value={trade.manualExit === undefined ? undefined : trade.manualExit ? "Yes" : "No"} />
            <Field label="Manual Exit Reason" value={trade.manualExitReason} />
          </div>
        </Section>
      )}

      <Section title="Trade Reflection">
        <div className="space-y-3 text-sm">
          <Field label="Why Entered" value={trade.whyEntered} />
          <Field label="What Happened" value={trade.expansionDescription ?? trade.surpriseDescription} />
          <Field label="Played as Expected" value={trade.playedAsExpected === undefined ? undefined : trade.playedAsExpected ? "Yes" : "No"} />
          <Field label="What Went Wrong" value={trade.whatWentWrong} />
          <Field label="What Went Right" value={trade.whatWentRight} />
          <Field label="Institutional Lessons" value={trade.institutionalLessons} />
          <Field label="How Affects Next" value={trade.howAffectsNext} />
          <Field label="Respected HTF Narrative" value={trade.respectedHTFNarrative === undefined ? undefined : trade.respectedHTFNarrative ? "Yes" : "No"} />
          <Field label="Waited for Inducement" value={trade.waitedForInducement === undefined ? undefined : trade.waitedForInducement ? "Yes" : "No"} />
          <Field label="Managed Risk Per Plan" value={trade.managedRiskPerPlan === undefined ? undefined : trade.managedRiskPerPlan ? "Yes" : "No"} />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: Readonly<{ label: string; value: string | number | undefined }>) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <span className="text-zinc-500 dark:text-zinc-400">{label}: </span>
      <span className="text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName,
}: Readonly<{ label: string; value: string; valueClassName?: string }>) {
  return (
    <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
      <p className="text-xs uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50 ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}
