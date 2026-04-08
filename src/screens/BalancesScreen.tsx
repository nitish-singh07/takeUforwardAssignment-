/**
 * BalancesScreen — Analytics
 *
 * Shows all financial analytics with a Weekly / Monthly period toggle.
 * Switching the period updates:
 *   1. Header subtitle (period label)
 *   2. Spending Patterns bar chart (weekly days / monthly weeks)
 *   3. Overview Card (income / expense / balance for the selected period)
 *   4. Financial Health Gauge (score derived from selected period)
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { CreditGauge } from '../components/ui/CreditGauge';
import { SpendingChart } from '../components/ui/SpendingChart';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNavigation } from '@react-navigation/native';

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
  const now    = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { from: monday.getTime(), to: sunday.getTime() };
}

function getMonthDateRange(): { from: number; to: number } {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: start.getTime(), to: end.getTime() };
}

function healthLabel(score: number): string {
  if (score > 700) return 'Excellent financial health';
  if (score > 400) return 'Stable financial health';
  return 'High spending this period';
}

// ─── Period Toggle ────────────────────────────────────────────────────────────

interface PeriodToggleProps {
  value:    Period;
  onChange: (v: Period) => void;
}

const PeriodToggle: React.FC<PeriodToggleProps> = ({ value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={[toggleStyles.container, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
      {(['weekly', 'monthly'] as Period[]).map(p => {
        const isActive = value === p;
        return (
          <TouchableOpacity
            key={p}
            onPress={() => onChange(p)}
            activeOpacity={0.8}
            style={[
              toggleStyles.option,
              isActive && { backgroundColor: colors.text },
            ]}
          >
            <Typography
              variant="label"
              style={{
                color:       isActive ? colors.background : colors.textSecondary,
                fontWeight:  '700',
                letterSpacing: 0.5,
                textTransform: 'capitalize',
              }}
            >
              {p === 'weekly' ? 'Weekly' : 'Monthly'}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection:  'row',
    borderRadius:   Radii.full,
    borderWidth:    1,
    padding:        3,
    alignSelf:      'flex-start',
  },
  option: {
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.xs + 2,
    borderRadius:      Radii.full,
  },
});

// ─── Overview Card ────────────────────────────────────────────────────────────

interface OverviewCardProps {
  income:   number;
  expense:  number;
  balance:  number;
  period:   Period;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ income, expense, balance, period }) => {
  const { colors } = useTheme();
  const net        = income - expense;
  const label      = period === 'weekly' ? 'This Week' : 'This Month';

  return (
    <LinearGradient
      colors={net >= 0 ? ['#0f2027', '#203a43', '#2c5364'] : ['#1a0a0a', '#3a1010', '#5a1a1a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={overviewStyles.card}
    >
      {/* Top row */}
      <View style={overviewStyles.topRow}>
        <View>
          <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
            NET BALANCE
          </Typography>
          <Typography
            variant="heading1"
            style={{ color: '#fff', marginTop: 4 }}
          >
            {net >= 0 ? '+' : ''}${Math.abs(net).toLocaleString()}
          </Typography>
        </View>
        <View style={[overviewStyles.badge, { backgroundColor: net >= 0 ? '#10b981' + '30' : '#ef4444' + '30' }]}>
          <Ionicons
            name={net >= 0 ? 'trending-up' : 'trending-down'}
            size={20}
            color={net >= 0 ? '#10b981' : '#ef4444'}
          />
        </View>
      </View>

      {/* Divider */}
      <View style={[overviewStyles.divider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />

      {/* Income / Expense */}
      <View style={overviewStyles.statsRow}>
        <View style={overviewStyles.statItem}>
          <View style={overviewStyles.statDot}>
            <View style={[overviewStyles.dot, { backgroundColor: '#10b981' }]} />
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {label} Income
            </Typography>
          </View>
          <Typography variant="bodySemiBold" style={{ color: '#10b981' }}>
            +${income.toLocaleString()}
          </Typography>
        </View>

        <View style={overviewStyles.statItem}>
          <View style={overviewStyles.statDot}>
            <View style={[overviewStyles.dot, { backgroundColor: '#ef4444' }]} />
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {label} Expenses
            </Typography>
          </View>
          <Typography variant="bodySemiBold" style={{ color: '#ef4444' }}>
            -${expense.toLocaleString()}
          </Typography>
        </View>
      </View>
    </LinearGradient>
  );
};

const overviewStyles = StyleSheet.create({
  card: {
    borderRadius: Radii['2xl'],
    padding:      Spacing.xl,
    gap:          Spacing.lg,
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  badge: {
    width:          44,
    height:         44,
    borderRadius:   Radii.full,
    justifyContent: 'center',
    alignItems:     'center',
  },
  divider: {
    height: 1,
  },
  statsRow: {
    gap: Spacing.sm,
  },
  statItem: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  statDot: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.xs,
  },
  dot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const BalancesScreen: React.FC = () => {
  const { user }   = useAuthStore();
  const {
    monthlySummary,
    weeklyData,
    monthlyWeekData,
    fetchData,
    loading,
  }                  = useFinanceStore();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);
  const { colors }   = useTheme();
  const navigation   = useNavigation();

  const [period,    setPeriod]    = useState<Period>('weekly');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) fetchData(user.id);
  }, [user]);

  // ── Derive period-specific values ──────────────────────────────────────────

  const periodRange = useMemo(() =>
    period === 'weekly' ? getWeekDateRange() : getMonthDateRange(),
  [period]);

  // For weekly period, sum the weeklyData points
  const weeklyStats = useMemo(() => {
    const income  = weeklyData.reduce((s, d) => s + d.income,  0);
    const expense = weeklyData.reduce((s, d) => s + d.expense, 0);
    return { income, expense, balance: income - expense };
  }, [weeklyData]);

  const periodStats  = period === 'weekly' ? weeklyStats : monthlySummary;
  const periodLabel  = getPeriodLabel(period);
  const chartData    = period === 'weekly' ? weeklyData : monthlyWeekData;

  const totalActivity = periodStats.income + periodStats.expense;
  const healthScore   = totalActivity > 0
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['bottom']}>
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
          <PeriodToggle value={period} onChange={setPeriod} />
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

        {/* ── Overview card ── */}
        <View style={styles.section}>
          <OverviewCard
            income={periodStats.income}
            expense={periodStats.expense}
            balance={periodStats.balance}
            period={period}
          />
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
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding:        Spacing['2xl'],
    paddingBottom:  120,
    gap:            Spacing.xl,
  },
  titleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  section: {
    gap: Spacing.md,
  },
  chartSection: {
    gap:             Spacing.md,
    marginHorizontal: -Spacing['2xl'], // bleed to screen edges
  },
  sectionHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    marginBottom:   Spacing.xs,
  },
  fab: {
    position:     'absolute',
    bottom:       Spacing['3xl'],
    right:        Spacing['2xl'],
    width:        60,
    height:       60,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems:     'center',
    elevation:    8,
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
