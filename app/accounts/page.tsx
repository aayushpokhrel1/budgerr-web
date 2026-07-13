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
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          + Link a bank account
        </Link>
      </div>

      {accounts.isLoading && <p className="text-sm text-gray-400">Loading...</p>}

      {accounts.data?.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 text-center space-y-2">
          <p className="text-sm text-gray-500">No bank accounts linked yet.</p>
          <Link href="/link-bank" className="text-sm text-blue-600 dark:text-blue-400">
            Link your first account
          </Link>
        </div>
      )}

      {accounts.data && accounts.data.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {accounts.data.map((account) => (
            <div key={account.account_id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium">
                  {account.institution_name} •••{account.mask}
                </p>
                <p className="text-xs text-gray-500 capitalize">{account.account_type}</p>
              </div>
              <span className="text-sm font-medium">${account.current_balance.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {itemIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {itemIds.map((itemId) => (
            <button
              key={itemId}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
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
