/**
 * SearchScreen
 *
 * PhonePe-style full-screen search pushed via native stack navigation.
 *
 * Features:
 *  - Auto-focused search input with back button
 *  - Type filter chips (All / Income / Expense)
 *  - Category filter chips (horizontal scroll)
 *  - Date range quick-select (Today / Week / Month / Custom)
 *  - Live results from SQLite via TransactionRepository.searchTransactions()
 *  - Recent transactions shown when no query/filter is active
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { ExpenseListItem } from '../components/ui/ExpenseListItem';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { TransactionRepository } from '../database/TransactionRepository';
import { getCategoryConfig, getDefaultCategories } from '../utils/categoryConfig';
import { ExpenseRecord } from '../types';
import * as Haptics from 'expo-haptics';

// ─── Constants ────────────────────────────────────────────────────────────────

type TypeFilter     = 'all' | 'income' | 'expense';
type DateRangeKey   = 'all' | 'today' | 'week' | 'month' | 'custom';

interface DateRange {
  from?: number;
  to?:   number;
}

function getDateRange(key: DateRangeKey): DateRange {
  const now  = Date.now();
  const sod  = new Date(); sod.setHours(0, 0, 0, 0);

  switch (key) {
    case 'today':
      return { from: sod.getTime(), to: now };
    case 'week': {
      const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0);
      return { from: d.getTime(), to: now };
    }
    case 'month': {
      const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
      return { from: d.getTime(), to: now };
    }
    default:
      return {};
  }
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

interface FilterChipProps {
  label:    string;
  isActive: boolean;
  color?:   string;
  onPress:  () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, isActive, color, onPress }) => {
  const { colors } = useTheme();
  const accent = color ?? colors.text;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        chipStyles.chip,
        { borderColor: isActive ? accent : colors.border },
        isActive && { backgroundColor: accent + '18' },
      ]}
    >
      <Typography
        variant="caption"
        style={{ color: isActive ? accent : colors.textSecondary, fontWeight: isActive ? '700' : '400' }}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs + 2,
    borderRadius:      Radii.full,
    borderWidth:       1,
  },
});

// ─── Screen ──────────────────────────────────────────────────────────────────

export const SearchScreen: React.FC = () => {
  const navigation       = useNavigation();
  const { colors }       = useTheme();
  const { user }         = useAuthStore();
  const { transactions, categories: userCategories } = useFinanceStore();

  // Search state
  const [query,        setQuery]        = useState('');
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>('all');
  const [catFilter,    setCatFilter]    = useState<string | undefined>(undefined);
  const [dateKey,      setDateKey]      = useState<DateRangeKey>('all');
  const [customFrom,   setCustomFrom]   = useState<Date | undefined>(undefined);
  const [customTo,     setCustomTo]     = useState<Date | undefined>(undefined);
  const [showFromPick, setShowFromPick] = useState(false);
  const [showToPick,   setShowToPick]   = useState(false);
  const [results,      setResults]      = useState<ExpenseRecord[]>([]);
  const [searching,    setSearching]    = useState(false);

  const inputRef = useRef<TextInput>(null);

  // All unique categories across ALL transactions for the filter row
  const allCategories = React.useMemo(() => {
    const fromDefaults = [...getDefaultCategories('expense'), ...getDefaultCategories('income')];
    const fromCustom   = userCategories.map(c => c.name);
    return Array.from(new Set([...fromDefaults, ...fromCustom]));
  }, [userCategories]);

  // Auto-focus on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Run search whenever any filter changes
  useEffect(() => {
    if (!user) return;
    runSearch();
  }, [query, typeFilter, catFilter, dateKey, customFrom, customTo]);

  const runSearch = useCallback(async () => {
    if (!user) return;
    setSearching(true);

    try {
      const range  = dateKey === 'custom'
        ? { from: customFrom?.getTime(), to: customTo?.getTime() }
        : getDateRange(dateKey);

      const res = await TransactionRepository.searchTransactions(
        user.id,
        query || undefined,
        typeFilter !== 'all' ? typeFilter : undefined,
        catFilter,
        range.from,
        range.to,
        300
      );
      setResults(res);
    } catch (e) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [user, query, typeFilter, catFilter, dateKey, customFrom, customTo]);

  // ── Computed values ────────────────────────────────────────────────────────

  const isFiltered = query.length > 0 || typeFilter !== 'all' || catFilter !== undefined || dateKey !== 'all';
  const displayList = isFiltered ? results : transactions.slice(0, 20);

  const incomeTotal  = results.filter(r => r.trend === 'increment').reduce((s, r) => s + r.amount, 0);
  const expenseTotal = results.filter(r => r.trend === 'decrement').reduce((s, r) => s + r.amount, 0);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: ExpenseRecord }) => (
    <ExpenseListItem
      title={item.category}
      subtitle={item.description || undefined}
      amount={(item.trend === 'decrement' ? '-' : '+') + '$' + item.amount.toLocaleString()}
      trend={item.trend}
      timestamp={item.timestamp}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={48} color={colors.border} />
      <Typography variant="body" style={{ color: colors.textSecondary, marginTop: Spacing.lg, textAlign: 'center' }}>
        {isFiltered ? 'No transactions match your filters.' : 'No transactions yet.'}
      </Typography>
    </View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.flex} edges={['top']}>

        {/* ── Search bar ── */}
        <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, category, note..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}

          {searching && <ActivityIndicator size="small" color={colors.textTertiary} style={{ marginLeft: Spacing.xs }} />}
        </View>

        {/* ── Filter row: Type ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={[styles.filterRow, { borderBottomColor: colors.border }]}
        >
          {(['all', 'income', 'expense'] as TypeFilter[]).map(t => (
            <FilterChip
              key={t}
              label={t.charAt(0).toUpperCase() + t.slice(1)}
              isActive={typeFilter === t}
              color={t === 'income' ? '#10b981' : t === 'expense' ? '#ef4444' : colors.text}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTypeFilter(t);
              }}
            />
          ))}

          <View style={[styles.filterDivider, { backgroundColor: colors.border }]} />

          {/* Date range quick filters */}
          {(['today', 'week', 'month'] as DateRangeKey[]).map(key => (
            <FilterChip
              key={key}
              label={key === 'today' ? 'Today' : key === 'week' ? 'This Week' : 'This Month'}
              isActive={dateKey === key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDateKey(dateKey === key ? 'all' : key);
              }}
            />
          ))}

          {/* Custom date range */}
          <FilterChip
            label={dateKey === 'custom' ? 'Custom ✓' : 'Custom Range'}
            isActive={dateKey === 'custom'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDateKey('custom');
              setShowFromPick(true);
            }}
          />
        </ScrollView>

        {/* Custom date pickers */}
        {showFromPick && (
          <DateTimePicker
            value={customFrom ?? new Date()}
            mode="date"
            display="default"
            maximumDate={customTo ?? new Date()}
            onChange={(_, d) => {
              setShowFromPick(false);
              if (d) { setCustomFrom(d); setShowToPick(true); }
            }}
          />
        )}
        {showToPick && (
          <DateTimePicker
            value={customTo ?? new Date()}
            mode="date"
            display="default"
            minimumDate={customFrom}
            maximumDate={new Date()}
            onChange={(_, d) => {
              setShowToPick(false);
              if (d) setCustomTo(d);
            }}
          />
        )}

        {/* ── Category filter row ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={[styles.catRow, { borderBottomColor: colors.border }]}
        >
          <FilterChip
            label="All Categories"
            isActive={catFilter === undefined}
            onPress={() => setCatFilter(undefined)}
          />
          {allCategories.map(cat => {
            const config = getCategoryConfig(cat);
            return (
              <FilterChip
                key={cat}
                label={cat}
                isActive={catFilter === cat}
                color={config.color}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCatFilter(catFilter === cat ? undefined : cat);
                }}
              />
            );
          })}
        </ScrollView>

        {/* ── Results summary bar ── */}
        {isFiltered && !searching && (
          <View style={[styles.summaryBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
            <Typography variant="caption" style={{ color: colors.textTertiary }}>
              {results.length} result{results.length !== 1 ? 's' : ''}
            </Typography>
            <View style={styles.summaryTotals}>
              {incomeTotal > 0 && (
                <Typography variant="caption" style={{ color: '#10b981', fontWeight: '700' }}>
                  +${incomeTotal.toLocaleString()}
                </Typography>
              )}
              {expenseTotal > 0 && (
                <Typography variant="caption" style={{ color: '#ef4444', fontWeight: '700' }}>
                  -${expenseTotal.toLocaleString()}
                </Typography>
              )}
            </View>
          </View>
        )}

        {/* ── Section label ── */}
        <View style={styles.sectionLabel}>
          <Typography variant="label" style={{ color: colors.textTertiary, letterSpacing: 1, fontSize: 10 }}>
            {isFiltered ? 'RESULTS' : 'RECENT TRANSACTIONS'}
          </Typography>
        </View>

        {/* ── Results list ── */}
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
    </KeyboardAvoidingView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:       { flex: 1 },
  flex:         { flex: 1 },
  searchBar: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md,
    gap:            Spacing.md,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex:     1,
    fontSize: 17,
    padding:  0,
  },
  filterRow: {
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    gap:               Spacing.sm,
    flexDirection:     'row',
    alignItems:        'center',
  },
  filterDivider: {
    width:        1,
    height:       18,
    marginHorizontal: Spacing.xs,
  },
  catRow: {
    borderBottomWidth: 1,
  },
  summaryBar: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    borderBottomWidth: 1,
  },
  summaryTotals: {
    flexDirection: 'row',
    gap:           Spacing.md,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.lg,
    paddingBottom:     Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom:     40,
  },
  emptyState: {
    alignItems:    'center',
    paddingTop:    60,
    paddingHorizontal: 40,
  },
});
