import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  api,
  BetAnalyticsScope,
  BetInput,
  BetStatus,
  CategoryInput,
  CategoryUpdateInput,
  CreditCardInput,
  CreditCardUpdateInput,
  RewardRateInput,
  RewardRateUpdateInput,
  TransactionFilters,
} from './api';
import { playstatApi } from './playstat';

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function monthRange(month: string): [string, string] {
  const [y, m] = month.split('-').map(Number);
  const end = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
  return [month, end];
}

// ---- Categories ----

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: api.categories.list });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: CategoryInput) => api.categories.create(category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, patch }: { categoryId: number; patch: CategoryUpdateInput }) =>
      api.categories.update(categoryId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
    },
  });
}

// ---- Budgeting ----

export function useBudgetPeriods(month: string) {
  return useQuery({
    queryKey: ['budget-periods', month],
    queryFn: () => api.budgetPeriods.list(month),
  });
}

export function useRecomputeBudgetPeriods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (month: string) => api.budgetPeriods.recompute(month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useAlerts(month?: string) {
  return useQuery({ queryKey: ['alerts', month ?? 'all'], queryFn: () => api.alerts.list(month) });
}

// ---- Bets ----

export function useBets(status?: BetStatus) {
  return useQuery({ queryKey: ['bets', status ?? 'all'], queryFn: () => api.bets.list(status) });
}

export function useBet(betId: number | null) {
  return useQuery({
    queryKey: ['bet', betId],
    queryFn: () => api.bets.get(betId as number),
    enabled: betId !== null,
  });
}

export function useBetsTrend(start: string, end: string) {
  return useQuery({ queryKey: ['bets-trend', start, end], queryFn: () => api.bets.trend(start, end) });
}

export function useBetAnalytics(scope: BetAnalyticsScope) {
  return useQuery({ queryKey: ['bets-analytics', scope], queryFn: () => api.bets.analytics(scope) });
}

export function useBankroll(scope: BetAnalyticsScope) {
  return useQuery({ queryKey: ['bets-bankroll', scope], queryFn: () => api.bets.bankroll(scope) });
}

export function useCreateBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bet: BetInput) => api.bets.create(bet),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bets'] }),
  });
}

export function useSettleBet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ betId, status, netResult }: { betId: number; status: BetStatus; netResult: number }) =>
      api.bets.settle(betId, status, netResult),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['bets-trend'] });
    },
  });
}

// ---- Rewards: cards ----

export function useCreditCards() {
  return useQuery({ queryKey: ['credit-cards'], queryFn: api.rewards.cards.list });
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (card: CreditCardInput) => api.rewards.cards.create(card),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['credit-cards'] }),
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, patch }: { cardId: number; patch: CreditCardUpdateInput }) =>
      api.rewards.cards.update(cardId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['credit-cards'] }),
  });
}

// ---- Rewards: rates ----

export function useRewardRates(cardId: number | null) {
  return useQuery({
    queryKey: ['reward-rates', cardId],
    queryFn: () => api.rewards.rewardRates.list(cardId as number),
    enabled: cardId !== null,
  });
}

export function useCreateRewardRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, rate }: { cardId: number; rate: RewardRateInput }) =>
      api.rewards.rewardRates.create(cardId, rate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reward-rates'] }),
  });
}

export function useUpdateRewardRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rateId, patch }: { rateId: number; patch: RewardRateUpdateInput }) =>
      api.rewards.rewardRates.update(rateId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reward-rates'] }),
  });
}

// ---- Rewards: progress / lookups ----

export function useRewardProgress(cardId?: number, categoryId?: number) {
  return useQuery({
    queryKey: ['reward-progress', cardId ?? 'all', categoryId ?? 'all'],
    queryFn: () => api.rewards.progress.list(cardId, categoryId),
  });
}

export function useRecomputeRewardProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asOf: string) => api.rewards.progress.recompute(asOf),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reward-progress'] }),
  });
}

export function useBestCard(categoryId: number | null, asOf?: string) {
  return useQuery({
    queryKey: ['best-card', categoryId, asOf],
    queryFn: () => api.rewards.bestCard(categoryId as number, asOf),
    enabled: categoryId !== null,
  });
}

export function useLeftOnTable(start: string, end: string) {
  return useQuery({
    queryKey: ['left-on-table', start, end],
    queryFn: () => api.rewards.leftOnTable(start, end),
  });
}

// ---- Plaid ----

export function useCreateLinkToken() {
  return useMutation({ mutationFn: api.plaid.linkToken });
}

export function useExchangePublicToken() {
  return useMutation({ mutationFn: (publicToken: string) => api.plaid.exchangePublicToken(publicToken) });
}

export function useSyncTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => api.plaid.syncTransactions(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
    },
  });
}

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: api.plaid.accounts.list });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api.plaid.transactions.list(filters),
  });
}

export function useCategorizeTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ txnId, customCategory }: { txnId: number; customCategory: string | null }) =>
      api.plaid.transactions.categorize(txnId, customCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-periods'] });
    },
  });
}

export function useRecurringCharges() {
  return useQuery({ queryKey: ['recurring-charges'], queryFn: api.plaid.recurringCharges });
}

export function useExpiringRates(withinDays = 45) {
  return useQuery({
    queryKey: ['expiring-rates', withinDays],
    queryFn: () => api.rewards.expiringRates(withinDays),
  });
}

// ---- Playstat (sports dashboard tie-in) ----

export function usePlaystatSlate() {
  return useQuery({ queryKey: ['playstat-slate'], queryFn: playstatApi.slate.next });
}

export function usePlaystatAllEdges() {
  return useQuery({ queryKey: ['playstat-edges', 'all'], queryFn: playstatApi.edges.list });
}

export function usePlaystatEdges(date: string | undefined) {
  return useQuery({
    queryKey: ['playstat-edges', date],
    queryFn: () => playstatApi.edges.listForDate(date!),
    enabled: !!date,
  });
}

export function usePlaystatGamePredictions(date: string | undefined) {
  return useQuery({
    queryKey: ['playstat-game-predictions', date],
    queryFn: () => playstatApi.gamePredictions.listForDate(date!),
    enabled: !!date,
  });
}

export function usePlaystatGames(date: string | undefined) {
  return useQuery({
    queryKey: ['playstat-games', date],
    queryFn: () => playstatApi.games.listForDate(date!),
    enabled: !!date,
  });
}

export function usePlaystatParlays() {
  return useQuery({ queryKey: ['playstat-parlays'], queryFn: () => playstatApi.parlays.list() });
}

export function usePlaystatBuilderParlays() {
  return useQuery({
    queryKey: ['playstat-builder-parlays'],
    queryFn: () => playstatApi.parlays.listBuilder(),
  });
}
