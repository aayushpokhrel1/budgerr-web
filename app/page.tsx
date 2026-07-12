'use client';

import { BestCardTip } from '@/components/budget/BestCardTip';
import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { CategoryTile } from '@/components/budget/CategoryTile';
import { RecentBetsList } from '@/components/budget/RecentBetsList';
import { TrendStats } from '@/components/budget/TrendStats';
import {
  currentMonth,
  monthRange,
  useBestCard,
  useBets,
  useBetsTrend,
  useBudgetPeriods,
  useCategories,
} from '@/lib/queries';

export default function DashboardPage() {
  const month = currentMonth();
  const [start, end] = monthRange(month);

  const categories = useCategories();
  const budgetPeriods = useBudgetPeriods(month);
  const bets = useBets();
  const trend = useBetsTrend(start, end);

  const bettingCategory = categories.data?.find((c) => c.is_betting_category);
  const otherCategories = categories.data?.filter((c) => !c.is_betting_category) ?? [];
  const tipCategory = otherCategories[0] ?? null;
  const bestCard = useBestCard(tipCategory?.category_id ?? null);

  const periodFor = (categoryId: number) =>
    budgetPeriods.data?.find((p) => p.category_id === categoryId);

  if (categories.isLoading || budgetPeriods.isLoading || bets.isLoading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  const bettingPeriod = bettingCategory ? periodFor(bettingCategory.category_id) : undefined;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-medium mb-2">Dashboard</h1>

      {bettingCategory && bettingPeriod && (
        <BudgetPeriodCard category={bettingCategory} period={bettingPeriod} />
      )}

      {otherCategories.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {otherCategories.map((category) => {
            const period = periodFor(category.category_id);
            return period ? (
              <CategoryTile key={category.category_id} category={category} period={period} />
            ) : null;
          })}
        </div>
      )}

      <RecentBetsList bets={bets.data ?? []} />

      {tipCategory && bestCard.data && <BestCardTip category={tipCategory} result={bestCard.data} />}

      <TrendStats month={trend.data?.by_month.find((m) => m.month === month)} />
    </div>
  );
}
