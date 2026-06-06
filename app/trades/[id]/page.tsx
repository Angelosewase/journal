"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import { TradeStoryView } from "@/components/TradeStoryView";

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params.id as Id<"trades">;
  const trade = useQuery(api.trades.get, { id: tradeId });
  const removeTrade = useMutation(api.trades.remove);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await removeTrade({ id: tradeId });
    router.push("/trades");
  };

  if (trade === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (trade === null) {
    return <p className="text-sm text-muted-foreground">Trade not found.</p>;
  }

  const date = new Date(trade.createdAt).toISOString().split("T")[0];

  return (
    <>
      <div className="mb-4 flex justify-end gap-2 px-1">
        <Link href={`/trades/${tradeId}/edit`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      <TradeStoryView trade={trade} dayTimelineHref={`/calendar/${date}`} />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete trade?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleDelete()}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
