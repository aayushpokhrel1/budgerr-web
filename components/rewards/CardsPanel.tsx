'use client';

import { useState } from 'react';

import { useCreateCreditCard, useCreditCards } from '@/lib/queries';

export function CardsPanel({
  selectedCardId,
  onSelect,
}: {
  selectedCardId: number | null;
  onSelect: (cardId: number) => void;
}) {
  const cards = useCreditCards();
  const createCard = useCreateCreditCard();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [nickname, setNickname] = useState('');

  const submit = () => {
    if (!name || !issuer) return;
    createCard.mutate(
      { name, issuer, nickname: nickname || undefined },
      {
        onSuccess: () => {
          setName('');
          setIssuer('');
          setNickname('');
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Credit cards</span>
        <button
          className="text-sm text-blue-600 dark:text-blue-400"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ Add card'}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <input
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
            placeholder="Name (Chase Freedom)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
            placeholder="Issuer (Chase)"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
          />
          <input
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
            placeholder="Nickname (optional)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <button
            className="col-span-3 rounded-lg bg-blue-600 text-white text-sm font-medium py-2"
            onClick={submit}
            disabled={createCard.isPending}
          >
            {createCard.isPending ? 'Saving...' : 'Save card'}
          </button>
        </div>
      )}

      {cards.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
      {cards.data?.length === 0 && <p className="text-sm text-gray-400">No cards yet.</p>}

      <div className="space-y-1">
        {cards.data?.map((card) => (
          <button
            key={card.card_id}
            onClick={() => onSelect(card.card_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              selectedCardId === card.card_id
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            {card.name} <span className="text-gray-400">— {card.issuer}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
