import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { LinearGradient } from 'expo-linear-gradient';
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

// ─── Types ────────────────────────────────────────────────────────────────────

type TypeFilter   = 'all' | 'income' | 'expense';
type DateRangeKey = 'all' | 'today' | 'week' | 'month' | 'custom';

interface CustomRange { from: Date; to: Date }

function getPresetRange(key: DateRangeKey): { from?: number; to?: number } {
  const now = Date.now();
  const sod = new Date(); sod.setHours(0, 0, 0, 0);
  switch (key) {
    case 'today': return { from: sod.getTime(), to: now };
    case 'week': {
      const d = new Date(); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0);
      return { from: d.getTime(), to: now };
    }
    case 'month': {
      const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0);
      return { from: d.getTime(), to: now };
    }
    default: return {};
  }
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── DateRangeModal ───────────────────────────────────────────────────────────
// A full-screen bottom-sheet-style modal for selecting start → end date.
// Validation: end date cannot be before start date.

interface DateRangeModalProps {
  visible:   boolean;
  initial:   CustomRange;
  onApply:   (range: CustomRange) => void;
  onCancel:  () => void;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible, initial, onApply, onCancel,
}) => {
  const { colors } = useTheme();

  const [from,         setFrom]         = useState<Date>(initial.from);
  const [to,           setTo]           = useState<Date>(initial.to);
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (visible) { setFrom(initial.from); setTo(initial.to); setActivePicker(null); }
  }, [visible]);

  const handleFromChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setActivePicker(null);
    if (!date) return;
    setFrom(date);
    // If from > to, push to forward
    if (date > to) setTo(date);
  };

  const handleToChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setActivePicker(null);
    if (!date) return;
    // to cannot be before from
    setTo(date < from ? from : date);
  };

  const canApply = from <= to;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      {/* Backdrop */}
      <Pressable style={modalStyles.backdrop} onPress={onCancel}>
        <View /> {/* absorb tap */}
      </Pressable>

      {/* Sheet */}
      <View style={[modalStyles.sheet, { backgroundColor: colors.backgroundSecondary }]}>
        {/* ── Handle ── */}
        <View style={[modalStyles.handle, { backgroundColor: colors.border }]} />

        {/* ── Header ── */}
        <View style={modalStyles.header}>
          <Typography variant="heading3">Custom Date Range</Typography>
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Typography variant="caption" style={{ color: colors.textTertiary, paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl }}>
          Select a start and end date to filter your transactions.
        </Typography>

        {/* ── Date rows ── */}
        {/* From */}
        <TouchableOpacity
          style={[modalStyles.dateRow, { backgroundColor: colors.backgroundTertiary, borderColor: activePicker === 'from' ? colors.text : colors.border }]}
          onPress={() => setActivePicker(activePicker === 'from' ? null : 'from')}
          activeOpacity={0.8}
        >
          <View style={[modalStyles.dateDot, { backgroundColor: '#10b981' }]} />
          <View style={modalStyles.dateLabelBlock}>
            <Typography variant="caption" style={{ color: colors.textTertiary, letterSpacing: 0.5 }}>
              START DATE
            </Typography>
            <Typography variant="bodySemiBold">{fmtDate(from)}</Typography>
          </View>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Connector */}
        <View style={modalStyles.connector}>
          <View style={[modalStyles.connectorLine, { backgroundColor: colors.border }]} />
          <View style={[modalStyles.connectorDot, { backgroundColor: colors.border }]}>
            <Ionicons name="arrow-down" size={12} color={colors.textTertiary} />
          </View>
          <View style={[modalStyles.connectorLine, { backgroundColor: colors.border }]} />
        </View>

        {/* To */}
        <TouchableOpacity
          style={[modalStyles.dateRow, { backgroundColor: colors.backgroundTertiary, borderColor: activePicker === 'to' ? colors.text : colors.border }]}
          onPress={() => setActivePicker(activePicker === 'to' ? null : 'to')}
          activeOpacity={0.8}
        >
          <View style={[modalStyles.dateDot, { backgroundColor: '#ef4444' }]} />
          <View style={modalStyles.dateLabelBlock}>
            <Typography variant="caption" style={{ color: colors.textTertiary, letterSpacing: 0.5 }}>
              END DATE
            </Typography>
            <Typography variant="bodySemiBold">{fmtDate(to)}</Typography>
          </View>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Range pill summary */}
        {canApply && (
          <View style={[modalStyles.rangePill, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <Typography variant="caption" style={{ color: colors.textTertiary, marginLeft: 6 }}>
              {from.toDateString() === to.toDateString()
                ? fmtDate(from)
                : `${fmtDate(from)}  →  ${fmtDate(to)}`}
            </Typography>
          </View>
        )}

        {/* Native picker — appears inline when a row is tapped */}
        {activePicker === 'from' && (
          <DateTimePicker
            value={from}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleFromChange}
            style={modalStyles.picker}
          />
        )}
        {activePicker === 'to' && (
          <DateTimePicker
            value={to}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={from}
            maximumDate={new Date()}
            onChange={handleToChange}
            style={modalStyles.picker}
          />
        )}

        {/* ── Actions ── */}
        <View style={modalStyles.actions}>
          <TouchableOpacity
            style={[modalStyles.cancelBtn, { borderColor: colors.border }]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Typography variant="bodySemiBold" style={{ color: colors.textSecondary }}>Cancel</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[modalStyles.applyBtn, !canApply && { opacity: 0.4 }]}
            onPress={() => { if (canApply) onApply({ from, to }); }}
            activeOpacity={0.8}
            disabled={!canApply}
          >
            <LinearGradient
              colors={['#3BB9A1', '#2a8a77']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={modalStyles.applyGrad}
            >
              <Typography variant="bodySemiBold" style={{ color: '#fff' }}>Apply Filter</Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    borderTopLeftRadius:  Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    paddingBottom: 40,
  },
  handle: {
    width:        40,
    height:       4,
    borderRadius: 2,
    alignSelf:    'center',
    marginTop:    12,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: Spacing.xl,
    marginBottom:   Spacing.sm,
  },
  dateRow: {
    flexDirection:  'row',
    alignItems:     'center',
    marginHorizontal: Spacing.xl,
    borderRadius:   Radii.xl,
    borderWidth:    1.5,
    padding:        Spacing.lg,
    gap:            Spacing.md,
  },
  dateDot: {
    width:        10,
    height:       10,
    borderRadius: 5,
  },
  dateLabelBlock: {
    flex: 1,
    gap:  2,
  },
  connector: {
    flexDirection:  'row',
    alignItems:     'center',
    marginHorizontal: Spacing.xl + 22,
    marginVertical:   Spacing.xs,
  },
  connectorLine: {
    flex:   1,
    height: 1,
  },
  connectorDot: {
    width:          22,
    height:         22,
    borderRadius:   11,
    justifyContent: 'center',
    alignItems:     'center',
  },
  rangePill: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'center',
    marginTop:         Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.xs + 2,
    borderRadius:      Radii.full,
    borderWidth:       1,
  },
  picker: {
    marginHorizontal: Spacing.xl,
    marginTop:        Spacing.md,
  },
  actions: {
    flexDirection:  'row',
    gap:            Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop:      Spacing.xl,
  },
  cancelBtn: {
    flex:            1,
    height:          52,
    borderRadius:    Radii.xl,
    borderWidth:     1,
    justifyContent:  'center',
    alignItems:      'center',
  },
  applyBtn: {
    flex:         2,
    borderRadius: Radii.xl,
    overflow:     'hidden',
  },
  applyGrad: {
    height:         52,
    justifyContent: 'center',
    alignItems:     'center',
  },
});

// ─── Filter chip ─────────────────────────────────────────────────────────────

const FilterChip: React.FC<{
  label: string; isActive: boolean; color?: string; onPress: () => void;
}> = ({ label, isActive, color, onPress }) => {
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
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { user }   = useAuthStore();
  const { transactions, categories: userCategories } = useFinanceStore();

  // Search state
  const [query,       setQuery]       = useState('');
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('all');
  const [catFilter,   setCatFilter]   = useState<string | undefined>(undefined);
  const [dateKey,     setDateKey]     = useState<DateRangeKey>('all');
  const [customRange, setCustomRange] = useState<CustomRange>({
    from: (() => { const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d; })(),
    to:   new Date(),
  });
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [results,        setResults]        = useState<ExpenseRecord[]>([]);
  const [searching,      setSearching]      = useState(false);

  const inputRef = useRef<TextInput>(null);

  // All unique categories
  const allCategories = useMemo(() => {
    const fromDefaults = [...getDefaultCategories('expense'), ...getDefaultCategories('income')];
    const fromCustom   = userCategories.map(c => c.name);
    return Array.from(new Set([...fromDefaults, ...fromCustom]));
  }, [userCategories]);

  // Auto-focus
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 150); }, []);

  // Re-run search when any filter changes
  useEffect(() => { if (user) runSearch(); }, [query, typeFilter, catFilter, dateKey, customRange]);

  const runSearch = useCallback(async () => {
    if (!user) return;
    setSearching(true);
    try {
      const range =
        dateKey === 'custom'
          ? { from: customRange.from.getTime(), to: customRange.to.getTime() }
          : getPresetRange(dateKey);

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
    } catch { setResults([]); }
    finally   { setSearching(false); }
  }, [user, query, typeFilter, catFilter, dateKey, customRange]);

  const isFiltered = query.length > 0 || typeFilter !== 'all' || catFilter !== undefined || dateKey !== 'all';
  const displayList = isFiltered ? results : transactions.slice(0, 20);

  const incomeTotal  = results.filter(r => r.trend === 'increment').reduce((s, r) => s + r.amount, 0);
  const expenseTotal = results.filter(r => r.trend === 'decrement').reduce((s, r) => s + r.amount, 0);

  // Label for the custom chip
  const customLabel = dateKey === 'custom'
    ? (customRange.from.toDateString() === customRange.to.toDateString()
        ? fmtDate(customRange.from)
        : `${customRange.from.toLocaleDateString('default', { day: 'numeric', month: 'short' })} – ${customRange.to.toLocaleDateString('default', { day: 'numeric', month: 'short' })}`)
    : 'Custom Range';

  const renderItem = ({ item }: { item: ExpenseRecord }) => (
    <ExpenseListItem
      title={item.category}
      subtitle={item.description || undefined}
      amount={(item.trend === 'decrement' ? '−' : '+') + '$' + item.amount.toLocaleString()}
      trend={item.trend}
      timestamp={item.timestamp}
    />
  );

  const renderEmpty = () => (
    <View style={emptyStyles.state}>
      <View style={[emptyStyles.iconBox, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
      </View>
      <Typography variant="bodySemiBold" style={{ marginTop: Spacing.lg }}>
        {isFiltered ? 'No results found' : 'No transactions yet'}
      </Typography>
      <Typography variant="caption" style={{ color: colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center' }}>
        {isFiltered
          ? 'Try changing your filters\nor search term'
          : 'Your transactions will appear here'}
      </Typography>
    </View>
  );

  const emptyStyles = StyleSheet.create({
    state: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    iconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.flex} edges={['top']}>

        {/* ── Search bar ── */}
        <View style={[styles.searchBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.inputWrapper, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.textTertiary} style={{ marginLeft: Spacing.md }} />
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
              <TouchableOpacity onPress={() => setQuery('')} style={{ paddingRight: Spacing.md }}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {searching && <ActivityIndicator size="small" color={colors.textTertiary} />}
        </View>

        {/* ── Type + Date filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          style={[styles.filterRow, { borderBottomColor: colors.border }]}
        >
          {/* Type */}
          {(['all', 'income', 'expense'] as TypeFilter[]).map(t => (
            <FilterChip
              key={t}
              label={t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              isActive={typeFilter === t}
              color={t === 'income' ? '#10b981' : t === 'expense' ? '#ef4444' : undefined}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTypeFilter(t); }}
            />
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Date presets */}
          {(['today', 'week', 'month'] as DateRangeKey[]).map(k => (
            <FilterChip
              key={k}
              label={k === 'today' ? 'Today' : k === 'week' ? 'This Week' : 'This Month'}
              isActive={dateKey === k}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDateKey(dateKey === k ? 'all' : k); }}
            />
          ))}

          {/* Custom range chip */}
          <FilterChip
            label={customLabel}
            isActive={dateKey === 'custom'}
            color="#3BB9A1"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowRangeModal(true);
            }}
          />
        </ScrollView>

        {/* ── Category chips ── */}
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
                  −${expenseTotal.toLocaleString()}
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

      {/* ── Date Range Modal ── */}
      <DateRangeModal
        visible={showRangeModal}
        initial={customRange}
        onApply={range => {
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
  inputWrapper: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   Radii.full,
    borderWidth:    1,
    height:         44,
    gap:            Spacing.sm,
    overflow:       'hidden',
  },
  searchInput: {
    flex:     1,
    fontSize: 16,
    padding:  0,
  },
  filterRow:  { borderBottomWidth: 1, maxHeight: 50 },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    gap:               Spacing.sm,
    flexDirection:     'row',
    alignItems:        'center',
  },
  divider:    { width: 1, height: 18, marginHorizontal: Spacing.xs },
  catRow:     { borderBottomWidth: 1, maxHeight: 50 },
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
});
