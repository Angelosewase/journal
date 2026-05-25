"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import { AccountForm } from "@/components/AccountForm";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  ArrowDownRight,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  TrendingUp,
  BarChart3,
} from "lucide-react";

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

function PortfolioStat({
  label,
  value,
  sub,
  icon: Icon,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  valueClass?: string;
}) {
  return (
    <Card size="sm" className="gap-0 py-4">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {label}
          </p>
          <p className={cn("text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50", valueClass)}>
            {value}
          </p>
          {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Icon className="size-4 text-zinc-500 dark:text-zinc-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function AccountCardSkeleton() {
  return (
    <Card className="gap-0">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </CardContent>
    </Card>
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
  const returnMagnitude = Math.min(Math.abs(account.percentReturn), 100);

  return (
    <Card
      className="group cursor-pointer gap-0 transition-all hover:border-zinc-300 hover:shadow-sm dark:hover:border-zinc-700"
      onClick={onOpen}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              isPositive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                : "bg-red-50 text-red-500 dark:bg-red-950/50 dark:text-red-400",
            )}
          >
            <Wallet className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{account.name}</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap items-center gap-1.5 normal-case tracking-normal">
              <Badge variant="outline" className="text-[10px] font-semibold">
                {account.currency}
              </Badge>
              {account.leverage && (
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {account.leverage}x
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-3.5" />
                Edit account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2 className="size-3.5" />
                Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Current Balance
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatMoney(account.currentBalance ?? 0, account.currency)}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 dark:text-zinc-500">Return</span>
            <span
              className={cn(
                "font-semibold",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
              )}
            >
              {formatPercent(account.percentReturn)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isPositive ? "bg-emerald-500" : "bg-red-500",
              )}
              style={{ width: `${returnMagnitude}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Net P&L</p>
            <p
              className={cn(
                "mt-0.5 text-sm font-semibold",
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
              )}
            >
              {formatMoney(account.netProfit, account.currency, { showSign: true })}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Trades</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {account.totalTrades}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Starting</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {formatMoney(account.startingBalance, account.currency)}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between text-xs text-zinc-400 dark:text-zinc-500">
        <span>View account details</span>
        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </CardFooter>
    </Card>
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
    const profitable = accounts.filter((a) => a.netProfit >= 0).length;
    return { totalBalance, totalNetProfit, totalTrades, profitable, count: accounts.length };
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
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 pb-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Accounts
            </h1>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Manage trading accounts and track capital across brokers
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="rounded-full shadow-sm"
          >
            <Plus className="size-3.5" />
            Add Account
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : portfolio ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PortfolioStat
              label="Total Balance"
              value={formatMoney(portfolio.totalBalance, accounts![0]?.currency ?? "USD")}
              sub={`Across ${portfolio.count} account${portfolio.count !== 1 ? "s" : ""}`}
              icon={Wallet}
            />
            <PortfolioStat
              label="Combined P&L"
              value={formatMoney(portfolio.totalNetProfit, accounts![0]?.currency ?? "USD", {
                showSign: true,
              })}
              sub={`${portfolio.profitable} of ${portfolio.count} profitable`}
              icon={portfolio.totalNetProfit >= 0 ? TrendingUp : ArrowDownRight}
              valueClass={
                portfolio.totalNetProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500"
              }
            />
            <PortfolioStat
              label="Total Trades"
              value={portfolio.totalTrades}
              sub="Across all accounts"
              icon={BarChart3}
            />
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <AccountCardSkeleton key={i} />
            ))}
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Wallet className="size-6 text-zinc-400 dark:text-zinc-500" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">No accounts yet</p>
                <p className="max-w-sm text-sm text-zinc-400 dark:text-zinc-500">
                  Create your first account to start tracking capital, deposits, and trade performance.
                </p>
              </div>
              <Button onClick={() => setShowForm(true)} className="rounded-full">
                <Plus className="size-3.5" />
                Create Account
              </Button>
            </CardContent>
          </Card>
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
