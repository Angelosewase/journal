"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { AccountForm } from "@/components/AccountForm";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatMoney, formatPercent } from "@/lib/format";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

interface AccountWithSummary {
  _id: Id<"accounts">;
  name: string;
  startingBalance: number;
  currentBalance: number;
  currency: string;
  leverage?: number;
  createdAt: number;
  totalTrades: number;
  netProfit: number;
  percentReturn: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTradePnl: number;
}

function AccountCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="mb-4 h-4 w-36" />
      <Skeleton className="mb-5 h-7 w-44" />
      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
      <div className="mt-4 grid grid-cols-3 gap-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </div>
  );
}

function AccountCard({
  account,
  onEdit,
  onDelete,
  onOpen,
}: {
  account: AccountWithSummary;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const isPositive = account.netProfit >= 0;

  return (
    <div
      className="group relative cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      onClick={onOpen}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
            {account.name}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {account.currency}
            {account.leverage ? ` · ${account.leverage}x` : ""}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Balance */}
      <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {formatMoney(account.currentBalance ?? 0, account.currency)}
      </p>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Current balance</p>

      {/* Divider */}
      <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Net P&L</p>
          <p className={cn(
            "mt-0.5 text-sm font-semibold",
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
          )}>
            {formatMoney(account.netProfit, account.currency, { showSign: true })}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Return</p>
          <p className={cn(
            "mt-0.5 text-sm font-semibold",
            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
          )}>
            {formatPercent(account.percentReturn)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Trades</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {account.totalTrades}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const router = useRouter();
  const accounts = useQuery(api.accounts.getAccountsWithSummary);
  const removeAccount = useMutation(api.accounts.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AccountWithSummary | null>(null);

  const portfolio = useMemo(() => {
    if (!accounts?.length) return null;
    const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance ?? 0), 0);
    const totalNetProfit = accounts.reduce((sum, a) => sum + a.netProfit, 0);
    const totalTrades = accounts.reduce((sum, a) => sum + a.totalTrades, 0);
    const currency = accounts[0]?.currency ?? "USD";
    return { totalBalance, totalNetProfit, totalTrades, currency, count: accounts.length };
  }, [accounts]);

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeAccount({ id: deleteTarget._id as Id<"accounts"> });
      setDeleteTarget(null);
    }
  };

  const isLoading = accounts === undefined;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 pb-16">

        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Accounts</h1>
            {portfolio && (
              <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
                {portfolio.count} account{portfolio.count !== 1 ? "s" : ""}
                {" · "}
                <span className={cn(
                  "font-medium",
                  portfolio.totalNetProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
                )}>
                  {formatMoney(portfolio.totalNetProfit, portfolio.currency, { showSign: true })}
                </span>
                {" combined P&L"}
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="size-3.5" />
            Add Account
          </Button>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <AccountCardSkeleton key={i} />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard
                key={account._id}
                account={account}
                onOpen={() => router.push(`/accounts/${account._id}`)}
                onEdit={() => {
                  setEditingAccount(account);
                  setShowForm(true);
                }}
                onDelete={() => setDeleteTarget(account)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">No accounts yet</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Create your first account to start tracking capital.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="size-3.5" />
              Add Account
            </Button>
          </div>
        )}

        {showForm && (
          <AccountForm
            onClose={() => {
              setShowForm(false);
              setEditingAccount(null);
            }}
            account={editingAccount || undefined}
          />
        )}

        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? All associated
                trades will be unlinked and capital movements will be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
