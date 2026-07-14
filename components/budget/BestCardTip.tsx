import { BestCardResponse, Category } from '@/lib/api';

export function BestCardTip({ category, result }: { category: Category; result: BestCardResponse }) {
  if (!result.best) return null;

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium mb-2">Best card for {category.name.toLowerCase()} right now</p>
      <div className="flex items-center justify-between">
        <span className="text-sm">{result.best.card_name}</span>
        <span className="text-sm font-medium text-accent font-mono tabular-nums">
          {result.best.multiplier}% back
        </span>
      </div>
    </div>
  );
}
