import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radii } from '../constants/theme';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { CreditGauge } from '../components/ui/CreditGauge';
import { SpendingChart } from '../components/ui/SpendingChart';
import { PeriodToggle, PeriodToggleOption } from '../components/common/PeriodToggle';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = 'weekly' | 'monthly';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPeriodLabel(period: Period): string {
  const now = new Date();
  if (period === 'monthly') {
    return now.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  }
  // For weekly: "Week of Apr 7"
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return `Week of ${monday.toLocaleDateString('default', { day: 'numeric', month: 'short' })}`;
}

function getWeekDateRange(): { from: number; to: number } {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { from: monday.getTime(), to: sunday.getTime() };
}

function getMonthDateRange(): { from: number; to: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: start.getTime(), to: end.getTime() };
}

function healthLabel(score: number): string {
  if (score > 700) return 'Excellent financial health';
  if (score > 400) return 'Stable financial health';
  return 'High spending this period';
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const BalancesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const {
    monthlySummary,
    weeklyData,
    monthlyWeekData,
    fetchData,
    loading,
  } = useFinanceStore();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [period, setPeriod] = useState<Period>('weekly');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchData(user.id);
  }, [user]);

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused && user) fetchData(user.id);
  }, [isFocused, user]);

  // ── Derive period-specific values ──────────────────────────────────────────

  const periodRange = useMemo(() =>
    period === 'weekly' ? getWeekDateRange() : getMonthDateRange(),
    [period]);

  // For weekly period, sum the weeklyData points
  const weeklyStats = useMemo(() => {
    const income = weeklyData.reduce((s, d) => s + d.income, 0);
    const expense = weeklyData.reduce((s, d) => s + d.expense, 0);
    return { income, expense, balance: income - expense };
  }, [weeklyData]);

  const periodStats = period === 'weekly' ? weeklyStats : monthlySummary;
  const periodLabel = getPeriodLabel(period);
  const chartData = period === 'weekly' ? weeklyData : monthlyWeekData;

  const totalActivity = periodStats.income + periodStats.expense;
  const healthScore = totalActivity > 0
    ? Math.round((periodStats.income / totalActivity) * 1000)
    : 500;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleRefresh = async () => {
    setRefreshing(true);
    if (user) await fetchData(user.id);
    setRefreshing(false);
  };

  const handleAddPress = () => {
    triggerHaptic('selection');
    (navigation as any).navigate('AddTransaction');
  };

  const periodOptions: PeriodToggleOption<Period>[] = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.text} />
        }
      >
        {/* ── Title + Period toggle ── */}
        <View style={styles.titleRow}>
          <View>
            <Typography variant="heading2">Analytics</Typography>
            <Typography variant="caption" style={{ color: colors.textTertiary, marginTop: 2 }}>
              {periodLabel}
            </Typography>
          </View>
          <PeriodToggle
            options={periodOptions}
            value={period}
            onChange={(val) => {
              setPeriod(val);
              triggerHaptic('selection');
            }}
          />
        </View>

        {/* ── Financial health gauge — first thing the user sees ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="heading3">Financial Health</Typography>
            <Typography variant="caption" style={{ color: colors.textTertiary }}>
              {period === 'weekly' ? 'This week' : 'This month'}
            </Typography>
          </View>
          <CreditGauge score={healthScore} label={healthLabel(healthScore)} />
        </View>

        {/* ── Bar chart ── */}
        <View style={styles.chartSection}>
          <SpendingChart
            data={chartData}
            period={period}
            periodIncome={periodStats.income}
            periodExpense={periodStats.expense}
            periodLabel={periodLabel}
          />
        </View>

      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.text }]} onPress={handleAddPress}>
        <Ionicons name="add" size={30} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing['2xl'],
    paddingBottom: 120,
    gap: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  section: {
    gap: Spacing.md,
  },
  chartSection: {
    gap: Spacing.md,
    marginHorizontal: -Spacing['2xl'], // bleed to screen edges
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing['3xl'],
    right: Spacing['2xl'],
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
