"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, BookOpen, Database } from "lucide-react";
import { toast } from "sonner";
import { StrategyViewer } from "@/components/StrategyViewer";

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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Manage your journal data and strategy documents
        </p>
      </div>

      <Tabs defaultValue="strategies">
        <TabsList className="rounded-full bg-zinc-100 dark:bg-zinc-800/60 p-1">
          <TabsTrigger
            value="strategies"
            className="rounded-full data-[active]:bg-zinc-900 dark:data-[active]:bg-zinc-50 data-[active]:text-white dark:data-[active]:text-zinc-900 text-zinc-500 dark:text-zinc-400 px-4 py-1.5 text-xs font-semibold gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Strategies
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="rounded-full data-[active]:bg-zinc-900 dark:data-[active]:bg-zinc-50 data-[active]:text-white dark:data-[active]:text-zinc-900 text-zinc-500 dark:text-zinc-400 px-4 py-1.5 text-xs font-semibold gap-1.5"
          >
            <Database className="h-3.5 w-3.5" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="mt-6">
          <StrategyViewer />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your trading journal data for backup or import previous backups to restore your data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleExport} className="gap-2 rounded-full">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
              <Button variant="outline" onClick={handleImport} className="gap-2 rounded-full">
                <Upload className="h-4 w-4" />
                Import Backup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
