import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { TransactionRepository } from '../database/TransactionRepository';
import { ExpenseRecord } from '../types';

export type TypeFilter = 'all' | 'income' | 'expense';
export type DateRangeKey = 'all' | 'today' | 'week' | 'month' | 'custom';
interface CustomRange { from: Date; to: Date }

interface SearchResults {
  results: ExpenseRecord[];
  searching: boolean;
  incomeTotal: number;
  expenseTotal: number;
  isFiltered: boolean;
}

function getPresetRange(key: DateRangeKey): { from?: number; to?: number } {
  const now = Date.now();
  const sod = new Date(); sod.setHours(0, 0, 0, 0);
  switch (key) {
    case 'today': return { from: sod.getTime(), to: now };
    case 'week': {
      const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0);
      return { from: d.getTime(), to: now };
    }
    case 'month': {
      const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
      return { from: d.getTime(), to: now };
    }
    default: return {};
  }
}

export const useTransactionSearch = () => {
  const { user } = useAuthStore();
  const { transactions } = useFinanceStore();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [catFilter, setCatFilter] = useState<string | undefined>(undefined);
  const [dateKey, setDateKey] = useState<DateRangeKey>('all');
  const [customRange, setCustomRange] = useState<CustomRange>({
    from: (() => { const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d; })(),
    to: new Date(),
  });

  const [results, setResults] = useState<ExpenseRecord[]>([]);
  const [searching, setSearching] = useState(false);

  // 1. Debounce the query string
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  // 2. Execute search when filters or debounced query change
  useEffect(() => {
    if (user) runSearch();
  }, [debouncedQuery, typeFilter, catFilter, dateKey, customRange, user]);

  const runSearch = useCallback(async () => {
    if (!user) return;
    setSearching(true);
    try {
      const range =
        dateKey === 'custom'
          ? { from: customRange.from.getTime(), to: customRange.to.getTime() }
          : getPresetRange(dateKey);

      const res = await TransactionRepository.searchTransactions(
        user.id,
        debouncedQuery || undefined,
        typeFilter !== 'all' ? typeFilter : undefined,
        catFilter,
        range.from,
        range.to,
        300
      );
      setResults(res);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [user, debouncedQuery, typeFilter, catFilter, dateKey, customRange]);

  const isFiltered = query.length > 0 || typeFilter !== 'all' || catFilter !== undefined || dateKey !== 'all';

  const { incomeTotal, expenseTotal } = useMemo(() => {
    return results.reduce(
      (acc, r) => {
        if (r.trend === 'increment') acc.incomeTotal += r.amount;
        else acc.expenseTotal += r.amount;
        return acc;
      },
      { incomeTotal: 0, expenseTotal: 0 }
    );
  }, [results]);

  return {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    catFilter,
    setCatFilter,
    dateKey,
    setDateKey,
    customRange,
    setCustomRange,
    results,
    searching,
    incomeTotal,
    expenseTotal,
    isFiltered,
    displayList: isFiltered ? results : transactions.slice(0, 20),
  };
};
