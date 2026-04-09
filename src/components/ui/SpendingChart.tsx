import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { WeeklyDataPoint } from '../../store/financeStore';
import { Spacing, Radii } from '../../constants/theme';
import { formatChartY, formatCurrency } from '../../utils/currency';

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_WIDTH = 30;
const GROUP_SPACING = 32;  // between groups in separate charts

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpendingChartProps {
  data: WeeklyDataPoint[];
  period: 'weekly' | 'monthly';
  periodIncome: number;
  periodExpense: number;
  periodLabel: string;  // e.g. "Week of 7 Apr" or "April 2026"
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  period,
  periodIncome,
  periodExpense,
  periodLabel,
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 50;

  // Colors from creditCard gradient
  const EXPENSE_COLOR = '#FBDE9D'; // Gold/Peach
  const INCOME_COLOR = '#3BB9A1'; // Teal

  // Which index is "current"? (today's DOW for weekly, current week for monthly)
  const todayIdx = useMemo(() => {
    if (period === 'weekly') return new Date().getDay(); // 0=Sun
    return Math.min(Math.floor((new Date().getDate() - 1) / 7), 3);
  }, [period]);

  const isEmpty = data.every(d => d.income === 0 && d.expense === 0);

  // 1. Expense Bar Data
  const expenseBarData = useMemo(() => {
    return data.map((point, i) => {
      const isCurrent = i === todayIdx;
      return {
        value: point.expense,
        frontColor: EXPENSE_COLOR,
        label: point.label,
        labelTextStyle: {
          color: isCurrent ? colors.text : colors.textTertiary,
          fontSize: 10,
          fontWeight: isCurrent ? '700' : '400',
          width: BAR_WIDTH + 10,
          textAlign: 'center',
        },
        spacing: GROUP_SPACING,
      };
    });
  }, [data, todayIdx, colors, EXPENSE_COLOR]);

  // 2. Income Bar Data
  const incomeBarData = useMemo(() => {
    return data.map((point, i) => {
      const isCurrent = i === todayIdx;
      return {
        value: point.income,
        frontColor: INCOME_COLOR,
        label: point.label,
        labelTextStyle: {
          color: isCurrent ? colors.text : colors.textTertiary,
          fontSize: 10,
          fontWeight: isCurrent ? '700' : '400',
          width: BAR_WIDTH + 10,
          textAlign: 'center',
        },
        spacing: GROUP_SPACING,
      };
    });
  }, [data, todayIdx, colors, INCOME_COLOR]);

  const maxValue = useMemo(() => {
    const all = data.flatMap(d => [d.income, d.expense]);
    return Math.max(...all, 100);
  }, [data]);

  const yAxisMax = useMemo(() => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return Math.ceil(maxValue / magnitude) * magnitude;
  }, [maxValue]);

  const noActivityLabel = period === 'weekly' ? 'No activity this week' : 'No activity this month';

  const renderChart = (barData: any[], color: string, title: string) => (
    <View style={styles.chartSection}>
      <View style={styles.chartHeader}>
        <Typography variant="heading4">{title}</Typography>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
      </View>
      <View key={data.map(d => `${d.income}-${d.expense}`).join(',')} style={styles.chartWrapper}>
        <BarChart
          data={barData}
          width={chartWidth}
          height={160}
          barWidth={BAR_WIDTH}
          maxValue={yAxisMax}
          noOfSections={4} // show 4 segments for better tracking
          yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
          yAxisColor={colors.border}
          yAxisThickness={0}
          formatYLabel={formatChartY}
          xAxisColor={colors.border}
          xAxisThickness={1}
          // Grid lines (Rules)
          showVerticalLines={false}
          rulesType="dashed"
          rulesColor={colors.border} // subtler dashed lines
          dashWidth={5}
          dashGap={3}
          // Premium Gradient Config
          showGradient
          gradientColor={colors.backgroundSecondary}
          barBorderRadius={8}
          isAnimated
          animationDuration={800}
          backgroundColor="transparent"
          disablePress
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>

      {/* ── Period Info ── */}
      <View style={styles.periodHeader}>
        <Typography variant="bodySemiBold">Performance Summary</Typography>
        <Typography variant="caption" style={{ color: colors.textTertiary }}>
          {periodLabel}
        </Typography>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Typography variant="caption" style={{ color: colors.textTertiary }}>
            {noActivityLabel}
          </Typography>
        </View>
      ) : (
        <View style={styles.chartsColumn}>
          {renderChart(expenseBarData, EXPENSE_COLOR, 'Spending Patterns')}
          <View style={[styles.chartDivider, { backgroundColor: colors.border }]} />
          {renderChart(incomeBarData, INCOME_COLOR, 'Income Patterns')}
        </View>
      )}

      {/* ── Footer summary ── */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Typography variant="caption" style={styles.footerLabel}>
            INCOME
          </Typography>
          <Typography variant="bodySemiBold" style={{ color: INCOME_COLOR }}>
            +{formatCurrency(periodIncome)}
          </Typography>
        </View>

        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.footerItem}>
          <Typography variant="caption" style={styles.footerLabel}>
            EXPENSES
          </Typography>
          <Typography variant="bodySemiBold" style={{ color: EXPENSE_COLOR }}>
            −{formatCurrency(periodExpense)}
          </Typography>
        </View>

        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.footerItem}>
          <Typography variant="caption" style={styles.footerLabel}>NET</Typography>
          <Typography
            variant="bodySemiBold"
            style={{ color: periodIncome - periodExpense >= 0 ? INCOME_COLOR : EXPENSE_COLOR }}
          >
            {periodIncome - periodExpense >= 0 ? '+' : '−'}{formatCurrency(Math.abs(periodIncome - periodExpense))}
          </Typography>
        </View>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    borderWidth: 1,
    overflow: 'hidden',
  },
  periodHeader: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  chartsColumn: {
    paddingBottom: Spacing.lg,
  },
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  colorIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  chartWrapper: {
    paddingBottom: Spacing.xs,
  },
  chartDivider: {
    height: 1,
    marginVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
  },
  emptyState: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: Spacing.lg,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  footerLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  footerDivider: {
    width: 1,
    height: '100%',
  },
});
