/**
 * formatCurrency — Indian number system currency formatter.
 *
 * Rules:
 *   0             →  ₹0
 *   < 1,000       →  ₹750
 *   1K – 99.9K    →  ₹1.2K
 *   1L – 99.9L    →  ₹1.2L   (1,00,000 = 1 Lakh)
 *   1Cr+          →  ₹1.2Cr  (1,00,00,000 = 1 Crore)
 *
 * Usage:
 *   import { formatCurrency, formatCurrencyCompact } from '../utils/currency';
 *
 *   formatCurrency(1234567) → "₹12.3L"
 *   formatCurrency(850)     → "₹850"
 *   formatCurrencyCompact(850.50) → "₹850.50"  (full precision, no abbreviation)
 */

const RUPEE = '₹';

/**
 * Smart abbreviated format — keeps the UI tight.
 * Always returns a short string like ₹1.2K, ₹3.5L, ₹2.1Cr.
 */
export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';

  if (abs === 0)            return `${RUPEE}0`;
  if (abs < 1_000)          return `${sign}${RUPEE}${abs.toLocaleString('en-IN')}`;
  if (abs < 1_00_000)       return `${sign}${RUPEE}${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  if (abs < 1_00_00_000)    return `${sign}${RUPEE}${(abs / 1_00_000).toFixed(1).replace(/\.0$/, '')}L`;
  return                           `${sign}${RUPEE}${(abs / 1_00_00_000).toFixed(1).replace(/\.0$/, '')}Cr`;
}

/**
 * Full-precision format — for detail views, receipts, etc.
 * Example: ₹1,23,456.50
 */
export function formatCurrencyFull(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';
  return `${sign}${RUPEE}${abs.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Signed format used in transaction lists: +₹1.2K or −₹500
 */
export function formatAmount(amount: number, isIncome: boolean): string {
  return (isIncome ? '+' : '−') + formatCurrency(amount);
}

/**
 * Y-axis label for charts (no sign, abbreviated).
 * Accepts the string label that gifted-charts provides.
 */
export function formatChartY(label: string): string {
  const val = parseFloat(label);
  if (isNaN(val)) return label;
  return formatCurrency(val);
}
