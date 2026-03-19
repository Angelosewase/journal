"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const poiQualityOptions = ["IMBALANCE/FAIR_VALUE_GAP", "INDUCEMENT_RESTING", "CLEAN_BREAK"];

export default function NewTradePage() {
  const router = useRouter();
  const createTrade = useMutation(api.trades.create);

  const [formData, setFormData] = useState({
    instrument: "EUR/USD",
    direction: "LONG" as "LONG" | "SHORT",
    entryPrice: "",
    exitPrice: "",
    positionSize: "0.01",
    commission: "0",
    environment: "DEMO" as "BACKTESTING" | "DEMO" | "LIVE",
    dailyBias: "NEUTRAL" as "BULLISH" | "BEARISH" | "NEUTRAL",
    externalStructure: "",
    majorLiquidityPools: "",
    internalStructure: "",
    currentRange: "",
    minorPushStatus: "",
    session: "LONDON" as "ASIA" | "LONDON" | "NEW_YORK" | "OTHER",
    isInKillzone: true,
    poiType: "EXTREME" as "EXTREME" | "DECISIONAL",
    poiQuality: [] as string[],
    poiDescription: "",
    gapSize: "",
    inducementResting: "",
    inducementType: "",
    distanceFromPoi: "",
    cleanBreak: false,
    breakSize: "",
    trapSwept: "NO" as "YES" | "NO" | "PARTIAL",
    trapType: "",
    trapLocation: "",
    trapTappedCount: "",
    trapCleanliness: "",
    missingInducement: false,
    ltfEntryTimeframe: "5M",
    smcType: "",
    smsAfterTrap: false,
    bmsPattern: "",
    bmsConfidence: "5",
    rtoApplicable: false,
    rtoDistance: "",
    entryConfidence: "5",
    tradeModel: "CONTINUATION" as "CONTINUATION" | "REVERSAL",
    narrativeAlignment: true,
    tradingWithMainPush: true,
    noNarrativeMisalignment: true,
    clearLiquidityEngineering: "UNCLEAR",
    institutionsReasoned: false,
    poiMitigationStatus: "UNMITIGATED" as "UNMITIGATED" | "MITIGATED_ONCE" | "WEAKENED",
    approachDynamics: "",
    stopLossPrice: "",
    stopLossPlacement: "IFC_ABOVE",
    stopLossPips: "5",
    stopLossQuality: "CLEAN",
    riskAmount: "10",
    riskPercentage: "1",
    target1RR: "3",
    target2RR: "10",
    timeInTradeMinutes: "",
    maxProfitReached: "",
    maxDrawdown: "",
    target1Hit: false,
    stopMovedToBE: false,
    target2Status: "",
    manualExit: false,
    manualExitReason: "",
    tradeClosureReason: "OPEN",
    pnl: "",
    winLossStatus: "BREAK_EVEN" as "WIN" | "LOSS" | "BREAK_EVEN",
    tradeQualityScore: "5",
    poiQualityRating: "ACCEPTABLE",
    inducementQualityRating: "CLEAR",
    trinityAlignmentRating: "ACCEPTABLE",
    riskExecutionRating: "GOOD",
    disciplineRating: "MINOR_RUSH",
    whyEntered: "",
    playedAsExpected: true,
    whatWentWrong: "",
    whatWentRight: "",
    institutionalLessons: "",
    followedTrinity: true,
    correctKillzone: true,
    respectedHTFNarrative: true,
    waitedForInducement: true,
    managedRiskPerPlan: true,
    disciplineScore: "5",
  });

  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrade({
        instrument: formData.instrument,
        direction: formData.direction,
        entryPrice: Number(formData.entryPrice),
        exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
        currentPrice: undefined,
        positionSize: Number(formData.positionSize),
        commission: Number(formData.commission),
        environment: formData.environment,
        dailyBias: formData.dailyBias,
        externalStructure: formData.externalStructure,
        majorLiquidityPools: formData.majorLiquidityPools,
        internalStructure: formData.internalStructure,
        currentRange: formData.currentRange,
        minorPushStatus: formData.minorPushStatus,
        session: formData.session,
        isInKillzone: formData.isInKillzone,
        poiType: formData.poiType,
        poiQuality: formData.poiQuality,
        poiDescription: formData.poiDescription || undefined,
        gapSize: formData.gapSize ? Number(formData.gapSize) : undefined,
        inducementResting: formData.inducementResting || undefined,
        inducementType: formData.inducementType || undefined,
        distanceFromPoi: formData.distanceFromPoi ? Number(formData.distanceFromPoi) : undefined,
        liquidityPoolDescription: undefined,
        cleanBreak: formData.cleanBreak || undefined,
        breakSize: formData.breakSize ? Number(formData.breakSize) : undefined,
        trapSwept: formData.trapSwept,
        trapType: formData.trapType || undefined,
        trapLocation: formData.trapLocation ? Number(formData.trapLocation) : undefined,
        trapTappedCount: formData.trapTappedCount ? Number(formData.trapTappedCount) : undefined,
        trapCleanliness: formData.trapCleanliness || undefined,
        liquidityEngineering: undefined,
        liquidityTappedCount: undefined,
        retailBehavior: undefined,
        missingInducement: formData.missingInducement,
        ltfEntryTimeframe: formData.ltfEntryTimeframe || undefined,
        smcType: formData.smcType || undefined,
        smsAfterTrap: formData.smsAfterTrap,
        bmsPattern: formData.bmsPattern || undefined,
        bmsConfidence: Number(formData.bmsConfidence),
        rtoApplicable: formData.rtoApplicable,
        rtoDistance: formData.rtoDistance ? Number(formData.rtoDistance) : undefined,
        entryConfidence: Number(formData.entryConfidence),
        tradeModel: formData.tradeModel,
        narrativeAlignment: formData.narrativeAlignment,
        tradingWithMainPush: formData.tradingWithMainPush,
        noNarrativeMisalignment: formData.noNarrativeMisalignment,
        clearLiquidityEngineering: formData.clearLiquidityEngineering || undefined,
        institutionsReasoned: formData.institutionsReasoned || undefined,
        poiMitigationStatus: formData.poiMitigationStatus,
        approachDynamics: formData.approachDynamics || undefined,
        stopLossPrice: Number(formData.stopLossPrice),
        stopLossPlacement: formData.stopLossPlacement,
        stopLossPips: Number(formData.stopLossPips),
        stopLossQuality: formData.stopLossQuality,
        riskAmount: Number(formData.riskAmount),
        riskPercentage: Number(formData.riskPercentage),
        target1RR: Number(formData.target1RR),
        target2RR: Number(formData.target2RR),
        target1Price: undefined,
        target2Price: undefined,
        timeInTradeMinutes: formData.timeInTradeMinutes ? Number(formData.timeInTradeMinutes) : undefined,
        maxProfitReached: formData.maxProfitReached ? Number(formData.maxProfitReached) : undefined,
        maxDrawdown: formData.maxDrawdown ? Number(formData.maxDrawdown) : undefined,
        target1Hit: formData.target1Hit || undefined,
        target1HitPrice: undefined,
        stopMovedToBE: formData.stopMovedToBE || undefined,
        timeToTarget1: undefined,
        target2Status: formData.target2Status || undefined,
        target2ClosedAt: undefined,
        finalRR: undefined,
        timeToClose: undefined,
        breakEvenStopsMoved: undefined,
        manualExit: formData.manualExit || undefined,
        manualExitReason: formData.manualExitReason || undefined,
        manualExitAligned: undefined,
        tradeClosureReason: formData.tradeClosureReason,
        pnl: formData.pnl ? Number(formData.pnl) : undefined,
        pnlPercentage: undefined,
        winLossStatus: formData.winLossStatus,
        tradeQualityScore: Number(formData.tradeQualityScore),
        poiQualityRating: formData.poiQualityRating,
        inducementQualityRating: formData.inducementQualityRating,
        trinityAlignmentRating: formData.trinityAlignmentRating,
        riskExecutionRating: formData.riskExecutionRating,
        disciplineRating: formData.disciplineRating,
        whyEntered: formData.whyEntered || undefined,
        playedAsExpected: formData.playedAsExpected,
        expansionDescription: undefined,
        surpriseDescription: undefined,
        whatWentWrong: formData.whatWentWrong || undefined,
        whatWentRight: formData.whatWentRight || undefined,
        institutionalLessons: formData.institutionalLessons || undefined,
        howAffectsNext: undefined,
        followedTrinity: formData.followedTrinity,
        trinityViolationExplanation: undefined,
        correctKillzone: formData.correctKillzone,
        respectedHTFNarrative: formData.respectedHTFNarrative,
        waitedForInducement: formData.waitedForInducement,
        managedRiskPerPlan: formData.managedRiskPerPlan,
        disciplineScore: Number(formData.disciplineScore),
      });
      toast.success("Trade logged successfully!");
      router.push("/trades");
    } catch (error) {
      toast.error("Failed to save trade");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trades">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Log New Trade</h1>
          <p className="text-sm text-muted-foreground">Record your trade with the WWA framework</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="direction">Direction</TabsTrigger>
            <TabsTrigger value="poi">POI</TabsTrigger>
            <TabsTrigger value="traps">Traps</TabsTrigger>
            <TabsTrigger value="trinity">Trinity</TabsTrigger>
            <TabsTrigger value="execution">Execution</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="postentry">Post</TabsTrigger>
            <TabsTrigger value="outcome">Outcome</TabsTrigger>
            <TabsTrigger value="reflection">Reflection</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core trade details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument</Label>
                  <Select value={formData.instrument} onValueChange={(v) => setFormData({ ...formData, instrument: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {instruments.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direction">Direction</Label>
                  <Select value={formData.direction} onValueChange={(v: "LONG" | "SHORT") => setFormData({ ...formData, direction: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LONG">LONG</SelectItem>
                      <SelectItem value="SHORT">SHORT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryPrice">Entry Price</Label>
                  <Input id="entryPrice" type="number" step="0.00001" value={formData.entryPrice} onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input id="exitPrice" type="number" step="0.00001" value={formData.exitPrice} onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="positionSize">Position Size</Label>
                  <Input id="positionSize" type="number" step="0.01" value={formData.positionSize} onChange={(e) => setFormData({ ...formData, positionSize: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select value={formData.environment} onValueChange={(v: "BACKTESTING" | "DEMO" | "LIVE") => setFormData({ ...formData, environment: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACKTESTING">Backtesting</SelectItem>
                      <SelectItem value="DEMO">Demo</SelectItem>
                      <SelectItem value="LIVE">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Direction & Analysis</CardTitle>
                <CardDescription>WWA Framework - Daily structure and bias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dailyBias">Daily Bias</Label>
                    <Select value={formData.dailyBias} onValueChange={(v: "BULLISH" | "BEARISH" | "NEUTRAL") => setFormData({ ...formData, dailyBias: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BULLISH">BULLISH</SelectItem>
                        <SelectItem value="BEARISH">BEARISH</SelectItem>
                        <SelectItem value="NEUTRAL">NEUTRAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session">Session</Label>
                    <Select value={formData.session} onValueChange={(v: "ASIA" | "LONDON" | "NEW_YORK" | "OTHER") => setFormData({ ...formData, session: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASIA">ASIA</SelectItem>
                        <SelectItem value="LONDON">LONDON</SelectItem>
                        <SelectItem value="NEW_YORK">NEW YORK</SelectItem>
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="isInKillzone" checked={formData.isInKillzone} onCheckedChange={(checked) => setFormData({ ...formData, isInKillzone: !!checked })} />
                  <Label htmlFor="isInKillzone">In Killzone (London/NY Open)</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalStructure">External Structure (Main Push)</Label>
                  <Textarea id="externalStructure" value={formData.externalStructure} onChange={(e) => setFormData({ ...formData, externalStructure: e.target.value })} placeholder="Describe the main push and structure..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="majorLiquidityPools">Major Liquidity Pools</Label>
                  <Textarea id="majorLiquidityPools" value={formData.majorLiquidityPools} onChange={(e) => setFormData({ ...formData, majorLiquidityPools: e.target.value })} placeholder="Asia High, Asia Low, Previous D POI..." />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="poi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Point of Interest (POI)</CardTitle>
                <CardDescription>WWA Framework - Where institutions react</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>POI Type</Label>
                    <Select value={formData.poiType} onValueChange={(v: "EXTREME" | "DECISIONAL") => setFormData({ ...formData, poiType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXTREME">EXTREME (Origin of Main Push)</SelectItem>
                        <SelectItem value="DECISIONAL">DECISIONAL (Last Pullback)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>POI Mitigation Status</Label>
                    <Select value={formData.poiMitigationStatus} onValueChange={(v: "UNMITIGATED" | "MITIGATED_ONCE" | "WEAKENED") => setFormData({ ...formData, poiMitigationStatus: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNMITIGATED">Unmitigated (Fresh Zone)</SelectItem>
                        <SelectItem value="MITIGATED_ONCE">Mitigated Once</SelectItem>
                        <SelectItem value="WEAKENED">Weakened (Multiple taps)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>POI Quality (select all that apply)</Label>
                  <div className="flex flex-wrap gap-4">
                    {poiQualityOptions.map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <Checkbox
                          id={`poi-${opt}`}
                          checked={formData.poiQuality.includes(opt)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, poiQuality: [...formData.poiQuality, opt] });
                            } else {
                              setFormData({ ...formData, poiQuality: formData.poiQuality.filter((q) => q !== opt) });
                            }
                          }}
                        />
                        <Label htmlFor={`poi-${opt}`}>{opt.replace(/_/g, " ")}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poiDescription">POI Description</Label>
                  <Textarea id="poiDescription" value={formData.poiDescription} onChange={(e) => setFormData({ ...formData, poiDescription: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cleanBreak" checked={formData.cleanBreak} onCheckedChange={(checked) => setFormData({ ...formData, cleanBreak: !!checked })} />
                  <Label htmlFor="cleanBreak">Clean Break (convincing structure break)</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Traps & Inducement</CardTitle>
                <CardDescription>WWA Framework - Liquidity engineering and traps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Trap Swept?</Label>
                    <Select value={formData.trapSwept} onValueChange={(v: "YES" | "NO" | "PARTIAL") => setFormData({ ...formData, trapSwept: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YES">YES</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                        <SelectItem value="PARTIAL">PARTIAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trapType">Trap Type</Label>
                    <Input id="trapType" value={formData.trapType} onChange={(e) => setFormData({ ...formData, trapType: e.target.value })} placeholder="Inducement of Control/Target/SMT" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trapLocation">Trap Location (pips from POI)</Label>
                  <Input id="trapLocation" type="number" step="0.1" value={formData.trapLocation} onChange={(e) => setFormData({ ...formData, trapLocation: e.target.value })} />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="missingInducement" checked={formData.missingInducement} onCheckedChange={(checked) => setFormData({ ...formData, missingInducement: !!checked })} />
                  <Label htmlFor="missingInducement">Missing Inducement (Reduces probability)</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trinity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>The Trinity</CardTitle>
                <CardDescription>All 3 required for high-probability trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className={`p-4 rounded-lg border ${formData.trapSwept === "YES" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                    <p className="font-medium">1. Inducement</p>
                    <p className="text-sm text-muted-foreground">{formData.trapSwept === "YES" ? "Present" : "Missing"}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${formData.smsAfterTrap ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                    <p className="font-medium">2. LTC Confirmation</p>
                    <p className="text-sm text-muted-foreground">{formData.smsAfterTrap ? "SMS after trap" : "Not confirmed"}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${formData.isInKillzone ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}>
                    <p className="font-medium">3. Killzone</p>
                    <p className="text-sm text-muted-foreground">{formData.isInKillzone ? "In Zone" : "Outside"}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-2">
                  <Checkbox id="smsAfterTrap" checked={formData.smsAfterTrap} onCheckedChange={(checked) => setFormData({ ...formData, smsAfterTrap: !!checked })} />
                  <Label htmlFor="smsAfterTrap">SMS (Shift in Market Structure) after trap sweep</Label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ltfEntryTimeframe">LTF Entry Timeframe</Label>
                    <Select value={formData.ltfEntryTimeframe} onValueChange={(v) => setFormData({ ...formData, ltfEntryTimeframe: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1M">1M</SelectItem>
                        <SelectItem value="5M">5M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryConfidence">Entry Confidence (1-10)</Label>
                    <Input id="entryConfidence" type="number" min="1" max="10" value={formData.entryConfidence} onChange={(e) => setFormData({ ...formData, entryConfidence: e.target.value })} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="execution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade Execution</CardTitle>
                <CardDescription>Narrative alignment and approach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Trade Model</Label>
                  <Select value={formData.tradeModel} onValueChange={(v: "CONTINUATION" | "REVERSAL") => setFormData({ ...formData, tradeModel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONTINUATION">CONTINUATION MODEL</SelectItem>
                      <SelectItem value="REVERSAL">REVERSAL MODEL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Narrative Alignment Check</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="narrativeAlignment" checked={formData.narrativeAlignment} onCheckedChange={(checked) => setFormData({ ...formData, narrativeAlignment: !!checked })} />
                      <Label htmlFor="narrativeAlignment">HTF narrative supports this trade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tradingWithMainPush" checked={formData.tradingWithMainPush} onCheckedChange={(checked) => setFormData({ ...formData, tradingWithMainPush: !!checked })} />
                      <Label htmlFor="tradingWithMainPush">Trading WITH the Main Push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="noNarrativeMisalignment" checked={formData.noNarrativeMisalignment} onCheckedChange={(checked) => setFormData({ ...formData, noNarrativeMisalignment: !!checked })} />
                      <Label htmlFor="noNarrativeMisalignment">No narrative misalignment</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approachDynamics">Approach Dynamics</Label>
                  <Input id="approachDynamics" value={formData.approachDynamics} onChange={(e) => setFormData({ ...formData, approachDynamics: e.target.value })} placeholder="Compression (CP) / V-Shape / Other" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management</CardTitle>
                <CardDescription>Stop loss and position sizing</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stopLossPrice">Stop Loss Price</Label>
                  <Input id="stopLossPrice" type="number" step="0.00001" value={formData.stopLossPrice} onChange={(e) => setFormData({ ...formData, stopLossPrice: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stopLossPips">Stop Loss Size (pips)</Label>
                  <Input id="stopLossPips" type="number" step="0.1" value={formData.stopLossPips} onChange={(e) => setFormData({ ...formData, stopLossPips: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Stop Loss Placement</Label>
                  <Select value={formData.stopLossPlacement} onValueChange={(v) => setFormData({ ...formData, stopLossPlacement: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IFC_ABOVE">IFC ABOVE</SelectItem>
                      <SelectItem value="IFC_BELOW">IFC BELOW</SelectItem>
                      <SelectItem value="REFINED_WICK">REFINED WICK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskAmount">Risk Amount ($)</Label>
                  <Input id="riskAmount" type="number" step="0.01" value={formData.riskAmount} onChange={(e) => setFormData({ ...formData, riskAmount: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskPercentage">Risk % of Account</Label>
                  <Input id="riskPercentage" type="number" step="0.1" value={formData.riskPercentage} onChange={(e) => setFormData({ ...formData, riskPercentage: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target1RR">Target 1 RR</Label>
                  <Input id="target1RR" type="number" step="0.1" value={formData.target1RR} onChange={(e) => setFormData({ ...formData, target1RR: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target2RR">Target 2 RR</Label>
                  <Input id="target2RR" type="number" step="0.1" value={formData.target2RR} onChange={(e) => setFormData({ ...formData, target2RR: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="postentry" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Post-Entry Management</CardTitle>
                <CardDescription>Trade progression and management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timeInTradeMinutes">Time in Trade (minutes)</Label>
                    <Input id="timeInTradeMinutes" type="number" value={formData.timeInTradeMinutes} onChange={(e) => setFormData({ ...formData, timeInTradeMinutes: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxProfitReached">Max Profit Reached (pips)</Label>
                    <Input id="maxProfitReached" type="number" step="0.1" value={formData.maxProfitReached} onChange={(e) => setFormData({ ...formData, maxProfitReached: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDrawdown">Max Drawdown (pips)</Label>
                    <Input id="maxDrawdown" type="number" step="0.1" value={formData.maxDrawdown} onChange={(e) => setFormData({ ...formData, maxDrawdown: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Trade Closure Reason</Label>
                    <Select value={formData.tradeClosureReason} onValueChange={(v) => setFormData({ ...formData, tradeClosureReason: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="HIT_TARGET_1_RUNNING">HIT TARGET 1 & RUNNING</SelectItem>
                        <SelectItem value="HIT_TARGET_2_COMPLETELY">HIT TARGET 2 COMPLETELY</SelectItem>
                        <SelectItem value="STOPPED_OUT">STOPPED OUT</SelectItem>
                        <SelectItem value="MANUAL_EXIT">MANUAL EXIT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="target1Hit" checked={formData.target1Hit} onCheckedChange={(checked) => setFormData({ ...formData, target1Hit: !!checked })} />
                  <Label htmlFor="target1Hit">Target 1 Hit?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="manualExit" checked={formData.manualExit} onCheckedChange={(checked) => setFormData({ ...formData, manualExit: !!checked })} />
                  <Label htmlFor="manualExit">Manual Exit?</Label>
                </div>
                {formData.manualExit && (
                  <div className="space-y-2">
                    <Label htmlFor="manualExitReason">Manual Exit Reason</Label>
                    <Input id="manualExitReason" value={formData.manualExitReason} onChange={(e) => setFormData({ ...formData, manualExitReason: e.target.value })} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outcome" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade Outcome</CardTitle>
                <CardDescription>Final results and quality assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pnl">P&L ($)</Label>
                    <Input id="pnl" type="number" step="0.01" value={formData.pnl} onChange={(e) => setFormData({ ...formData, pnl: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Win/Loss Status</Label>
                    <Select value={formData.winLossStatus} onValueChange={(v: "WIN" | "LOSS" | "BREAK_EVEN") => setFormData({ ...formData, winLossStatus: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WIN">WIN</SelectItem>
                        <SelectItem value="LOSS">LOSS</SelectItem>
                        <SelectItem value="BREAK_EVEN">BREAK EVEN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tradeQualityScore">Quality Score (1-10)</Label>
                    <Input id="tradeQualityScore" type="number" min="1" max="10" value={formData.tradeQualityScore} onChange={(e) => setFormData({ ...formData, tradeQualityScore: e.target.value })} />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>POI Quality</Label>
                    <Select value={formData.poiQualityRating} onValueChange={(v) => setFormData({ ...formData, poiQualityRating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRISTINE">PRISTINE</SelectItem>
                        <SelectItem value="CLEAN">CLEAN</SelectItem>
                        <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                        <SelectItem value="QUESTIONABLE">QUESTIONABLE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Inducement Quality</Label>
                    <Select value={formData.inducementQualityRating} onValueChange={(v) => setFormData({ ...formData, inducementQualityRating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OBVIOUS">OBVIOUS</SelectItem>
                        <SelectItem value="CLEAR">CLEAR</SelectItem>
                        <SelectItem value="SUBTLE">SUBTLE</SelectItem>
                        <SelectItem value="MISSING">MISSING</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trinity Alignment</Label>
                    <Select value={formData.trinityAlignmentRating} onValueChange={(v) => setFormData({ ...formData, trinityAlignmentRating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERFECT">PERFECT</SelectItem>
                        <SelectItem value="STRONG">STRONG</SelectItem>
                        <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                        <SelectItem value="WEAK">WEAK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Risk Execution</Label>
                    <Select value={formData.riskExecutionRating} onValueChange={(v) => setFormData({ ...formData, riskExecutionRating: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FLAWLESS">FLAWLESS</SelectItem>
                        <SelectItem value="GOOD">GOOD</SelectItem>
                        <SelectItem value="ACCEPTABLE">ACCEPTABLE</SelectItem>
                        <SelectItem value="POOR">POOR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <Select value={formData.disciplineRating} onValueChange={(v) => setFormData({ ...formData, disciplineRating: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERFECT_WAIT">PERFECT WAIT</SelectItem>
                      <SelectItem value="MINOR_RUSH">MINOR RUSH</SelectItem>
                      <SelectItem value="IMPATIENT">IMPATIENT</SelectItem>
                      <SelectItem value="FORCED">FORCED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reflection" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade Reflection</CardTitle>
                <CardDescription>Learn from your trade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whyEntered">Why did you enter this trade?</Label>
                  <Textarea id="whyEntered" value={formData.whyEntered} onChange={(e) => setFormData({ ...formData, whyEntered: e.target.value })} placeholder="Describe the setup..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="playedAsExpected" checked={formData.playedAsExpected} onCheckedChange={(checked) => setFormData({ ...formData, playedAsExpected: !!checked })} />
                  <Label htmlFor="playedAsExpected">Did the move play out as expected?</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatWentWrong">What went wrong? (if losing)</Label>
                  <Textarea id="whatWentWrong" value={formData.whatWentWrong} onChange={(e) => setFormData({ ...formData, whatWentWrong: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatWentRight">What went right? (if winning)</Label>
                  <Textarea id="whatWentRight" value={formData.whatWentRight} onChange={(e) => setFormData({ ...formData, whatWentRight: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionalLessons">Institutional Lessons</Label>
                  <Textarea id="institutionalLessons" value={formData.institutionalLessons} onChange={(e) => setFormData({ ...formData, institutionalLessons: e.target.value })} placeholder="What did institutions do?" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Rule Adherence</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="followedTrinity" checked={formData.followedTrinity} onCheckedChange={(checked) => setFormData({ ...formData, followedTrinity: !!checked })} />
                      <Label htmlFor="followedTrinity">Followed the Trinity</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="correctKillzone" checked={formData.correctKillzone} onCheckedChange={(checked) => setFormData({ ...formData, correctKillzone: !!checked })} />
                      <Label htmlFor="correctKillzone">Used correct Killzone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="waitedForInducement" checked={formData.waitedForInducement} onCheckedChange={(checked) => setFormData({ ...formData, waitedForInducement: !!checked })} />
                      <Label htmlFor="waitedForInducement">Waited for clear inducement</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disciplineScore">Discipline Score (1-10)</Label>
                  <Input id="disciplineScore" type="number" min="1" max="10" value={formData.disciplineScore} onChange={(e) => setFormData({ ...formData, disciplineScore: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/trades">Cancel</Link>
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Save Trade
          </Button>
        </div>
      </form>
    </div>
  );
}
