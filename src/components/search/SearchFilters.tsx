import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useFinanceStore } from '../../store/financeStore';
import { getCategoryConfig, getDefaultCategories } from '../../utils/categoryConfig';
import { FilterChip } from './FilterChip';
import { DateRangeKey, TypeFilter } from '../../hooks/useTransactionSearch';

interface SearchFiltersProps {
  typeFilter: TypeFilter;
  setTypeFilter: (t: TypeFilter) => void;
  dateKey: DateRangeKey;
  setDateKey: (k: DateRangeKey) => void;
  catFilter?: string;
  setCatFilter: (c?: string) => void;
  customLabel: string;
  onOpenCustomRange: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  typeFilter,
  setTypeFilter,
  dateKey,
  setDateKey,
  catFilter,
  setCatFilter,
  customLabel,
  onOpenCustomRange,
}) => {
  const { colors } = useTheme();
  const { categories: userCategories } = useFinanceStore();

  const allCategories = useMemo(() => {
    const fromDefaults = [...getDefaultCategories('expense'), ...getDefaultCategories('income')];
    const fromCustom   = userCategories.map(c => c.name);
    return Array.from(new Set([...fromDefaults, ...fromCustom]));
  }, [userCategories]);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
        style={[styles.filterRow, { borderBottomColor: colors.border }]}
      >
        {(['all', 'income', 'expense'] as TypeFilter[]).map(t => (
          <FilterChip
            key={t}
            label={t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            isActive={typeFilter === t}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTypeFilter(t); }}
          />
        ))}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {(['today', 'week', 'month'] as DateRangeKey[]).map(k => (
          <FilterChip
            key={k}
            label={k === 'today' ? 'Today' : k === 'week' ? 'This Week' : 'This Month'}
            isActive={dateKey === k}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDateKey(dateKey === k ? 'all' : k); }}
          />
        ))}

        <FilterChip
          label={customLabel}
          isActive={dateKey === 'custom'}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenCustomRange();
          }}
        />
      </ScrollView>

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
          const cfg = getCategoryConfig(cat);
          return (
            <FilterChip
              key={cat}
              label={cat}
              isActive={catFilter === cat}
              color={cfg.color}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setCatFilter(catFilter === cat ? undefined : cat); }}
            />
          );
        })}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  filterRow: { borderBottomWidth: 1, maxHeight: 50 },
  catRow:    { borderBottomWidth: 1, maxHeight: 50 },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    gap:               Spacing.sm,
    flexDirection:     'row',
    alignItems:        'center',
  },
  divider: { width: 1, height: 18, marginHorizontal: Spacing.xs },
});
