import { Suspense } from "react";
import { NewTradeContent } from "./new-trade-content";

function NewTradeFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-4 w-64 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-48 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-96 w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

export default function NewTradePage() {
  return (
    <Suspense fallback={<NewTradeFallback />}>
      <NewTradeContent />
    </Suspense>
  );
}
