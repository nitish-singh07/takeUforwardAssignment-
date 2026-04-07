import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { CreditGauge } from '../components/ui/CreditGauge';
import { SpendingChart } from '../components/ui/SpendingChart';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { AddTransactionSheet } from '../components/ui/AddTransactionSheet';
import BottomSheet from '@gorhom/bottom-sheet';

export const BalancesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { monthlySummary, fetchMonthlySummary } = useFinanceStore();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    if (user) {
      fetchMonthlySummary(user.id, currentMonth);
    }
  }, [user]);

  const handleAddPress = () => {
    triggerHaptic('selection');
    bottomSheetRef.current?.expand();
  };

  // Mock data for spending chart (would be derived from DB in full version)
  const chartData = [
    { label: 'Mon', value: 450, total: 1000 },
    { label: 'Tue', value: 900, total: 1000 },
    { label: 'Wed', value: 250, total: 1000 },
    { label: 'Thu', value: 550, total: 1000 },
    { label: 'Fri', value: 650, total: 1000 },
    { label: 'Sat', value: 400, total: 1000 },
  ];

  // Calculate health score: Income / (Income + Expense) * 1000
  const total = monthlySummary.income + monthlySummary.expense;
  const healthScore = total > 0 
    ? Math.round((monthlySummary.income / total) * 1000) 
    : 500;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <View style={styles.header}>
          <Typography variant="heading2" style={styles.title}>
            Analytics
          </Typography>
          <Typography variant="body" color="textSecondary">
            Monthly summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
        </View>

        {/* Credit/Health Score Gauge */}
        <CreditGauge
          score={healthScore}
          label={healthScore > 700 ? "Your financial health is excellent" : healthScore > 400 ? "Your financial health is stable" : "Your spending is high"}
        />

        {/* Monthly Totals */}
        <View style={styles.section}>
          <Typography variant="heading3" style={styles.sectionTitle}>
            Monthly Overview
          </Typography>
          <Card variant="solid" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Typography variant="caption" color="textSecondary">INCOME</Typography>
                <Typography variant="heading3" color="success">${monthlySummary.income.toLocaleString()}</Typography>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.summaryItem}>
                <Typography variant="caption" color="textSecondary">EXPENSES</Typography>
                <Typography variant="heading3" color="error">${monthlySummary.expense.toLocaleString()}</Typography>
              </View>
            </View>
          </Card>
        </View>

        {/* Spending Chart */}
        <View style={styles.section}>
          <Typography variant="heading3" style={styles.sectionTitle}>
            Spending Patterns
          </Typography>
          <SpendingChart data={chartData} />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Ionicons name="add" size={32} color={Colors.dark.background} />
      </TouchableOpacity>

      <AddTransactionSheet 
        ref={bottomSheetRef} 
        onSuccess={() => user && fetchMonthlySummary(user.id, currentMonth)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    padding: Spacing['2xl'],
    paddingBottom: 120,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  section: {
    marginTop: Spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing['4xl'],
    right: Spacing['2xl'],
    width: 64,
    height: 64,
    borderRadius: Radii.full,
    backgroundColor: Colors.dark.text,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
