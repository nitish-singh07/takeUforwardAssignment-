import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { useFinanceStore } from '../../store/financeStore';
import { formatCurrency } from '../../utils/currency';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileStatsRowProps {
  balance:        number;
  totalSpendings: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({ balance }) => {
  const { colors } = useTheme();

  // Real income and expense totals from all transactions
  const transactions = useFinanceStore(s => s.transactions);
  const totalIncome  = transactions
    .filter(t => t.trend === 'increment')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.trend === 'decrement')
    .reduce((s, t) => s + t.amount, 0);

  const stats = [
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      color: colors.success,
      accent: colors.success,
    },
    {
      label: 'Total Spent',
      value: formatCurrency(totalExpense),
      color: colors.error,
      accent: colors.error,
    },
    {
      label: 'Net Balance',
      value: formatCurrency(Math.abs(balance)),
      prefix: balance >= 0 ? '+' : '−',
      color: balance >= 0 ? colors.success : colors.error,
      accent: balance >= 0 ? colors.success : colors.error,
    },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat, i) => (
        <View
          key={stat.label}
          style={[
            styles.card,
            {
              backgroundColor:  colors.backgroundSecondary,
              borderColor:      colors.border,
              borderTopWidth:   3,
              borderTopColor:   stat.accent,
            },
          ]}
        >
          <Typography variant="heading3" style={{ color: stat.color }}>
            {stat.prefix ?? ''}{stat.value}
          </Typography>
          <Typography
            variant="caption"
            style={{ color: colors.textTertiary, marginTop: 3 }}
          >
            {stat.label}
          </Typography>
        </View>
      ))}
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection:    'row',
    marginHorizontal: Spacing['2xl'],
    marginTop:        Spacing.lg,
    marginBottom:     Spacing.xl,
    gap:              Spacing.md,
  },
  card: {
    flex:             1,
    borderRadius:     Radii.xl,
    borderWidth:      1,
    paddingVertical:  Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems:       'flex-start',
  },
});
