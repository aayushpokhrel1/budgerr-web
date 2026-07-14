'use client';

import { useState } from 'react';

import { useAccounts, useCategories, useCategorizeTransaction, useTransactions } from '@/lib/queries';

export default function TransactionsPage() {
  const [uncategorizedOnly, setUncategorizedOnly] = useState(false);
  const transactions = useTransactions({ uncategorizedOnly, limit: 100 });
  const accounts = useAccounts();
  const categories = useCategories();
  const categorize = useCategorizeTransaction();

  const accountById = new Map((accounts.data ?? []).map((a) => [a.account_id, a]));

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Transactions</h1>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={uncategorizedOnly}
            onChange={(e) => setUncategorizedOnly(e.target.checked)}
          />
          Uncategorized only
        </label>
      </div>

      {transactions.isLoading && <p className="text-sm text-muted">Loading...</p>}
      {transactions.data?.length === 0 && (
        <p className="text-sm text-muted">
          No transactions yet — link a bank account and sync from the Accounts page.
        </p>
      )}

      {transactions.data && transactions.data.length > 0 && (
        <div className="rounded-xl border border-border divide-y divide-border">
          {transactions.data.map((txn) => {
            const account = accountById.get(txn.account_id);
            return (
              <div key={txn.txn_id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="text-sm truncate">{txn.merchant_name ?? 'Unknown merchant'}</p>
                  <p className="text-xs text-muted">
                    {txn.date}
                    {account ? ` · ${account.institution_name} •••${account.mask}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium font-mono tabular-nums">${txn.amount.toFixed(2)}</span>
                  {txn.is_betting ? (
                    <span className="text-xs px-2 py-1 rounded bg-surface text-accent">betting</span>
                  ) : (
                    <select
                      className="text-xs rounded-lg border border-border bg-transparent px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      value={txn.custom_category ?? ''}
                      onChange={(e) =>
                        categorize.mutate({ txnId: txn.txn_id, customCategory: e.target.value || null })
                      }
                    >
                      <option value="">Uncategorized</option>
                      {categories.data
                        ?.filter((c) => !c.is_betting_category)
                        .map((c) => (
                          <option key={c.category_id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
