"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountForm } from "@/components/AccountForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as Id<"accounts">;
  
  const account = useQuery(api.accounts.get, { id: accountId });
  const summary = useQuery(api.accounts.getAccountSummary, { accountId });
  const movements = useQuery(api.accounts.getCapitalMovements, { accountId });
  
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

  if (!account) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <p className="text-zinc-400">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/accounts")}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {account.name}
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                {account.currency}
                {account.leverage && ` · ${account.leverage}x leverage`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Edit Account
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {summary && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-6 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100 dark:divide-zinc-800">
              <div className="pr-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Net Profit
                  </p>
                  <p className={`text-4xl font-bold leading-none ${summary.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {summary.netProfit >= 0 ? "+" : ""}{account.currency}{summary.netProfit.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600 mt-1 leading-tight">
                    Current - Starting - Deposits + Withdrawals
                  </p>
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    % Return
                  </p>
                  <p className={`text-4xl font-bold leading-none ${summary.percentReturn >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {summary.percentReturn >= 0 ? "+" : ""}{summary.percentReturn.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="px-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Current Balance
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {account.currency}{account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="pl-6">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Trades
                  </p>
                  <p className="text-4xl font-bold leading-none text-zinc-900 dark:text-zinc-50">
                    {summary.totalTrades}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Capital Overview</h3>
              <button
                onClick={() => setShowMovementForm(true)}
                className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
              >
                + Add Movement
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Starting Balance
                </span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {account.currency}{account.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Deposits
                </span>
                <span className="text-sm font-semibold text-emerald-600">
                  +{account.currency}{summary?.totalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Withdrawals
                </span>
                <span className="text-sm font-semibold text-red-500">
                  -{account.currency}{summary?.totalWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  Current Balance
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {account.currency}{account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Capital Movements</h3>
            {movements && movements.length > 0 ? (
              <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50 dark:bg-zinc-800/60 border-0">
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-2">Date</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-2">Type</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-2 text-right">Amount</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-2 w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.slice(0, 5).map((m: any) => (
                      <TableRow key={m._id} className="border-zinc-100 dark:border-zinc-800">
                        <TableCell className="text-xs text-zinc-600 dark:text-zinc-300 py-2">
                          {new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </TableCell>
                        <TableCell className="py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.type === "DEPOSIT"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {m.type}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right text-xs font-semibold py-2 ${m.type === "DEPOSIT" ? "text-emerald-600" : "text-red-500"}`}>
                          {m.type === "DEPOSIT" ? "+" : "-"}{account.currency}{m.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-2">
                          <button
                            onClick={() => removeMovement({ id: m._id })}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                          >
                            <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No capital movements recorded.</p>
            )}
          </div>
        </div>

        {showForm && (
          <AccountForm
            onClose={() => setShowForm(false)}
            account={account}
          />
        )}

        {showMovementForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Add Capital Movement</h3>
                <button onClick={() => setShowMovementForm(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Type</label>
                  <select
                    value={newMovement.type}
                    onChange={(e) => setNewMovement({ ...newMovement, type: e.target.value as "DEPOSIT" | "WITHDRAWAL" })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="DEPOSIT">DEPOSIT</option>
                    <option value="WITHDRAWAL">WITHDRAWAL</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMovement.amount}
                    onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Note (optional)</label>
                  <input
                    type="text"
                    value={newMovement.note}
                    onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="Optional note..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowMovementForm(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMovement}
                    className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors"
                  >
                    Add Movement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Delete Account</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Are you sure you want to delete &quot;{account.name}&quot;? 
                All associated trades will be unlinked and capital movements will be deleted.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}