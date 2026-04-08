/**
 * SpendingChart
 *
 * Grouped bar chart (Income vs Expense) powered by react-native-gifted-charts.
 * Switches between weekly (per day) and monthly (per week) data views.
 *
 * Y-axis shows dollar-formatted labels.
 * X-axis labels show day names (Mon, Tue…) or week names (Wk 1, Wk 2…).
 * Today (weekly view) / current week (monthly view) bars are highlighted.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { WeeklyDataPoint } from '../../store/financeStore';
import { Spacing, Radii } from '../../constants/theme';
import { formatChartY, formatCurrency } from '../../utils/currency';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Constants ────────────────────────────────────────────────────────────────

const INCOME_COLOR  = '#10b981';
const EXPENSE_COLOR = '#ef4444';
const BAR_WIDTH     = 14;
const BAR_SPACING   = 4;   // between income and expense bars in the same group
const GROUP_SPACING = 18;  // between groups

// ─── Types ───────────────────────────────────────────────────────────────────

interface SpendingChartProps {
  data:            WeeklyDataPoint[];
  period:          'weekly' | 'monthly';
  periodIncome:    number;
  periodExpense:   number;
  periodLabel:     string;  // e.g. "Week of 7 Apr" or "April 2026"
}


// ─── Component ───────────────────────────────────────────────────────────────

export const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  period,
  periodIncome,
  periodExpense,
  periodLabel,
}) => {
  const { colors, scheme } = useTheme();
  const screenWidth        = Dimensions.get('window').width;
  const chartWidth         = screenWidth - 50; // full-width card; 50px reserved for Y-axis labels


  // Which index is "current"? (today's DOW for weekly, current week for monthly)
  const todayIdx = useMemo(() => {
    if (period === 'weekly') return new Date().getDay(); // 0=Sun
    // current week of month: day 1-7 → 0, 8-14 → 1, etc.
    return Math.min(Math.floor((new Date().getDate() - 1) / 7), 3);
  }, [period]);

  const isEmpty = data.every(d => d.income === 0 && d.expense === 0);

  // Build gifted-charts bar data:
  // Each DataPoint group = two bars (income, expense) + spacing gap after
  const barData = useMemo(() => {
    const items: any[] = [];
    data.forEach((point, i) => {
      const isCurrentPeriod = i === todayIdx;
      const alpha = isCurrentPeriod ? 'FF' : 'AA';

      // Income bar
      items.push({
        value:       point.income,
        frontColor:  INCOME_COLOR + alpha,
        label:       point.label,
        labelTextStyle: {
          color:      isCurrentPeriod ? colors.text : colors.textTertiary,
          fontSize:   10,
          fontWeight: isCurrentPeriod ? '700' : '400',
          width:      BAR_WIDTH * 2 + BAR_SPACING + 4,
          textAlign:  'center',
        },
        spacing: BAR_SPACING,
      });

      // Expense bar (no label — label on income covers the group)
      items.push({
        value:       point.expense,
        frontColor:  EXPENSE_COLOR + alpha,
        spacing:     GROUP_SPACING,
      });
    });
    return items;
  }, [data, todayIdx, colors]);

  const maxValue = useMemo(() => {
    const all = data.flatMap(d => [d.income, d.expense]);
    return Math.max(...all, 100); // min 100 so empty chart still looks reasonable
  }, [data]);

  // Round up maxValue to a nice number for the Y-axis
  const yAxisMax = useMemo(() => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return Math.ceil(maxValue / magnitude) * magnitude;
  }, [maxValue]);

  const noActivityLabel = period === 'weekly' ? 'No activity this week' : 'No activity this month';

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Typography variant="bodySemiBold">Spending Patterns</Typography>
          <Typography variant="caption" style={{ color: colors.textTertiary, marginTop: 2 }}>
            {periodLabel}
          </Typography>
        </View>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: INCOME_COLOR }]} />
            <Typography variant="caption" style={{ color: colors.textSecondary }}>Income</Typography>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: EXPENSE_COLOR }]} />
            <Typography variant="caption" style={{ color: colors.textSecondary }}>Expense</Typography>
          </View>
        </View>
      </View>

      {/* ── Chart or empty state ── */}
      {isEmpty ? (
        <View style={styles.emptyState}>
          <Typography variant="caption" style={{ color: colors.textTertiary }}>
            {noActivityLabel}
          </Typography>
        </View>
      ) : (
        <View key={data.map(d => `${d.income}-${d.expense}`).join(',')} style={styles.chartWrapper}>
          <BarChart
            data={barData}
            width={chartWidth}
            height={180}
            barWidth={BAR_WIDTH}
            maxValue={yAxisMax}
            noOfSections={4}
            // Y-axis
            yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
            yAxisColor={colors.border}
            yAxisThickness={1}
            formatYLabel={formatChartY}
            // X-axis
            xAxisColor={colors.border}
            xAxisThickness={1}
            // Reference lines (horizontal gridlines)
            showReferenceLine1
            referenceLine1Position={yAxisMax * 0.5}
            referenceLine1Config={{
              color:     colors.border,
              dashWidth: 4,
              dashGap:   6,
              thickness: 1,
            }}
            // Visual
            barBorderRadius={4}
            isAnimated
            animationDuration={600}
            // Background
            backgroundColor="transparent"
            // Avoid clipping
            disablePress
          />
        </View>
      )}

      {/* ── Footer summary ── */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Typography variant="caption" style={{ color: colors.textTertiary }}>
            {period === 'weekly' ? 'Week Income' : 'Month Income'}
          </Typography>
          <Typography variant="bodySemiBold" style={{ color: INCOME_COLOR }}>
            {formatCurrency(periodIncome)}
          </Typography>
        </View>

        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.footerItem}>
          <Typography variant="caption" style={{ color: colors.textTertiary }}>
            {period === 'weekly' ? 'Week Expense' : 'Month Expense'}
          </Typography>
          <Typography variant="bodySemiBold" style={{ color: EXPENSE_COLOR }}>
            {formatCurrency(periodExpense)}
          </Typography>
        </View>

        <View style={[styles.footerDivider, { backgroundColor: colors.border }]} />

        <View style={styles.footerItem}>
          <Typography variant="caption" style={{ color: colors.textTertiary }}>Net</Typography>
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
  card: {
    borderRadius:   0,
    borderWidth:    1,
    overflow:       'hidden',
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.lg,
    paddingBottom:     Spacing.sm,
  },
  legend: {
    gap: Spacing.xs,
    alignItems: 'flex-end',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
  },
  legendDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  chartWrapper: {
    paddingBottom: Spacing.sm,
  },
  emptyState: {
    height:         160,
    justifyContent: 'center',
    alignItems:     'center',
  },
  footer: {
    flexDirection:  'row',
    borderTopWidth: 1,
    paddingVertical: Spacing.md,
  },
  footerItem: {
    flex:        1,
    alignItems:  'center',
    gap:         3,
  },
  footerDivider: {
    width: 1,
    height: '100%',
  },
});
