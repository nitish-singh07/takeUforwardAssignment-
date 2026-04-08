/**
 * Central configuration for category colours and icons.
 * Used across: AddTransactionSheet chips, ExpenseListItem icon bg, SearchScreen filters.
 */

import { Ionicons } from '@expo/vector-icons';

export interface CategoryConfig {
  icon:  keyof typeof Ionicons.glyphMap;
  color: string; // Brand colour for the category
}

// ─── Expense categories ───────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES: Record<string, CategoryConfig> = {
  Food:        { icon: 'restaurant-outline',  color: '#FF6B6B' },
  Transport:   { icon: 'car-outline',         color: '#4ECDC4' },
  Rent:        { icon: 'home-outline',        color: '#45B7D1' },
  Shopping:    { icon: 'cart-outline',        color: '#FFA07A' },
  Health:      { icon: 'medical-outline',     color: '#98D8C8' },
  Education:   { icon: 'book-outline',        color: '#C3B1E1' },
  Travel:      { icon: 'airplane-outline',    color: '#FFD93D' },
  Bills:       { icon: 'receipt-outline',     color: '#F4A261' },
  General:     { icon: 'apps-outline',        color: '#A0A0B0' },
};

// ─── Income categories ────────────────────────────────────────────────────────

export const INCOME_CATEGORIES: Record<string, CategoryConfig> = {
  Salary:      { icon: 'cash-outline',           color: '#6BCB77' },
  Freelance:   { icon: 'briefcase-outline',      color: '#4D96FF' },
  Investment:  { icon: 'trending-up-outline',    color: '#FFD166' },
  Gift:        { icon: 'gift-outline',           color: '#EF476F' },
  Business:    { icon: 'storefront-outline',     color: '#06D6A0' },
  General:     { icon: 'apps-outline',           color: '#A0A0B0' },
};

// ─── Combined lookup ─────────────────────────────────────────────────────────

const ALL_CATEGORIES: Record<string, CategoryConfig> = {
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
};

const FALLBACK: CategoryConfig = { icon: 'apps-outline', color: '#A0A0B0' };

/**
 * Look up a category's config by name (case-insensitive).
 * Returns a fallback if the category is not in the preset map.
 */
export function getCategoryConfig(name: string): CategoryConfig {
  return (
    ALL_CATEGORIES[name] ??
    Object.entries(ALL_CATEGORIES).find(
      ([key]) => key.toLowerCase() === name.toLowerCase()
    )?.[1] ??
    FALLBACK
  );
}

/**
 * Get all unique category names for a transaction type.
 */
export function getDefaultCategories(type: 'income' | 'expense'): string[] {
  return Object.keys(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES);
}
