import { create } from 'zustand';
import { ExpenseRecord } from '../types';
import { TransactionRepository } from '../database/TransactionRepository';
import { UserRepository } from '../database/UserRepository';
import { Category, CategoryRepository } from '../database/CategoryRepository';
import { useAuthStore } from './authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WeeklyDataPoint = { label: string; income: number; expense: number };

interface FinanceState {
  transactions:    ExpenseRecord[];
  categories:      Category[];
  monthlySummary:  { income: number; expense: number; balance: number };
  weeklyData:      WeeklyDataPoint[];   // current week, grouped by day
  monthlyWeekData: WeeklyDataPoint[];   // current month, grouped by week (Wk1-Wk4)
  loading:         boolean;
  error:           string | null;

  /** Fetch all data for the user (transactions, categories, summaries). */
  fetchData: (userId: string) => Promise<void>;

  /** Add a new income / expense entry. */
  addTransaction: (
    userId:          string,
    type:            'income' | 'expense',
    category:        string,
    amount:          number,
    note?:           string,
    timestamp?:      number,
    merchant?:       string,
    payment_method?: string
  ) => Promise<boolean>;

  /** Update an existing transaction by id. */
  updateTransaction: (
    id:       string,
    userId:   string,
    type:     'income' | 'expense',
    category: string,
    amount:   number,
    note?:    string
  ) => Promise<boolean>;

  /** Permanently remove a transaction. */
  deleteTransaction: (id: string, userId: string) => Promise<boolean>;

  /** Save a new custom category for the user. */
  addCategory: (
    userId: string,
    name:   string,
    type:   'income' | 'expense',
    icon:   string
  ) => Promise<boolean>;

  /**
   * Recalculate and persist user balance using a SQL SUM aggregate.
   * This replaces the previous JS-reduce-over-10k-rows approach.
   */
  recalculateUserMetrics: (userId: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions:   [],
  categories:     [],
  monthlySummary: { income: 0, expense: 0, balance: 0 },
  weeklyData:     [],
  monthlyWeekData: [],
  loading:        false,
  error:          null,

  fetchData: async (userId) => {
    set({ loading: true });
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const [history, categories, summary, weeklyData, monthlyWeekData] = await Promise.all([
        TransactionRepository.getHistory(userId, 5000),
        CategoryRepository.getCategories(userId),
        TransactionRepository.getMonthlySummary(userId, currentMonth),
        TransactionRepository.getWeeklySpending(userId),
        TransactionRepository.getMonthlyWeekData(userId),
      ]);

      set({ transactions: history, categories, monthlySummary: summary, weeklyData, monthlyWeekData, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addTransaction: async (userId, type, category, amount, note, timestamp, merchant, payment_method) => {
    set({ loading: true });
    try {
      await TransactionRepository.addTransaction(userId, type, category, amount, note, timestamp, merchant, payment_method);
      await get().recalculateUserMetrics(userId);
      await get().fetchData(userId);
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  updateTransaction: async (id, userId, type, category, amount, note) => {
    set({ loading: true });
    try {
      await TransactionRepository.updateTransaction(id, amount, category, note ?? '', type);
      await get().recalculateUserMetrics(userId);
      await get().fetchData(userId);
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  deleteTransaction: async (id, userId) => {
    set({ loading: true });
    try {
      await TransactionRepository.deleteTransaction(id);
      await get().recalculateUserMetrics(userId);
      await get().fetchData(userId);
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  addCategory: async (userId, name, type, icon) => {
    try {
      await CategoryRepository.addCategory(userId, name, type, icon);
      const categories = await CategoryRepository.getCategories(userId);
      set({ categories });
      return true;
    } catch (err: any) {
      set({ error: err.message });
      return false;
    }
  },

  /**
   * Uses a SQL SUM aggregate query — O(1) DB work instead of
   * loading N rows into JS memory with Array.filter + reduce.
   */
  recalculateUserMetrics: async (userId) => {
    const { income, expense } = await TransactionRepository.getUserMetrics(userId);
    await UserRepository.updateMetrics(userId, income - expense, expense);
    // Sync the authStore to update balance in UI globally
    await useAuthStore.getState().syncProfile();
  },
}));
