"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { AccountForm } from "@/components/AccountForm";
import { useRouter } from "next/navigation";

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
}

export default function AccountsPage() {
  const router = useRouter();
  const accounts = useQuery(api.accounts.getAccountsWithSummary);
  const removeAccount = useMutation(api.accounts.remove);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWithSummary | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithSummary | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (selectedAccount) {
      await removeAccount({ id: selectedAccount._id as Id<"accounts"> });
      setShowDeleteConfirm(false);
      setSelectedAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Accounts</h1>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {accounts?.length || 0} account{accounts?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Account
          </button>
        </div>

        {accounts && accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/accounts/${account._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {account.name}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {account.currency}
                      {account.leverage && ` · ${account.leverage}x leverage`}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAccount(account);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Current Balance
                    </span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {account.currency}{account.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Starting Balance
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">
                      {account.currency}{account.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Net Profit
                    </span>
                    <span className={`text-sm font-bold ${account.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {account.netProfit >= 0 ? "+" : ""}{account.currency}{account.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Return
                    </span>
                    <span className={`text-sm font-bold ${account.percentReturn >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {account.percentReturn >= 0 ? "+" : ""}{account.percentReturn.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                      Trades
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {account.totalTrades}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(!accounts || accounts.length === 0) && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-12">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                <svg className="h-6 w-6 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No accounts yet. Create your first account to start tracking capital.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                Create Account
              </button>
            </div>
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

        {showDeleteConfirm && selectedAccount && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Delete Account
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Are you sure you want to delete &quot;{selectedAccount.name}&quot;? 
                All associated trades will be unlinked and capital movements will be deleted.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
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