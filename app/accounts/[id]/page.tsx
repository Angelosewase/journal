"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AccountForm } from "@/components/AccountForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatMoney, formatPercent } from "@/lib/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";

type CapitalMovement = {
  _id: Id<"capitalMovements">;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  date: number;
  note?: string;
};

type AccountTrade = {
  _id: Id<"trades">;
  instrument: string;
  direction: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  winLossStatus?: string;
  createdAt: number;
};

function StatCard({
  label,
  value,
  hint,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <Card size="sm" className="gap-0 py-4">
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
        <p className={cn("mt-1 text-2xl font-bold leading-none text-zinc-900 dark:text-zinc-50", valueClass)}>
          {value}
        </p>
        {hint && (
          <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownRow({
  label,
  value,
  valueClass,
  isTotal,
}: {
  label: string;
  value: string;
  valueClass?: string;
  isTotal?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5",
        isTotal && "border-t border-zinc-100 pt-3 dark:border-zinc-800",
      )}
    >
      <span
        className={cn(
          "text-sm",
          isTotal
            ? "font-semibold text-zinc-800 dark:text-zinc-100"
            : "text-zinc-500 dark:text-zinc-400",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold",
          isTotal ? "text-zinc-900 dark:text-zinc-50" : valueClass,
        )}
      >
        {value}
      </span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as Id<"accounts">;

  const account = useQuery(api.accounts.get, { id: accountId });
  const summary = useQuery(api.accounts.getAccountSummary, { accountId });
  const movements = useQuery(api.accounts.getCapitalMovements, { accountId });
  const trades = useQuery(api.accounts.getAccountTrades, { accountId });
  const equityCurve = useQuery(api.accounts.getAccountEquityCurve, { accountId });

  const removeAccount = useMutation(api.accounts.remove);
  const addMovement = useMutation(api.accounts.addCapitalMovement);
  const removeMovement = useMutation(api.accounts.removeCapitalMovement);

  const [showForm, setShowForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newMovement, setNewMovement] = useState({
    type: "DEPOSIT" as "DEPOSIT" | "WITHDRAWAL",
    amount: "",
    note: "",
  });

  const handleAddMovement = async () => {
    if (!newMovement.amount) return;
    await addMovement({
      accountId,
      type: newMovement.type,
      amount: Number(newMovement.amount),
      date: Date.now(),
      note: newMovement.note || undefined,
    });
    setShowMovementForm(false);
    setNewMovement({ type: "DEPOSIT", amount: "", note: "" });
  };

  const handleDelete = async () => {
    await removeAccount({ id: accountId });
    router.push("/accounts");
  };

  const isPositive = (summary?.netProfit ?? 0) >= 0;
  const chartColor = isPositive ? "#10b981" : "#ef4444";

  if (!account) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 pb-16">
        {/* Breadcrumb + header */}
        <div className="space-y-4">
          <nav className="flex items-center gap-1.5 text-sm text-zinc-400 dark:text-zinc-500">
            <Link
              href="/accounts"
              className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Accounts
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{account.name}</span>
          </nav>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => router.push("/accounts")}
                className="mt-0.5 shrink-0"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {account.name}
                  </h1>
                  <Badge variant="outline">{account.currency}</Badge>
                  {account.leverage && (
                    <Badge variant="secondary">{account.leverage}x leverage</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                  Created {new Date(account.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMovementForm(true)}
              >
                <Plus className="size-3.5" />
                Add Movement
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Current Balance"
              value={formatMoney(summary.currentBalance, account.currency)}
            />
            <StatCard
              label="Net Profit"
              value={formatMoney(summary.netProfit, account.currency, { showSign: true })}
              hint={`Trade P&L: ${formatMoney(summary.totalTradePnl, account.currency, { showSign: true })}`}
              valueClass={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}
            />
            <StatCard
              label="Return"
              value={formatPercent(summary.percentReturn)}
              valueClass={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}
            />
            <StatCard
              label="Trades"
              value={trades?.length ?? 0}
              hint={`${summary.totalDeposits > 0 ? `+${formatMoney(summary.totalDeposits, account.currency)} deposited` : "No deposits"}`}
            />
          </div>
        )}

        {/* Equity curve */}
        <Card className="gap-0">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-zinc-400" />
              <CardTitle>Equity Curve</CardTitle>
            </div>
            <CardDescription>Account balance over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {equityCurve && equityCurve.length > 1 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) =>
                        new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${account.currency}${v}`}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgb(24 24 27)",
                        border: "1px solid rgb(63 63 63)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#e4e4e7", marginBottom: "4px" }}
                      labelFormatter={(v) =>
                        new Date(Number(v)).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      }
                      formatter={(v) => [
                        `${account.currency}${Number(v).toFixed(2)}`,
                        "Equity",
                      ]}
                      itemStyle={{ color: "#e4e4e7" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill="url(#equityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                <TrendingUp className="size-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Not enough data to display equity curve yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Capital breakdown */}
          <Card className="gap-0">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle>Capital Breakdown</CardTitle>
              <CardDescription>How your balance is composed</CardDescription>
            </CardHeader>
            <CardContent className="pt-1">
              <BreakdownRow
                label="Starting Balance"
                value={formatMoney(account.startingBalance, account.currency)}
              />
              <BreakdownRow
                label="Deposits"
                value={`+${formatMoney(summary?.totalDeposits ?? 0, account.currency)}`}
                valueClass="text-emerald-600 dark:text-emerald-400"
              />
              <BreakdownRow
                label="Withdrawals"
                value={`-${formatMoney(summary?.totalWithdrawals ?? 0, account.currency)}`}
                valueClass="text-red-500"
              />
              <BreakdownRow
                label="Trade P&L"
                value={formatMoney(summary?.totalTradePnl ?? 0, account.currency, { showSign: true })}
                valueClass={
                  (summary?.totalTradePnl ?? 0) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500"
                }
              />
              <BreakdownRow
                label="Current Balance"
                value={formatMoney(summary?.currentBalance ?? 0, account.currency)}
                isTotal
              />
            </CardContent>
          </Card>

          {/* Capital movements */}
          <Card className="gap-0">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle>Capital Movements</CardTitle>
              <CardDescription>Deposits and withdrawals</CardDescription>
              <CardAction>
                <Button size="sm" onClick={() => setShowMovementForm(true)}>
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="p-0">
              {movements && movements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Date
                      </TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Type
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        Amount
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(movements as CapitalMovement[]).map((m) => (
                      <TableRow key={m._id} className="border-zinc-100 dark:border-zinc-800">
                        <TableCell className="text-xs text-zinc-600 dark:text-zinc-300">
                          {new Date(m.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase",
                              m.type === "DEPOSIT"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
                            )}
                          >
                            {m.type === "DEPOSIT" ? (
                              <ArrowUpRight className="size-3" />
                            ) : (
                              <ArrowDownRight className="size-3" />
                            )}
                            {m.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right text-xs font-semibold",
                            m.type === "DEPOSIT"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-500",
                          )}
                        >
                          {m.type === "DEPOSIT" ? "+" : "-"}
                          {formatMoney(m.amount, account.currency)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeMovement({ id: m._id })}
                          >
                            <Trash2 className="size-3 text-zinc-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">
                    No capital movements recorded
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMovementForm(true)}
                  >
                    <Plus className="size-3.5" />
                    Record first movement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trades */}
        <Card className="gap-0">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle>Trades</CardTitle>
            <CardDescription>
              {trades?.length ?? 0} trade{(trades?.length ?? 0) !== 1 ? "s" : ""} linked to this account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {trades && trades.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Date
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Instrument
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Direction
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Entry / Exit
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      P&L
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(trades as AccountTrade[]).slice(0, 15).map((trade) => (
                    <TableRow
                      key={trade._id}
                      className="cursor-pointer border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/40"
                      onClick={() => router.push(`/trades/${trade._id}`)}
                    >
                      <TableCell className="text-xs text-zinc-600 dark:text-zinc-300">
                        {new Date(trade.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        {trade.instrument}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            trade.direction === "LONG"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
                          )}
                        >
                          {trade.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-zinc-600 dark:text-zinc-300">
                        {trade.entryPrice} / {trade.exitPrice ?? "Open"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-xs font-semibold",
                          (trade.pnl ?? 0) >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-500",
                        )}
                      >
                        {trade.pnl !== undefined
                          ? formatMoney(trade.pnl, account.currency, { showSign: true })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            trade.winLossStatus === "WIN"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : trade.winLossStatus === "LOSS"
                                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                                : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
                          )}
                        >
                          {trade.winLossStatus ?? "OPEN"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  No trades linked to this account yet
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/trades/new">Log a trade</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {showForm && <AccountForm onClose={() => setShowForm(false)} account={account} />}

        <Dialog open={showMovementForm} onOpenChange={setShowMovementForm}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Capital Movement</DialogTitle>
              <DialogDescription>Record a deposit or withdrawal for this account.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={newMovement.type}
                  onValueChange={(value) =>
                    setNewMovement({ ...newMovement, type: value as "DEPOSIT" | "WITHDRAWAL" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="movement-amount">Amount</Label>
                <Input
                  id="movement-amount"
                  type="number"
                  step="0.01"
                  value={newMovement.amount}
                  onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="movement-note">Note (optional)</Label>
                <Input
                  id="movement-note"
                  value={newMovement.note}
                  onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })}
                  placeholder="e.g., Monthly deposit"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMovementForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMovement}>Add Movement</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{account.name}&quot;? All associated trades
                will be unlinked and capital movements will be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
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
