"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { TradeWizard } from "@/components/trade-wizard/TradeWizard";
import { buildFormFromTrade, formToTradePayload } from "@/lib/trade-form-state";

export default function EditTradePage() {
  const router = useRouter();
  const params = useParams();
  const tradeId = params.id as Id<"trades">;
  const trade = useQuery(api.trades.get, { id: tradeId });
  const updateTrade = useMutation(api.trades.update);

  const initialForm = useMemo(
    () => (trade ? buildFormFromTrade(trade) : {}),
    [trade],
  );

  if (!trade) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-50" />
          <p className="text-sm text-zinc-400">Loading trade…</p>
        </div>
      </div>
    );
  }

  return (
    <TradeWizard
      title="Edit Trade"
      subtitle={`${trade.instrument} · ${trade.direction}`}
      initialForm={initialForm}
      saveLabel="Update Trade"
      headerActions={
        <Link
          href={`/trades/${tradeId}`}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4 text-zinc-500" />
        </Link>
      }
      onCancel={() => router.push(`/trades/${tradeId}`)}
      onSave={async (form, partial) => {
        await updateTrade({
          id: tradeId,
          updates: formToTradePayload(form),
        });
        toast.success(partial ? "Changes saved!" : "Trade updated!");
        if (!partial) router.push(`/trades/${tradeId}`);
      }}
    />
  );
}
