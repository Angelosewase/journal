"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { TradeForm } from "@/components/TradeForm";
import { TradeDetail } from "@/components/TradeDetail";

const instruments = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "GBP/JPY"];
const sessions = ["ASIA", "LONDON", "NEW_YORK", "OTHER"];
const models = ["CONTINUATION", "REVERSAL"];
const environments = ["BACKTESTING", "DEMO", "LIVE"];
const winLossOptions = ["WIN", "LOSS", "BREAK_EVEN"];

export default function TradesPage() {
  const trades = useQuery(api.trades.list);
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [filters, setFilters] = useState({
    environment: "",
    instrument: "",
    session: "",
    tradeModel: "",
    winLossStatus: "",
    startDate: "",
    endDate: "",
  });

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    return trades.filter((trade) => {
      if (filters.environment && trade.environment !== filters.environment) return false;
      if (filters.instrument && trade.instrument !== filters.instrument) return false;
      if (filters.session && trade.session !== filters.session) return false;
      if (filters.tradeModel && trade.tradeModel !== filters.tradeModel) return false;
      if (filters.winLossStatus && trade.winLossStatus !== filters.winLossStatus) return false;
      if (filters.startDate && new Date(trade.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(trade.createdAt) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [trades, filters]);

  const selectedTradeData = trades?.find((t) => t._id === selectedTrade);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Trade Log</h1>
        <button
          onClick={() => setShowTradeForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <PlusIcon />
          Add Trade
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={filters.environment}
            onChange={(e) => setFilters({ ...filters, environment: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Environment</option>
            {environments.map((env) => (
              <option key={env} value={env}>{env}</option>
            ))}
          </select>
          <select
            value={filters.instrument}
            onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Instrument</option>
            {instruments.map((inst) => (
              <option key={inst} value={inst}>{inst}</option>
            ))}
          </select>
          <select
            value={filters.session}
            onChange={(e) => setFilters({ ...filters, session: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Session</option>
            {sessions.map((sess) => (
              <option key={sess} value={sess}>{sess}</option>
            ))}
          </select>
          <select
            value={filters.tradeModel}
            onChange={(e) => setFilters({ ...filters, tradeModel: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Model</option>
            {models.map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <select
            value={filters.winLossStatus}
            onChange={(e) => setFilters({ ...filters, winLossStatus: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">Result</option>
            {winLossOptions.map((wl) => (
              <option key={wl} value={wl}>{wl}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Instrument</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Session</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Direction</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">P&L</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">RR</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredTrades.map((trade) => (
                <tr
                  key={trade._id}
                  onClick={() => setSelectedTrade(trade._id)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {trade.instrument}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {trade.session}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {trade.tradeModel}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                        trade.direction === "LONG"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {trade.direction}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    (trade.pnl || 0) >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {trade.pnl !== undefined ? `$${trade.pnl.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-zinc-600 dark:text-zinc-400">
                    {trade.finalRR ? `${trade.finalRR.toFixed(1)}:1` : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${
                        trade.winLossStatus === "WIN"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : trade.winLossStatus === "LOSS"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {trade.winLossStatus || "Open"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {trade.tradeQualityScore ? `${trade.tradeQualityScore}/10` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTrades.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No trades found matching your filters.
            </div>
          )}
        </div>
      </div>

      {showTradeForm && (
        <TradeForm onClose={() => setShowTradeForm(false)} />
      )}

      {selectedTrade && selectedTradeData && (
        <TradeDetail
          trade={selectedTradeData}
          onClose={() => setSelectedTrade(null)}
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

function FilterIcon() {
  return (
    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}
