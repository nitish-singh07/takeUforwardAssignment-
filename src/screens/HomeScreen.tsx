import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Radii, Gradients } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Typography } from '../components/common/Typography';
import { Card } from '../components/common/Card';
import { TabSwitch } from '../components/common/TabSwitch';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { AddTransactionSheet } from '../components/ui/AddTransactionSheet';
import BottomSheet from '@gorhom/bottom-sheet';

import { ExpenseRecord } from '../types';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<ExpenseRecord | null>(null);
  const { colors } = useTheme();

  const { user } = useAuthStore();
  const { transactions, categories, fetchData, loading } = useFinanceStore();
  const triggerHaptic = useSettingsStore(state => state.triggerHaptic);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 0 = Recent (last 10), 1 = All
  const displayedTransactions = activeTab === 0
    ? transactions.slice(0, 10)
    : transactions;

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    }
  }, [user]);

  const onRefresh = () => {
    if (user) {
      triggerHaptic('selection');
      fetchData(user.id);
    }
  };

  const handleAddPress = () => {
    setSelectedTransaction(null);
    triggerHaptic('selection');
    bottomSheetRef.current?.expand();
  };

  const handleEditPress = (tx: ExpenseRecord) => {
    setSelectedTransaction(tx);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.expand();
  };

  const styles = makeStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.text} />
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
                <Ionicons name="receipt-outline" size={48} color={colors.border} />
                <Typography variant="body" color="textSecondary" style={{ marginTop: Spacing.md }}>
                  No transactions yet.
                </Typography>
              </View>
            ) : (
              displayedTransactions.map((tx) => (
                <ExpenseListItem
                  key={tx.id}
                  title={tx.category}
                  subtitle={tx.description || undefined}
                  amount={(tx.trend === 'decrement' ? '-' : '+') + '$' + tx.amount.toLocaleString()}
                  trend={tx.trend}
                  timestamp={tx.timestamp}
                  onLongPress={() => handleEditPress(tx)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Ionicons name="add" size={32} color={colors.background} />
      </TouchableOpacity>

      <AddTransactionSheet 
        ref={bottomSheetRef} 
        initialTransaction={selectedTransaction}
        onSuccess={() => user && fetchData(user.id)}
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      backgroundColor: colors.text,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });
