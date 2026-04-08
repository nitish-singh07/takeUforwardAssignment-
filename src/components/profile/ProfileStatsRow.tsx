import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  value: string;
  color: 'success' | 'error' | 'text';
}

interface ProfileStatsRowProps {
  balance: number;
  totalSpendings: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({
  balance,
  totalSpendings,
}) => {
  const { colors } = useTheme();

  const stats: StatItem[] = [
    {
      label: 'Balance',
      value: `$${balance.toLocaleString()}`,
      color: 'success',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpendings.toLocaleString()}`,
      color: 'error',
    },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat, index) => (
        <View
          key={stat.label}
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              // Stronger left border accent for the first card
              borderLeftWidth: index === 0 ? 3 : 1,
              borderLeftColor: index === 0 ? colors.success : colors.error,
            },
          ]}
        >
          <Typography
            variant="heading3"
            style={{ color: colors[stat.color] }}
          >
            {stat.value}
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
    flexDirection: 'row',
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: Radii.xl,
    borderWidth: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'flex-start',
  },
});
