"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function SettingsPage() {
  const allData = useQuery(api.trades.getAllData);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleExport = () => {
    try {
      if (!allData) {
        setStatus({ type: "error", message: "Data not loaded yet" });
        return;
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wwa-journal-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ type: "success", message: "Data exported successfully!" });
    } catch {
      setStatus({ type: "error", message: "Failed to export data" });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (!data.trades || !data.dailyBiases || !data.weeklyReviews) {
          throw new Error("Invalid backup file format");
        }
        
        setStatus({ type: "success", message: "Import functionality coming soon! Use this file to restore your data." });
      } catch {
        setStatus({ type: "error", message: "Invalid backup file" });
      }
      setTimeout(() => setStatus(null), 5000);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your journal data and preferences
        </p>
      </div>

      {status && (
        <div
          className={`p-4 rounded-lg ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
          Data Management
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Export your trading journal data for backup or import previous backups to restore your data.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <DownloadIcon />
            Export All Data
          </button>
          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <UploadIcon />
            Import Backup
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
          About WWA Trading Journal
        </h3>
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Version 1.0.0</p>
          <p>
            A personal trading journal built for the WWA (Waqar Asim) Trading Strategy.
            Track your trades, analyze your performance, and improve your discipline.
          </p>
        </div>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 mb-4">
          Key WWA Concepts
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">DATE Framework</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Direction → Area of Interest → Traps → Entry
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">The Trinity</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Inducement + LTC Confirmation + Killzone
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">POI Types</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Extreme POI (origin) and Decisional POI (last pullback)
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">Killzones</p>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              London Open (07:00-10:00 UTC) / NY Open (12:00-15:00 UTC)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
