"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, Info, TrendingUp, Target, Clock, Layers } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const allData = useQuery(api.trades.getAllData);

  const handleExport = () => {
    try {
      if (!allData) {
        toast.error("Data not loaded yet");
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
      toast.success("Data exported successfully!");
    } catch {
      toast.error("Failed to export data");
    }
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
        
        toast.success("Import functionality coming soon! Use this file to restore your data.");
      } catch {
        toast.error("Invalid backup file");
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your journal data and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export your trading journal data for backup or import previous backups to restore your data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export All Data
          </Button>
          <Button variant="outline" onClick={handleImport} className="gap-2">
            <Upload className="h-4 w-4" />
            Import Backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About WWA Trading Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium">Version 1.0.0</p>
          </div>
          <p className="text-sm text-muted-foreground">
            A personal trading journal built for the WWA (Waqar Asim) Trading Strategy.
            Track your trades, analyze your performance, and improve your discipline.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key WWA Concepts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="p-2 h-fit rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">DATE Framework</p>
                <p className="text-sm text-muted-foreground">
                  Direction → Area of Interest → Traps → Entry
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-2 h-fit rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">The Trinity</p>
                <p className="text-sm text-muted-foreground">
                  Inducement + LTC Confirmation + Killzone
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-2 h-fit rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">POI Types</p>
                <p className="text-sm text-muted-foreground">
                  Extreme POI (origin) and Decisional POI (last pullback)
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-2 h-fit rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium">Killzones</p>
                <p className="text-sm text-muted-foreground">
                  London Open (07:00-10:00 UTC) / NY Open (12:00-15:00 UTC)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
