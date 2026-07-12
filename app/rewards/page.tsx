'use client';

import { useState } from 'react';

import { BestCardLookup } from '@/components/rewards/BestCardLookup';
import { CardsPanel } from '@/components/rewards/CardsPanel';
import { LeftOnTableReport } from '@/components/rewards/LeftOnTableReport';
import { RewardRatesPanel } from '@/components/rewards/RewardRatesPanel';

export default function RewardsPage() {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-medium">Rewards</h1>

      <div className="grid grid-cols-2 gap-4">
        <CardsPanel selectedCardId={selectedCardId} onSelect={setSelectedCardId} />
        <RewardRatesPanel cardId={selectedCardId} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <BestCardLookup />
        <LeftOnTableReport />
      </div>
    </div>
  );
}
