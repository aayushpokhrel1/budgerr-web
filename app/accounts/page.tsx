'use client';

import Link from 'next/link';

import { useAccounts, useSyncTransactions } from '@/lib/queries';

export default function AccountsPage() {
  const accounts = useAccounts();
  const syncTransactions = useSyncTransactions();

  const itemIds = Array.from(new Set((accounts.data ?? []).map((a) => a.plaid_item_id)));
  const institutionForItem = (itemId: string) =>
    accounts.data?.find((a) => a.plaid_item_id === itemId)?.institution_name ?? 'account';

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Accounts</h1>
        <Link
          href="/link-bank"
          className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          + Link a bank account
        </Link>
      </div>

      {accounts.isLoading && <p className="text-sm text-muted">Loading...</p>}

      {(accounts.isError || accounts.fetchStatus === 'paused') && (
        <div className="rounded-xl bg-surface p-6 text-center space-y-2">
          <p className="text-sm text-red-600 dark:text-red-400">
            {accounts.fetchStatus === 'paused'
              ? "Couldn't reach the Budgerr backend — check your connection."
              : "Couldn't load your accounts. The Budgerr backend may be unreachable."}
          </p>
          <button
            className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            onClick={() => accounts.refetch()}
          >
            Try again
          </button>
        </div>
      )}

      {accounts.data?.length === 0 && (
        <div className="rounded-xl bg-surface p-6 text-center space-y-2">
          <p className="text-sm text-muted">No bank accounts linked yet.</p>
          <Link
            href="/link-bank"
            className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
          >
            Link your first account
          </Link>
        </div>
      )}

      {accounts.data && accounts.data.length > 0 && (
        <div className="rounded-xl border border-border divide-y divide-border">
          {accounts.data.map((account) => (
            <div key={account.account_id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {account.institution_name} •••{account.mask}
                </p>
                <p className="text-xs text-muted capitalize">{account.account_type}</p>
              </div>
              <span className="text-sm font-medium font-mono tabular-nums">
                ${account.current_balance.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {itemIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {itemIds.map((itemId) => (
            <button
              key={itemId}
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-surface disabled:opacity-50 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => syncTransactions.mutate(itemId)}
              disabled={syncTransactions.isPending}
            >
              {syncTransactions.isPending ? 'Syncing...' : `Sync ${institutionForItem(itemId)}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
