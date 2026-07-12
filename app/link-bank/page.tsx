'use client';

import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

import { useCreateLinkToken, useExchangePublicToken, useSyncTransactions } from '@/lib/queries';

export default function LinkBankPage() {
  const createLinkToken = useCreateLinkToken();
  const exchangeToken = useExchangePublicToken();
  const syncTransactions = useSyncTransactions();

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [result, setResult] = useState<{ item_id: string; accounts_created: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token) => {
      setError(null);
      exchangeToken.mutate(public_token, {
        onSuccess: (data) => setResult(data),
        onError: (err) => setError(String(err.message ?? err)),
      });
    },
  });

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkToken, ready]);

  const start = () => {
    setError(null);
    setResult(null);
    createLinkToken.mutate(undefined, {
      onSuccess: (data) => setLinkToken(data.link_token),
      onError: (err) => setError(String(err.message ?? err)),
    });
  };

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-medium">Link a bank account</h1>
      <p className="text-sm text-gray-500">
        This calls the Budgerr backend to create a Plaid Link session, then hands off to Plaid&apos;s own
        secure login UI — your bank credentials go straight to Plaid, never to this page or the Budgerr
        backend.
      </p>

      <button
        className="rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2.5 disabled:opacity-50"
        onClick={start}
        disabled={createLinkToken.isPending}
      >
        {createLinkToken.isPending ? 'Requesting link token...' : 'Connect a bank account'}
      </button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {result && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
          <p className="text-sm">
            Linked! item_id: <span className="font-mono text-xs">{result.item_id}</span>
          </p>
          <p className="text-sm">accounts_created: {result.accounts_created}</p>
          <button
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
            onClick={() => syncTransactions.mutate(result.item_id)}
            disabled={syncTransactions.isPending}
          >
            {syncTransactions.isPending ? 'Syncing...' : 'Sync transactions now'}
          </button>
          {syncTransactions.data && (
            <p className="text-sm text-gray-500">
              Added {syncTransactions.data.added}, modified {syncTransactions.data.modified}, removed{' '}
              {syncTransactions.data.removed}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
