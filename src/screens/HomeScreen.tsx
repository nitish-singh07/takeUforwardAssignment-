import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { HeroCard } from '../components/ui/HeroCard';
import { TabSwitch, TabSwitchOption } from '../components/common/TabSwitch';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNavigation } from '@react-navigation/native';
import { ExpenseRecord } from '../types';
import { formatAmount } from '../utils/currency';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel(): string {
  return new Date().toLocaleDateString('default', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const [activeTab,           setActiveTab]           = useState<0 | 1>(0); // 0=Weekly, 1=Monthly
  const { colors }            = useTheme();
  const { user }              = useAuthStore();
  const { transactions, monthlySummary, fetchData, loading } = useFinanceStore();
  const triggerHaptic         = useSettingsStore(state => state.triggerHaptic);
  const navigation            = useNavigation();

  // Filter logic: Weekly (since Mon) vs Monthly
  const { displayedTransactions, weeklyCount, monthlyCount } = useMemo(() => {
    const now = new Date();
    
    // Start of Week (Monday)
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; 
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const weekTs = startOfWeek.getTime();

    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthTs = startOfMonth.getTime();

    const weekly  = transactions.filter((tx: ExpenseRecord) => tx.timestamp >= weekTs);
    const monthly = transactions.filter((tx: ExpenseRecord) => tx.timestamp >= monthTs);

    return {
      displayedTransactions: activeTab === 0 ? weekly : monthly,
      weeklyCount:  weekly.length,
      monthlyCount: monthly.length,
    };
  }, [transactions, activeTab]);

  const monthName = new Date().toLocaleDateString('default', { month: 'long' });

  useEffect(() => {
    if (user) fetchData(user.id);
  }, [user]);

  const onRefresh = () => {
    if (user) {
      triggerHaptic('selection');
      fetchData(user.id);
    }
  };

  const handleAddPress = () => {
    triggerHaptic('selection');
    (navigation as any).navigate('AddTransaction');
  };

  const handlePress = (tx: ExpenseRecord) => {
    triggerHaptic('selection');
    (navigation as any).navigate('TransactionDetails', { transaction: tx });
  };

  const periodOptions: TabSwitchOption<0 | 1>[] = [
    { label: 'Weekly', value: 0, count: weeklyCount },
    { label: 'Monthly', value: 1, count: monthlyCount },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        {/* ── Greeting ── */}
        <View style={styles.greeting}>
          <Typography variant="heading2">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'there'}
          </Typography>
          <Typography variant="caption" style={{ color: colors.textTertiary, marginTop: 4 }}>
            {todayLabel()}
          </Typography>
        </View>

        {/* ── Balance hero card (Modularized) ── */}
        <HeroCard
          balance={user?.balance ?? 0}
          monthlyIncome={monthlySummary.income}
          monthlyExpense={monthlySummary.expense}
          holderName={user?.fullName ?? 'User'}
          monthName={monthName}
        />

        {/* ── Transactions section ── */}
        <View style={styles.txSection}>

          {/* Section header */}
          <View style={styles.txHeader}>
            <Typography variant="heading3">Transactions</Typography>
            {transactions.length > 0 && (
              <Typography variant="caption" style={{ color: colors.textTertiary }}>
                {transactions.length} total
              </Typography>
            )}
          </View>

          {/* Tab row (Sliding TabSwitch) */}
          {transactions.length > 0 && (
            <View style={styles.tabRow}>
              <TabSwitch
                options={periodOptions}
                value={activeTab}
                onChange={(val) => {
                  setActiveTab(val);
                  triggerHaptic('selection');
                }}
              />
            </View>
          )}

          {/* List */}
          <View style={styles.list}>
            {transactions.length === 0 ? (
              /* ── Styled empty state ── */
              <View style={[styles.emptyState, { borderColor: colors.border }]}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons name="receipt-outline" size={36} color={colors.textTertiary} />
                </View>
                <Typography variant="bodySemiBold" style={{ marginTop: Spacing.lg }}>
                  No transactions yet
                </Typography>
                <Typography
                  variant="caption"
                  style={{ color: colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center' }}
                >
                  Tap the + button to add your{'\n'}first income or expense
                </Typography>
                <TouchableOpacity
                  onPress={handleAddPress}
                  style={[styles.emptyBtn, { backgroundColor: colors.text }]}
                >
                  <Ionicons name="add" size={16} color={colors.background} />
                  <Typography
                    variant="label"
                    style={{ color: colors.background, fontWeight: '700', marginLeft: 6 }}
                  >
                    Add Transaction
                  </Typography>
                </TouchableOpacity>
              </View>
            ) : (
              displayedTransactions.map(tx => (
                <ExpenseListItem
                  key={tx.id}
                  title={tx.category}
                  amount={formatAmount(tx.amount, tx.trend === 'increment')}
                  trend={tx.trend}
                  timestamp={tx.timestamp}
                  onPress={() => handlePress(tx)}
                />
              ))
            )}

            {/* "View All" button navigating to dedicated History Screen */}
            {transactions.length > 0 && (
              <TouchableOpacity
                onPress={() => { 
                  triggerHaptic('selection'); 
                  (navigation as any).navigate('History');
                }}
                style={[styles.showAllBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              >
                <Typography variant="bodySemiBold" style={{ color: colors.text }}>
                  View All Transactions
                </Typography>
                <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.text }]}
        onPress={handleAddPress}
      >
        <Ionicons name="add" size={30} color={colors.background} />
      </TouchableOpacity>

    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: Spacing['2xl'], paddingBottom: 120 },
  greeting:  { marginBottom: Spacing['3xl'] },
  txSection: { flex: 1 },
  txHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    marginBottom:   Spacing.lg,
  },
  tabRow: {
    marginBottom:  Spacing.xl,
  },
  list: {
    gap: Spacing.xs,
  },
  emptyState: {
    alignItems:      'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius:    Radii['2xl'],
    borderWidth:     1,
    borderStyle:     'dashed',
    marginTop:       Spacing.md,
  },
  emptyIcon: {
    width:          72,
    height:         72,
    borderRadius:   36,
    justifyContent: 'center',
    alignItems:     'center',
  },
  emptyBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    marginTop:         Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.md,
    borderRadius:      Radii.full,
  },
  showAllBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               Spacing.xs,
    marginTop:         Spacing.md,
    paddingVertical:   Spacing.md,
    borderRadius:      Radii.xl,
    borderWidth:       1,
  },
  fab: {
    position:       'absolute',
    bottom:         Spacing['3xl'],
    right:          Spacing['2xl'],
    width:          60,
    height:         60,
    borderRadius:   Radii.full,
    justifyContent: 'center',
    alignItems:     'center',
    elevation:      8,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius:   8,
  },
});
