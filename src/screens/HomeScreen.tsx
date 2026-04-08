import React, { useState, useEffect } from 'react';
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
import * as Haptics from 'expo-haptics';
import { Spacing, Radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { useNavigation } from '@react-navigation/native';
import { ExpenseRecord } from '../types';

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

// ─── Balance Hero Card ────────────────────────────────────────────────────────

interface HeroCardProps {
  balance:        number;
  monthlyIncome:  number;
  monthlyExpense: number;
  holderName:     string;
  monthName:      string;
}

const HeroCard: React.FC<HeroCardProps> = ({
  balance, monthlyIncome, monthlyExpense, holderName, monthName,
}) => {
  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)
    : 0;

  const isPositive = balance >= 0;

  // Format balance like a card number feel: split dollars and cents
  const [dollars, cents] = Math.abs(balance).toFixed(2).split('.');

  return (
    <View style={heroStyles.wrapper}>
      {/* ── Bank card ── */}
      <LinearGradient
        colors={['#FBDE9D', '#3BB9A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={heroStyles.card}
      >
        {/* Top row */}
        <View style={heroStyles.topRow}>
          <Typography variant="bodySemiBold" style={heroStyles.bankName}>
            PayU
          </Typography>
          <View style={heroStyles.iconCircle}>
            <Ionicons name="wallet-outline" size={20} color="rgba(255,255,255,0.9)" />
          </View>
        </View>

        {/* Balance — centred, large */}
        <View style={heroStyles.balanceBlock}>
          <Typography variant="caption" style={heroStyles.balanceLabel}>
            Net Balance
          </Typography>
          <View style={heroStyles.balanceRow}>
            {!isPositive && (
              <Typography style={heroStyles.balanceSign}>−</Typography>
            )}
            <Typography style={heroStyles.balanceDollars}>
              ${dollars}
            </Typography>
            <Typography style={heroStyles.balanceCents}>.{cents}</Typography>
          </View>
        </View>

        {/* Bottom row */}
        <View style={heroStyles.bottomRow}>
          <View>
            <Typography variant="caption" style={heroStyles.dimLabel}>Card Holder</Typography>
            <Typography variant="bodySemiBold" style={heroStyles.holderName}>
              {holderName.toUpperCase()}
            </Typography>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Typography variant="caption" style={heroStyles.dimLabel}>{monthName}</Typography>
            <Typography variant="bodySemiBold" style={heroStyles.holderName}>
              {savingsRate >= 0 ? '+' : ''}{savingsRate}% saved
            </Typography>
          </View>
        </View>
      </LinearGradient>

      {/* ── Stats strip below card ── */}
      <View style={heroStyles.statsStrip}>
        <View style={heroStyles.statItem}>
          <View style={[heroStyles.statDot, { backgroundColor: '#10b981' }]} />
          <View>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
              Income
            </Typography>
            <Typography variant="bodySemiBold" style={{ color: '#10b981' }}>
              +${monthlyIncome.toLocaleString()}
            </Typography>
          </View>
        </View>

        <View style={heroStyles.statDivider} />

        <View style={heroStyles.statItem}>
          <View style={[heroStyles.statDot, { backgroundColor: '#ef4444' }]} />
          <View>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
              Expenses
            </Typography>
            <Typography variant="bodySemiBold" style={{ color: '#ef4444' }}>
              −${monthlyExpense.toLocaleString()}
            </Typography>
          </View>
        </View>

        <View style={heroStyles.statDivider} />

        <View style={heroStyles.statItem}>
          <View style={[heroStyles.statDot, { backgroundColor: isPositive ? '#10b981' : '#ef4444' }]} />
          <View>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
              Net
            </Typography>
            <Typography
              variant="bodySemiBold"
              style={{ color: isPositive ? '#10b981' : '#ef4444' }}
            >
              {isPositive ? '+' : '−'}${Math.abs(monthlyIncome - monthlyExpense).toLocaleString()}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

const heroStyles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing['2xl'],
    borderRadius: Radii['2xl'],
    overflow:     'hidden',
    // Shadow
    shadowColor:  '#3BB9A1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation:    10,
  },
  card: {
    height:            200,
    padding:           Spacing.xl,
    justifyContent:    'space-between',
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  bankName: {
    color:       'rgba(0,0,0,0.75)',
    fontWeight:  '800',
    fontSize:    18,
    letterSpacing: 0.5,
  },
  iconCircle: {
    width:          38,
    height:         38,
    borderRadius:   19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems:     'center',
  },
  balanceBlock: {
    alignItems: 'center',
  },
  balanceLabel: {
    color:         'rgba(0,0,0,0.5)',
    letterSpacing: 1,
    marginBottom:  4,
    textTransform: 'uppercase',
    fontSize:      10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
  },
  balanceSign: {
    color:        'rgba(0,0,0,0.75)',
    fontSize:     28,
    fontWeight:   '700',
    marginBottom: 4,
    marginRight:  2,
  },
  balanceDollars: {
    color:        'rgba(0,0,0,0.85)',
    fontSize:     42,
    fontWeight:   '900',
    letterSpacing: -1,
    lineHeight:   46,
  },
  balanceCents: {
    color:        'rgba(0,0,0,0.55)',
    fontSize:     22,
    fontWeight:   '700',
    marginBottom: 4,
    marginLeft:   2,
  },
  bottomRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  dimLabel: {
    color:         'rgba(0,0,0,0.45)',
    fontSize:      10,
    letterSpacing: 0.5,
    marginBottom:  2,
  },
  holderName: {
    color:        'rgba(0,0,0,0.8)',
    fontWeight:   '700',
    letterSpacing: 0.5,
  },
  // Stats strip (dark bg under card, same border radius)
  statsStrip: {
    flexDirection:     'row',
    backgroundColor:  '#111',
    paddingVertical:   Spacing.md,
    paddingHorizontal: Spacing.xl,
    justifyContent:    'space-around',
    alignItems:        'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  statDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  statDivider: {
    width:           1,
    height:          32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});


// ─── Tab button (replacing generic TabSwitch) ────────────────────────────────

interface TxTabProps {
  label:    string;
  count:    number;
  isActive: boolean;
  onPress:  () => void;
}

const TxTab: React.FC<TxTabProps> = ({ label, count, isActive, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        tabStyles.btn,
        { borderColor: isActive ? colors.text : colors.border },
        isActive && { backgroundColor: colors.text },
      ]}
    >
      <Typography
        variant="label"
        style={{
          color:       isActive ? colors.background : colors.textSecondary,
          fontWeight:  '700',
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>
      <View style={[
        tabStyles.badge,
        { backgroundColor: isActive ? colors.background + '30' : colors.backgroundTertiary },
      ]}>
        <Typography
          variant="caption"
          style={{
            color:      isActive ? colors.background : colors.textTertiary,
            fontWeight: '700',
            fontSize:   10,
          }}
        >
          {count}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const tabStyles = StyleSheet.create({
  btn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    borderRadius:      Radii.full,
    borderWidth:       1,
  },
  badge: {
    minWidth:          18,
    height:            18,
    borderRadius:      9,
    justifyContent:    'center',
    alignItems:        'center',
    paddingHorizontal: 4,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const [activeTab,           setActiveTab]           = useState(0); // 0=Recent, 1=All
  const [selectedTransaction, setSelectedTransaction] = useState<ExpenseRecord | null>(null);
  const { colors }            = useTheme();
  const { user }              = useAuthStore();
  const { transactions, monthlySummary, fetchData, loading } = useFinanceStore();
  const triggerHaptic         = useSettingsStore(state => state.triggerHaptic);
  const navigation            = useNavigation();

  // Recent = last 10, All = everything
  const RECENT_COUNT          = 10;
  const displayedTransactions = activeTab === 0
    ? transactions.slice(0, RECENT_COUNT)
    : transactions;

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

  const handleEditPress = (tx: ExpenseRecord) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate('AddTransaction', { transaction: tx });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
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

        {/* ── Balance hero card ── */}
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

          {/* Tab row — shows count so user understands what each tab means */}
          {transactions.length > 0 && (
            <View style={styles.tabRow}>
              <TxTab
                label="Recent"
                count={Math.min(RECENT_COUNT, transactions.length)}
                isActive={activeTab === 0}
                onPress={() => {
                  setActiveTab(0);
                  triggerHaptic('selection');
                }}
              />
              <TxTab
                label="All"
                count={transactions.length}
                isActive={activeTab === 1}
                onPress={() => {
                  setActiveTab(1);
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
                  subtitle={tx.description || undefined}
                  amount={(tx.trend === 'decrement' ? '−' : '+') + '$' + tx.amount.toLocaleString()}
                  trend={tx.trend}
                  timestamp={tx.timestamp}
                  onLongPress={() => handleEditPress(tx)}
                />
              ))
            )}

            {/* "Show all" hint when on Recent tab and more exist */}
            {activeTab === 0 && transactions.length > RECENT_COUNT && (
              <TouchableOpacity
                onPress={() => { setActiveTab(1); triggerHaptic('selection'); }}
                style={[styles.showAllBtn, { borderColor: colors.border }]}
              >
                <Typography variant="caption" style={{ color: colors.textSecondary }}>
                  +{transactions.length - RECENT_COUNT} more transactions
                </Typography>
                <Ionicons name="chevron-down" size={14} color={colors.textTertiary} />
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

    </SafeAreaView>
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
    flexDirection: 'row',
    gap:           Spacing.sm,
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
