"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type DayData = {
  date: string;
  trades: Array<{
    _id: string;
    instrument: string;
    direction: string;
    pnl?: number;
    winLossStatus: string;
    createdAt: number;
  }>;
  bias?: {
    currentDailyBias: string;
    biasConfidence: number;
    sessionToTrade: string;
    modelToFocus: string;
    actualMovement?: string;
    accuracyScore?: number;
    overallDiscipline?: number;
  };
  totalPnl: number;
  wins: number;
  losses: number;
  breakevens: number;
};

function getBiasIcon(bias: string) {
  switch (bias) {
    case "BULLISH": return <TrendingUp className="h-3 w-3" />;
    case "BEARISH": return <TrendingDown className="h-3 w-3" />;
    default: return <Minus className="h-3 w-3" />;
  }
}

function getBiasPillColor(bias: string) {
  switch (bias) {
    case "BULLISH": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "BEARISH": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

export default function CalendarPage() {
  const trades = useQuery(api.trades.list);
  const dailyBiases = useQuery(api.dailyBias.list);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const todayStr = today.toISOString().split("T")[0];

  const dayDataMap = useMemo(() => {
    if (!trades || !dailyBiases) return new Map<string, DayData>();

    const map = new Map<string, DayData>();

    for (const trade of trades) {
      const dateStr = new Date(trade.createdAt).toISOString().split("T")[0];
      if (!map.has(dateStr)) {
        map.set(dateStr, {
          date: dateStr,
          trades: [],
          totalPnl: 0,
          wins: 0,
          losses: 0,
          breakevens: 0,
        });
      }
      const day = map.get(dateStr)!;
      day.trades.push({
        _id: trade._id,
        instrument: trade.instrument,
        direction: trade.direction,
        pnl: trade.pnl,
        winLossStatus: trade.winLossStatus,
        createdAt: trade.createdAt,
      });
      day.totalPnl += trade.pnl || 0;
      if (trade.winLossStatus === "WIN") day.wins++;
      else if (trade.winLossStatus === "LOSS") day.losses++;
      else day.breakevens++;
    }

    for (const bias of dailyBiases) {
      const existing = map.get(bias.date);
      if (existing) {
        existing.bias = {
          currentDailyBias: bias.currentDailyBias,
          biasConfidence: bias.biasConfidence,
          sessionToTrade: bias.sessionToTrade,
          modelToFocus: bias.modelToFocus,
          actualMovement: bias.actualMovement,
          accuracyScore: bias.accuracyScore,
          overallDiscipline: bias.overallDiscipline,
        };
      } else {
        map.set(bias.date, {
          date: bias.date,
          trades: [],
          totalPnl: 0,
          wins: 0,
          losses: 0,
          breakevens: 0,
          bias: {
            currentDailyBias: bias.currentDailyBias,
            biasConfidence: bias.biasConfidence,
            sessionToTrade: bias.sessionToTrade,
            modelToFocus: bias.modelToFocus,
            actualMovement: bias.actualMovement,
            accuracyScore: bias.accuracyScore,
            overallDiscipline: bias.overallDiscipline,
          },
        });
      }
    }

    return map;
  }, [trades, dailyBiases]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const days: Array<{ date: Date | null; dateStr: string }> = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, dateStr: "" });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateStr = date.toISOString().split("T")[0];
      days.push({ date, dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const selectedDayData = selectedDate ? dayDataMap.get(selectedDate) : undefined;

  const getDayIndicatorColor = (day: DayData | undefined) => {
    if (!day || day.trades.length === 0) return "";
    if (day.totalPnl > 0) return "bg-emerald-500";
    if (day.totalPnl < 0) return "bg-red-400";
    return "bg-amber-500";
  };

  const openSheet = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSheetOpen(true);
  };

  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  if (!trades || !dailyBiases) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-[400px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">Overview</p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-0.5">Calendar</h1>
          </div>
          <button
            onClick={goToToday}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
          </button>
        </div>

        {/* Month overview strip */}
        {(() => {
          const monthDays = calendarDays
            .filter((d) => d.date !== null)
            .map((d) => dayDataMap.get(d.dateStr))
            .filter((d): d is DayData => d !== undefined && d.trades.length > 0);

          const monthTrades = monthDays.reduce((sum, d) => sum + d.trades.length, 0);
          const monthPnl = monthDays.reduce((sum, d) => sum + d.totalPnl, 0);
          const monthWins = monthDays.reduce((sum, d) => sum + d.wins, 0);
          const monthLosses = monthDays.reduce((sum, d) => sum + d.losses, 0);
          const tradingDays = monthDays.length;

          return (
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
                <div className="pr-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Trading Days</p>
                  <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">{tradingDays}</p>
                  <p className="text-xs text-zinc-400 mt-2">{monthTrades} total trades</p>
                </div>
                <div className="px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Monthly P&L</p>
                  <p className={`text-4xl font-bold leading-none ${monthPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {monthPnl >= 0 ? "+" : ""}${monthPnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">Realised profit / loss</p>
                </div>
                <div className="px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Win / Loss</p>
                  <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                    {monthWins}<span className="text-lg font-normal text-zinc-400">/{monthLosses}</span>
                  </p>
                  {monthTrades > 0 && (
                    <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden w-full">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(monthWins / monthTrades) * 100}%` }} />
                      <div className="bg-red-400 h-full" style={{ width: `${(monthLosses / monthTrades) * 100}%` }} />
                      <div className="bg-zinc-300 dark:bg-zinc-700 h-full" style={{ width: `${((monthTrades - monthWins - monthLosses) / monthTrades) * 100}%` }} />
                    </div>
                  )}
                </div>
                <div className="pl-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Win Rate</p>
                  <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                    {monthTrades > 0 ? `${Math.round((monthWins / monthTrades) * 100)}` : "—"}<span className="text-lg font-normal text-zinc-400">{monthTrades > 0 ? "%" : ""}</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">This month</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Calendar */}
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={nextMonth}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center py-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{day}</p>
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((cell, idx) => {
              if (!cell.date) {
                return <div key={`pad-${idx}`} className="h-14" />;
              }

              const dayData = dayDataMap.get(cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const hasTrades = dayData && dayData.trades.length > 0;
              const indicatorColor = getDayIndicatorColor(dayData);

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => openSheet(cell.dateStr)}
                  className={`h-12 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
                    isToday
                      ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                      : hasTrades
                        ? "bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <span className={`text-xs font-medium ${
                    isToday
                      ? "text-white dark:text-zinc-900"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}>
                    {cell.date.getDate()}
                  </span>
                  {indicatorColor && (
                    <div className={`h-1 w-1 rounded-full ${indicatorColor}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-zinc-400">Profitable</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <p className="text-[10px] text-zinc-400">Loss</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <p className="text-[10px] text-zinc-400">Break Even</p>
            </div>
          </div>
        </div>

        {/* Side Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800">
            <SheetHeader className="pt-4">
              <SheetTitle className="text-zinc-900 dark:text-zinc-50">{selectedDateFormatted}</SheetTitle>
            </SheetHeader>

            {selectedDayData ? (
              <div className="px-4 pb-6 space-y-4">
                {/* Summary strip */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Trades</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{selectedDayData.trades.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">P&L</p>
                      <p className={`text-2xl font-bold ${selectedDayData.totalPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {selectedDayData.totalPnl >= 0 ? "+" : ""}${selectedDayData.totalPnl.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">W/L</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        <span className="text-emerald-600">{selectedDayData.wins}</span>
                        <span className="text-zinc-400">/</span>
                        <span className="text-red-500">{selectedDayData.losses}</span>
                      </p>
                    </div>
                  </div>
                  {selectedDayData.trades.length > 0 && (
                    <div className="flex gap-0.5 mt-3 h-1.5 rounded-full overflow-hidden w-full">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(selectedDayData.wins / selectedDayData.trades.length) * 100}%` }} />
                      <div className="bg-red-400 h-full" style={{ width: `${(selectedDayData.losses / selectedDayData.trades.length) * 100}%` }} />
                      <div className="bg-zinc-300 dark:bg-zinc-700 h-full" style={{ width: `${(selectedDayData.breakevens / selectedDayData.trades.length) * 100}%` }} />
                    </div>
                  )}
                </div>

                {/* Bias info */}
                {selectedDayData.bias && (
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Morning Bias</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getBiasPillColor(selectedDayData.bias.currentDailyBias)}`}>
                        {getBiasIcon(selectedDayData.bias.currentDailyBias)}
                        {selectedDayData.bias.currentDailyBias}
                      </span>
                      <span className="text-xs text-zinc-400">Confidence: {selectedDayData.bias.biasConfidence}/10</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Session</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{selectedDayData.bias.sessionToTrade}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Model</p>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{selectedDayData.bias.modelToFocus}</p>
                      </div>
                    </div>
                    {selectedDayData.bias.accuracyScore !== undefined && (
                      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium mb-1">Evening Review</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Accuracy</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selectedDayData.bias.accuracyScore}<span className="text-xs font-normal text-zinc-400">/10</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">Discipline</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selectedDayData.bias.overallDiscipline ?? 0}<span className="text-xs font-normal text-zinc-400">/10</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trade list */}
                {selectedDayData.trades.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2 px-1">Trades</p>
                    <div className="space-y-1.5">
                      {selectedDayData.trades.map((trade) => {
                        const pnl = trade.pnl || 0;
                        return (
                          <Link
                            key={trade._id}
                            href={`/trades/${trade._id}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                trade.direction === "LONG"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}>
                                {trade.direction === "LONG" ? "L" : "S"}
                              </span>
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{trade.instrument}</p>
                            </div>
                            <p className={`text-sm font-bold ${pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {trade.pnl !== undefined ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` : "Open"}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View full day link */}
                <Link
                  href={`/calendar/${selectedDate}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                >
                  View Full Day <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="px-4 pb-6">
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-400">No activity on this day</p>
                  <Link
                    href={`/calendar/${selectedDate}`}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    View full day <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

      </div>
    </div>
  );
}
