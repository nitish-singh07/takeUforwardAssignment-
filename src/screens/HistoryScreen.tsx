import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { useTheme } from '../context/ThemeContext';
import { useFinanceStore } from '../store/financeStore';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { ExpenseRecord } from '../types';
import { formatAmount } from '../utils/currency';
import * as Haptics from 'expo-haptics';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSectionTitle(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) return 'TODAY';
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
  
  // Same year: "15 APRIL"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('default', { day: 'numeric', month: 'long' }).toUpperCase();
  }
  
  // Different year: "APRIL 2023"
  return date.toLocaleDateString('default', { month: 'long', year: 'numeric' }).toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { transactions } = useFinanceStore();

  const sections = useMemo(() => {
    const groups: { [key: string]: ExpenseRecord[] } = {};
    
    transactions.forEach(tx => {
      const title = getSectionTitle(tx.timestamp);
      if (!groups[title]) groups[title] = [];
      groups[title].push(tx);
    });

    return Object.keys(groups).map(title => ({
      title,
      data: groups[title],
    }));
  }, [transactions]);

  const handlePress = (tx: ExpenseRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate('TransactionDetails', { transaction: tx });
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.backgroundSecondary }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="heading3">History</Typography>
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('Search')}
          style={[styles.backBtn, { backgroundColor: colors.backgroundSecondary }]}
        >
          <Ionicons name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Grouped List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Typography variant="label" style={{ color: colors.textTertiary, letterSpacing: 1 }}>
              {title}
            </Typography>
          </View>
        )}
        renderItem={({ item }) => (
          <ExpenseListItem
            title={item.category}
            amount={formatAmount(item.amount, item.trend === 'increment')}
            trend={item.trend}
            timestamp={item.timestamp}
            onPress={() => handlePress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Typography variant="bodySemiBold" style={{ color: colors.textSecondary, marginTop: Spacing.md }}>
              No transactions found
            </Typography>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  sectionHeader: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  empty: {
    paddingTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
