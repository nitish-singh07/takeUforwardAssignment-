import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Haptics from 'expo-haptics';

import { Spacing } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { useTheme } from '../context/ThemeContext';
import { ExpenseRecord } from '../types';
import { formatAmount, formatCurrency } from '../utils/currency';

// Modular Components
import { SearchHeader } from '../components/search/SearchHeader';
import { SearchFilters } from '../components/search/SearchFilters';
import { DateRangeModal, CustomRange } from '../components/search/DateRangeModal';
import { useTransactionSearch } from '../hooks/useTransactionSearch';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  // Search Logic & State Hook (includes 300ms Debouncing)
  const {
    query,
    setQuery,
    typeFilter,
    setTypeFilter,
    catFilter,
    setCatFilter,
    dateKey,
    setDateKey,
    customRange,
    setCustomRange,
    results,
    searching,
    incomeTotal,
    expenseTotal,
    isFiltered,
    displayList,
  } = useTransactionSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showRangeModal, setShowRangeModal] = useState(false);

  // Label for the custom chip
  const customLabel = dateKey === 'custom'
    ? (customRange.from.toDateString() === customRange.to.toDateString()
        ? fmtDate(customRange.from)
        : `${customRange.from.toLocaleDateString('default', { day: 'numeric', month: 'short' })} – ${customRange.to.toLocaleDateString('default', { day: 'numeric', month: 'short' })}`)
    : 'Custom Range';

  const renderItem = ({ item }: { item: ExpenseRecord }) => (
    <ExpenseListItem
      title={item.category}
      amount={formatAmount(item.amount, item.trend === 'increment')}
      trend={item.trend}
      timestamp={item.timestamp}
      onPress={() => (navigation as any).navigate('TransactionDetails', { transaction: item })}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconBox, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
      </View>
      <Typography variant="bodySemiBold" style={{ marginTop: Spacing.lg }}>
        {isFiltered ? 'No results found' : 'No transactions yet'}
      </Typography>
      <Typography variant="caption" style={{ color: colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center' }}>
        {isFiltered ? 'Try changing your filters\nor search term' : 'Your transactions will appear here'}
      </Typography>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.flex} edges={['top']}>
        
        <SearchHeader
          query={query}
          setQuery={setQuery}
          searching={searching}
          isFocused={isFocused}
          setIsFocused={setIsFocused}
        />

        <SearchFilters
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dateKey={dateKey}
          setDateKey={setDateKey}
          catFilter={catFilter}
          setCatFilter={setCatFilter}
          customLabel={customLabel}
          onOpenCustomRange={() => setShowRangeModal(true)}
        />

        {/* ── Results summary bar ── */}
        {isFiltered && !searching && (
          <View style={[styles.summaryBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
            <Typography variant="caption" style={{ color: colors.textTertiary }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Typography>
            <View style={styles.summaryTotals}>
              {incomeTotal > 0 && (
                <Typography variant="caption" style={{ color: '#10b981', fontWeight: '700' }}>
                  +{formatCurrency(incomeTotal)}
                </Typography>
              )}
              {expenseTotal > 0 && (
                <Typography variant="caption" style={{ color: '#ef4444', fontWeight: '700' }}>
                  −{formatCurrency(expenseTotal)}
                </Typography>
              )}
            </View>
          </View>
        )}

        {/* ── Section label ── */}
        <View style={styles.sectionLabel}>
          <Typography variant="label" style={{ color: colors.textTertiary, letterSpacing: 1.5, fontSize: 10 }}>
            {isFiltered ? 'RESULTS' : 'RECENT TRANSACTIONS'}
          </Typography>
        </View>

        {/* ── List ── */}
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

      </SafeAreaView>

      <DateRangeModal
        visible={showRangeModal}
        initial={customRange}
        onApply={(range: CustomRange) => {
          setCustomRange(range);
          setDateKey('custom');
          setShowRangeModal(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }}
        onCancel={() => setShowRangeModal(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen:   { flex: 1 },
  flex:     { flex: 1 },
  summaryBar: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    borderBottomWidth: 1,
  },
  summaryTotals: { flexDirection: 'row', gap: Spacing.md },
  sectionLabel: {
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.lg,
    paddingBottom:     Spacing.sm,
  },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
});
