import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Gradients } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { TabSwitch } from '../components/common/TabSwitch';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { AddTransactionSheet } from '../components/ui/AddTransactionSheet';
import BottomSheet from '@gorhom/bottom-sheet';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Weekly, 1: Monthly
  const { user } = useAuthStore();
  const { transactions, fetchTransactions, loading } = useFinanceStore();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (user) {
      fetchTransactions(user.id);
    }
  }, [user]);

  const onRefresh = () => {
    if (user) {
      triggerHaptic('selection');
      fetchTransactions(user.id);
    }
  };

  const handleAddPress = () => {
    triggerHaptic('selection');
    bottomSheetRef.current?.expand();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.dark.text} />
        }
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <Typography variant="heading2" style={styles.greeting}>
            Hey, {user?.fullName?.split(' ')[0] || 'User'}
          </Typography>
          <Typography variant="body" color="textSecondary">
            {transactions.length > 0 ? "Here's your latest activity" : "Add your first expense"}
          </Typography>
        </View>

        {/* Hero Card */}
        <Card
          variant="gradient"
          gradientColors={Gradients.dark.creditCard}
          style={styles.heroCard}
        >
          <View style={styles.cardHeader}>
            <Typography variant="heading4" color="text" style={styles.bankName}>
              PayU Card
            </Typography>
            <Ionicons name="flash-outline" size={24} color="white" />
          </View>
          
          <Typography variant="heading1" color="text" style={styles.cardNumber}>
            **** **** **** {user?.id?.slice(-4) || '0000'}
          </Typography>

          <View style={styles.cardFooter}>
            <View>
              <Typography variant="caption" color="text" style={styles.label}>
                Balance
              </Typography>
              <Typography variant="heading3" color="text">
                ${user?.balance?.toLocaleString() || '0.00'}
              </Typography>
            </View>
            <View>
              <Typography variant="caption" color="text" style={styles.label}>
                Status
              </Typography>
              <Typography variant="bodySemiBold" color="text">
                Active
              </Typography>
            </View>
          </View>
        </Card>

        {/* Expenses Section */}
        <View style={styles.expensesSection}>
          <Typography variant="heading3" style={styles.sectionTitle}>
            Transactions
          </Typography>
          
          <TabSwitch
            options={['Recent', 'All']}
            activeIndex={activeTab}
            onSelect={setActiveTab}
            style={styles.tabSwitch}
          />

          <View style={styles.expenseList}>
            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={Colors.dark.border} />
                <Typography variant="body" color="textSecondary" style={{ marginTop: Spacing.md }}>
                  No transactions yet.
                </Typography>
              </View>
            ) : (
              transactions.map((tx) => (
                <ExpenseListItem
                  key={tx.id}
                  title={tx.category}
                  subtitle={tx.description || tx.category}
                  amount={(tx.trend === 'decrement' ? '-' : '+') + '$' + tx.amount.toLocaleString()}
                  trend={tx.trend}
                  iconName={
                    tx.category === 'Food' ? 'restaurant-outline' :
                    tx.category === 'Transport' ? 'car-outline' :
                    tx.category === 'Salary' ? 'cash-outline' :
                    'cart-outline'
                  }
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Ionicons name="add" size={32} color={Colors.dark.background} />
      </TouchableOpacity>

      <AddTransactionSheet 
        ref={bottomSheetRef} 
        onSuccess={() => user && fetchTransactions(user.id)}
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
    marginBottom: Spacing['3xl'],
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  heroCard: {
    height: 220,
    justifyContent: 'space-between',
    padding: Spacing['2xl'],
    marginBottom: Spacing['4xl'],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    fontWeight: '700',
    opacity: 0.9,
  },
  cardNumber: {
    fontSize: 28,
    letterSpacing: 2,
    marginVertical: Spacing.xl,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    opacity: 0.7,
    marginBottom: 4,
  },
  expensesSection: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  tabSwitch: {
    marginBottom: Spacing.xl,
  },
  expenseList: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    opacity: 0.5,
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
