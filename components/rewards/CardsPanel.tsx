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
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Credit cards</span>
        <button
          className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ Add card'}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <div>
            <label htmlFor="card-name" className="block text-xs text-muted mb-1">
              Name
            </label>
            <input
              id="card-name"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              placeholder="Chase Freedom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="card-issuer" className="block text-xs text-muted mb-1">
              Issuer
            </label>
            <input
              id="card-issuer"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              placeholder="Chase"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="card-nickname" className="block text-xs text-muted mb-1">
              Nickname (optional)
            </label>
            <input
              id="card-nickname"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <button
            className="sm:col-span-3 rounded-lg bg-primary text-primary-ink text-sm font-medium py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={submit}
            disabled={createCard.isPending}
          >
            {createCard.isPending ? 'Saving...' : 'Save card'}
          </button>
        </div>
      )}

      {cards.isLoading && <p className="text-sm text-muted">Loading...</p>}
      {cards.data?.length === 0 && <p className="text-sm text-muted">No cards yet.</p>}

      <div className="space-y-1">
        {cards.data?.map((card) => (
          <button
            key={card.card_id}
            onClick={() => onSelect(card.card_id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              selectedCardId === card.card_id ? 'bg-surface text-accent font-medium' : 'hover:bg-surface'
            }`}
          >
            {card.name} <span className="text-muted">— {card.issuer}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
