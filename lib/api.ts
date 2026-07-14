const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Bets ----

export type BetStatus = 'pending' | 'won' | 'lost' | 'push' | 'cashed_out';
export type BetType = 'single' | 'parlay';

export interface BetLeg {
  leg_id: number;
  player_name: string | null;
  stat_type: string | null;
  line_value: number | null;
  side: string | null;
  odds: number | null;
  leg_status: BetStatus;
  model_prob: number | null;
}

export interface Bet {
  bet_id: number;
  sportsbook: string;
  placed_at: string;
  bet_type: BetType;
  stake: number;
  potential_payout: number;
  status: BetStatus;
  settled_at: string | null;
  net_result: number | null;
  legs: BetLeg[];
  is_paper: boolean;
}

export interface BetLegInput {
  player_name?: string;
  stat_type?: string;
  line_value?: number;
  side?: string;
  odds?: number;
  model_prob?: number | null;
}

export interface BetInput {
  sportsbook: string;
  bet_type: BetType;
  stake: number;
  potential_payout: number;
  legs?: BetLegInput[];
  is_paper?: boolean;
}

export interface MonthlyNetResult {
  month: string;
  bet_net_profit: number;
  bets_settled: number;
  bank_net_cash_outflow: number;
}

// ---- Budgeting ----

export interface Category {
  category_id: number;
  name: string;
  monthly_limit: number;
  is_betting_category: boolean;
}

export interface CategoryInput {
  name: string;
  monthly_limit: number;
  is_betting_category?: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  monthly_limit?: number;
}

export interface BudgetPeriod {
  period_id: number;
  category_id: number;
  month: string;
  spent: number;
  limit: number;
  remaining: number;
}

export interface Alert {
  alert_id: number;
  category_id: number;
  month: string;
  threshold_pct: number;
  triggered_at: string | null;
  message: string | null;
}

// ---- Accounts & transactions ----

export interface Account {
  account_id: number;
  plaid_item_id: string;
  institution_name: string;
  account_type: string;
  mask: string;
  current_balance: number;
}

export interface Transaction {
  txn_id: number;
  account_id: number;
  date: string;
  amount: number;
  merchant_name: string | null;
  plaid_category: string | null;
  custom_category: string | null;
  is_betting: boolean;
}

export interface TransactionFilters {
  start?: string;
  end?: string;
  accountId?: number;
  uncategorizedOnly?: boolean;
  limit?: number;
}

// ---- Rewards ----

export type CapPeriod = 'quarterly' | 'annual';

export interface CreditCard {
  card_id: number;
  name: string;
  issuer: string;
  nickname: string | null;
  linked_account_id: number | null;
}

export interface CreditCardInput {
  name: string;
  issuer: string;
  nickname?: string;
  linked_account_id?: number;
}

export interface CreditCardUpdateInput {
  name?: string;
  nickname?: string;
  linked_account_id?: number;
}

export interface RewardRate {
  rate_id: number;
  card_id: number;
  category_id: number;
  multiplier: number;
  cap_amount: number | null;
  cap_period: CapPeriod | null;
  effective_start: string;
  effective_end: string | null;
}

export interface RewardRateInput {
  category_id: number;
  multiplier: number;
  cap_amount?: number;
  cap_period?: CapPeriod;
  effective_start: string;
  effective_end?: string;
}

export interface RewardRateUpdateInput {
  multiplier?: number;
  cap_amount?: number;
  cap_period?: CapPeriod;
  effective_end?: string;
}

export interface RewardProgress {
  progress_id: number;
  card_id: number;
  category_id: number;
  period_start: string;
  period_end: string;
  amount_spent_at_bonus_rate: number;
}

export interface BestCardOption {
  card_id: number;
  card_name: string;
  multiplier: number;
  capped_out: boolean;
  remaining_cap_room: number | null;
}

export interface BestCardResponse {
  best: BestCardOption | null;
  options: BestCardOption[];
}

export interface MonthlyGap {
  month: string;
  gap_dollars: number;
  transaction_count: number;
}

export interface LeftOnTableResponse {
  total_gap_dollars: number;
  by_month: MonthlyGap[];
}

export const api = {
  bets: {
    list: (status?: BetStatus) => request<Bet[]>(`/bets${status ? `?status=${status}` : ''}`),
    get: (betId: number) => request<Bet>(`/bets/${betId}`),
    create: (bet: BetInput) => request<Bet>('/bets', { method: 'POST', body: JSON.stringify(bet) }),
    settle: (betId: number, status: BetStatus, netResult: number) =>
      request<Bet>(`/bets/${betId}/settle`, {
        method: 'PATCH',
        body: JSON.stringify({ status, net_result: netResult }),
      }),
    trend: (start: string, end: string) =>
      request<{ by_month: MonthlyNetResult[] }>(`/bets/trend?start=${start}&end=${end}`),
  },
  categories: {
    list: () => request<Category[]>('/categories'),
    create: (category: CategoryInput) =>
      request<Category>('/categories', { method: 'POST', body: JSON.stringify(category) }),
    update: (categoryId: number, patch: CategoryUpdateInput) =>
      request<Category>(`/categories/${categoryId}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  },
  budgetPeriods: {
    list: (month: string) => request<BudgetPeriod[]>(`/budget-periods?month=${month}`),
    recompute: (month: string) =>
      request<{ budget_periods: BudgetPeriod[]; alerts_fired: Alert[] }>(
        `/budget-periods/recompute?month=${month}`,
        { method: 'POST' }
      ),
  },
  alerts: {
    list: (month?: string) => request<Alert[]>(`/alerts${month ? `?month=${month}` : ''}`),
  },
  rewards: {
    cards: {
      list: () => request<CreditCard[]>('/rewards/cards'),
      create: (card: CreditCardInput) =>
        request<CreditCard>('/rewards/cards', { method: 'POST', body: JSON.stringify(card) }),
      update: (cardId: number, patch: CreditCardUpdateInput) =>
        request<CreditCard>(`/rewards/cards/${cardId}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    },
    rewardRates: {
      list: (cardId: number) => request<RewardRate[]>(`/rewards/cards/${cardId}/reward-rates`),
      create: (cardId: number, rate: RewardRateInput) =>
        request<RewardRate>(`/rewards/cards/${cardId}/reward-rates`, {
          method: 'POST',
          body: JSON.stringify(rate),
        }),
      update: (rateId: number, patch: RewardRateUpdateInput) =>
        request<RewardRate>(`/rewards/reward-rates/${rateId}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        }),
    },
    progress: {
      list: (cardId?: number, categoryId?: number) => {
        const params = new URLSearchParams();
        if (cardId !== undefined) params.set('card_id', String(cardId));
        if (categoryId !== undefined) params.set('category_id', String(categoryId));
        const qs = params.toString();
        return request<RewardProgress[]>(`/rewards/progress${qs ? `?${qs}` : ''}`);
      },
      recompute: (asOf: string) =>
        request<RewardProgress[]>(`/rewards/progress/recompute?as_of=${asOf}`, { method: 'POST' }),
    },
    bestCard: (categoryId: number, asOf?: string) =>
      request<BestCardResponse>(
        `/rewards/best-card?category_id=${categoryId}${asOf ? `&as_of=${asOf}` : ''}`
      ),
    leftOnTable: (start: string, end: string) =>
      request<LeftOnTableResponse>(`/rewards/left-on-table?start=${start}&end=${end}`),
  },
  plaid: {
    linkToken: () => request<{ link_token: string }>('/plaid/link-token', { method: 'POST' }),
    exchangePublicToken: (publicToken: string) =>
      request<{ item_id: string; accounts_created: number }>('/plaid/exchange-public-token', {
        method: 'POST',
        body: JSON.stringify({ public_token: publicToken }),
      }),
    syncTransactions: (itemId: string) =>
      request<{ added: number; modified: number; removed: number }>(
        `/plaid/sync-transactions/${itemId}`,
        { method: 'POST' }
      ),
    accounts: {
      list: () => request<Account[]>('/plaid/accounts'),
    },
    transactions: {
      list: (filters: TransactionFilters = {}) => {
        const params = new URLSearchParams();
        if (filters.start) params.set('start', filters.start);
        if (filters.end) params.set('end', filters.end);
        if (filters.accountId !== undefined) params.set('account_id', String(filters.accountId));
        if (filters.uncategorizedOnly) params.set('uncategorized_only', 'true');
        if (filters.limit !== undefined) params.set('limit', String(filters.limit));
        const qs = params.toString();
        return request<Transaction[]>(`/plaid/transactions${qs ? `?${qs}` : ''}`);
      },
      categorize: (txnId: number, customCategory: string | null) =>
        request<Transaction>(`/plaid/transactions/${txnId}`, {
          method: 'PATCH',
          body: JSON.stringify({ custom_category: customCategory }),
        }),
    },
  },
};
