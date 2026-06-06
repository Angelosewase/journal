import { Suspense } from "react";
import { DailyNotesContent } from "./daily-notes-content";

function DailyNotesFallback() {
  return (
    <div className="-m-4 flex min-h-[calc(100vh-3rem)] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-72 shrink-0 flex-col border-r border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:w-80">
        <div className="space-y-4 p-4">
          <div className="h-7 w-32 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="flex flex-col gap-2 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col bg-white dark:bg-zinc-950">
        <div className="h-14 shrink-0 border-b border-zinc-100 dark:border-zinc-800" />
        <div className="flex-1 p-10">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DailyNotesPage() {
  return (
    <Suspense fallback={<DailyNotesFallback />}>
      <DailyNotesContent />
    </Suspense>
  );
}
