import { create } from 'zustand';
import { ExpenseRecord, UserProfile } from '../types';
import { TransactionRepository } from '../database/TransactionRepository';
import { UserRepository } from '../database/UserRepository';

interface FinanceState {
  transactions: ExpenseRecord[];
  monthlySummary: { income: number; expense: number; balance: number };
  loading: boolean;
  error: string | null;

  /**
   * Fetch all transactions for the user.
   */
  fetchTransactions: (userId: string) => Promise<void>;

  /**
   * Fetch summary metrics for a specific month.
   */
  fetchMonthlySummary: (userId: string, monthYear: string) => Promise<void>;

  /**
   * Add a new income/expense and update local persistence.
   */
  addTransaction: (
    userId: string,
    type: 'income' | 'expense',
    category: string,
    amount: number,
    note?: string
  ) => Promise<boolean>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  monthlySummary: { income: 0, expense: 0, balance: 0 },
  loading: false,
  error: null,

  fetchTransactions: async (userId) => {
    set({ loading: true });
    try {
      const transactions = await TransactionRepository.getHistory(userId);
      set({ transactions, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMonthlySummary: async (userId, monthYear) => {
    try {
      const monthlySummary = await TransactionRepository.getMonthlySummary(userId, monthYear);
      set({ monthlySummary });
    } catch (err: any) {
      console.error('Failed to fetch monthly summary:', err);
    }
  },

  addTransaction: async (userId, type, category, amount, note) => {
    set({ loading: true });
    try {
      // 1. Save to SQLite
      const tx = await TransactionRepository.addTransaction(userId, type, category, amount, note);
      
      // 2. Fetch all transactions and summary
      const currentMonth = new Date().toISOString().slice(0, 7);
      const summary = await TransactionRepository.getMonthlySummary(userId, currentMonth);
      const history = await TransactionRepository.getHistory(userId);
      
      // 3. Update User Profile metrics (balance, total spending)
      // This is a simple implementation: 
      // In a real app, we'd calculate this from all transactions to be precise.
      const currentTransactions = await TransactionRepository.getHistory(userId, 5000);
      const totalIncome = currentTransactions.filter(t => t.trend === 'increment').reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = currentTransactions.filter(t => t.trend === 'decrement').reduce((acc, t) => acc + t.amount, 0);
      
      await UserRepository.updateMetrics(userId, totalIncome - totalExpense, totalExpense);
      
      // 4. Update Store
      set({
        transactions: history,
        monthlySummary: summary,
        loading: false,
      });
      
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },
}));
