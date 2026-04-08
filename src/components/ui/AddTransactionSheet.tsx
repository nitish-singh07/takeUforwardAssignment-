import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { TabSwitch } from '../common/TabSwitch';
import { CentralModal } from '../common/CentralModal';
import { useTheme } from '../../context/ThemeContext';
import { useFinanceStore } from '../../store/financeStore';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getCategoryConfig, getDefaultCategories } from '../../utils/categoryConfig';
import { TransactionSchema } from '../../utils/validation';
import { ExpenseRecord } from '../../types';
import * as Haptics from 'expo-haptics';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddTransactionSheetProps {
  onSuccess?: () => void;
  initialTransaction?: ExpenseRecord | null;
}

// ─── Category chip ────────────────────────────────────────────────────────────

interface CategoryChipProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({ name, isActive, onPress }) => {
  const { colors } = useTheme();
  const config = getCategoryConfig(name);

  return (
    <Pressable
      onPress={onPress}
      style={[
        chipStyles.chip,
        { borderColor: isActive ? config.color : colors.border },
        isActive && { backgroundColor: config.color + '20' },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={13}
        color={isActive ? config.color : colors.textSecondary}
      />
      <Typography
        variant="caption"
        style={{
          color: isActive ? config.color : colors.textSecondary,
          fontWeight: isActive ? '700' : '400',
          marginLeft: 4,
        }}
      >
        {name}
      </Typography>
    </Pressable>
  );
};

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
});

// ─── Date row ────────────────────────────────────────────────────────────────

interface DateRowProps {
  date: Date;
  onChange: (date: Date) => void;
}

const DateRow: React.FC<DateRowProps> = ({ date, onChange }) => {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const label = () => {
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (date.toDateString() === yest.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[dateStyles.row, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <Typography variant="body" style={{ color: colors.text, flex: 1, marginLeft: Spacing.sm }}>
          {label()}
        </Typography>
        <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) onChange(selected);
          }}
        />
      )}
    </>
  );
};

const dateStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

export const AddTransactionSheet = forwardRef<BottomSheet, AddTransactionSheetProps>(
  ({ onSuccess, initialTransaction }, ref) => {
    const isEdit = !!initialTransaction;
    const { colors } = useTheme();

    const [type, setType] = useState<'income' | 'expense'>(
      initialTransaction ? (initialTransaction.trend === 'increment' ? 'income' : 'expense') : 'expense'
    );
    const [amount, setAmount] = useState(initialTransaction?.amount.toString() ?? '');
    const [category, setCategory] = useState(initialTransaction?.category ?? 'General');
    const [note, setNote] = useState(initialTransaction?.description ?? '');
    const [date, setDate] = useState(
      initialTransaction ? new Date(initialTransaction.timestamp) : new Date()
    );

    // Add custom category state
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
      title: '', message: '', type: 'error' as any,
      onConfirm: undefined as (() => void) | undefined,
      confirmLabel: undefined as string | undefined,
    });

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
      setModalConfig({ title, message, type: 'warning', onConfirm, confirmLabel: 'Delete' });
      setModalVisible(true);
    };
    const showError = (title: string, message: string) => {
      setModalConfig({ title, message, type: 'error', onConfirm: undefined, confirmLabel: undefined });
      setModalVisible(true);
    };

    const {
      addTransaction, updateTransaction, deleteTransaction,
      addCategory, categories: userCategories, loading,
    } = useFinanceStore();

    const { user } = useAuthStore();
    const triggerHaptic = useSettingsStore(state => state.triggerHaptic);
    const snapPoints = useMemo(() => ['90%'], []);

    // All categories for current type
    const availableCategories = useMemo(() => {
      const defaults = getDefaultCategories(type);
      const custom = userCategories.filter(c => c.type === type).map(c => c.name);
      return Array.from(new Set([...defaults, ...custom]));
    }, [type, userCategories]);

    // Zod validation
    const isValid = useMemo(() => {
      return TransactionSchema.safeParse({ type, amount, category, note }).success;
    }, [type, amount, category, note]);

    // Reset form when initialTransaction changes
    useEffect(() => {
      if (initialTransaction) {
        setType(initialTransaction.trend === 'increment' ? 'income' : 'expense');
        setAmount(initialTransaction.amount.toString());
        setCategory(initialTransaction.category);
        setNote(initialTransaction.description);
        setDate(new Date(initialTransaction.timestamp));
      } else {
        setAmount(''); setNote(''); setType('expense');
        setCategory('General'); setDate(new Date());
      }
    }, [initialTransaction]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleSave = async () => {
      const numAmount = parseFloat(amount);
      if (!user) return;

      let success: boolean;
      if (isEdit && initialTransaction) {
        success = await updateTransaction(initialTransaction.id, user.id, type, category, numAmount, note);
      } else {
        success = await addTransaction(user.id, type, category, numAmount, note, date.getTime());
      }

      if (success) {
        triggerHaptic(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();
        (ref as any)?.current?.close();
      } else {
        showError(isEdit ? 'Update Failed' : 'Save Failed', 'Could not save the transaction.');
        triggerHaptic(Haptics.NotificationFeedbackType.Error);
      }
    };

    const handleDelete = async () => {
      if (!isEdit || !initialTransaction || !user) return;
      showConfirm(
        'Delete Transaction',
        'Permanently delete this record? This cannot be undone.',
        async () => {
          setModalVisible(false);
          const success = await deleteTransaction(initialTransaction.id, user.id);
          if (success) {
            triggerHaptic(Haptics.NotificationFeedbackType.Success);
            onSuccess?.();
            (ref as any)?.current?.close();
          }
        }
      );
    };

    const handleAddCategory = async () => {
      if (!user || !newCategoryName.trim()) return;
      const success = await addCategory(user.id, newCategoryName.trim(), type, 'apps-outline');
      if (success) {
        setCategory(newCategoryName.trim());
        setNewCategoryName('');
        setIsAddingCategory(false);
        triggerHaptic(Haptics.NotificationFeedbackType.Success);
      }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props: any) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        )}
        backgroundStyle={{ backgroundColor: colors.backgroundSecondary }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        {/* react-native-keyboard-controller's KAV — smooth keyboard avoidance */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <CentralModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title={modalConfig.title}
              message={modalConfig.message}
              type={modalConfig.type}
              onConfirm={modalConfig.onConfirm}
              confirmLabel={modalConfig.confirmLabel}
            />

            {/* Header */}
            <View style={styles.headerRow}>
              <Typography variant="heading3">
                {isEdit ? 'Edit Transaction' : 'Add Transaction'}
              </Typography>
              {isEdit && (
                <Pressable onPress={handleDelete}>
                  <Typography variant="bodySmall" style={{ color: colors.error, fontWeight: '700' }}>
                    DELETE
                  </Typography>
                </Pressable>
              )}
            </View>

            {/* Type switch */}
            <TabSwitch
              options={['Expense', 'Income']}
              activeIndex={type === 'expense' ? 0 : 1}
              onSelect={(idx) => {
                setType(idx === 0 ? 'expense' : 'income');
                setCategory(idx === 0 ? 'General' : 'Salary');
              }}
              style={styles.tabSwitch}
            />

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Typography variant="label" style={{ color: colors.textSecondary, ...styles.label }}>
                AMOUNT
              </Typography>
              <View style={[styles.amountRow, { borderBottomColor: colors.border }]}>
                <Typography variant="heading1" style={{ color: colors.textTertiary }}>₹</Typography>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Typography variant="label" style={{ color: colors.textSecondary, ...styles.label }}>
                DATE
              </Typography>
              <DateRow date={date} onChange={setDate} />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Typography variant="label" style={{ color: colors.textSecondary, ...styles.label }}>
                  CATEGORY
                </Typography>
                <Pressable onPress={() => setIsAddingCategory(!isAddingCategory)}>
                  <Typography variant="caption" style={{ color: colors.text, fontWeight: '600' }}>
                    {isAddingCategory ? 'Cancel' : '+ Custom'}
                  </Typography>
                </Pressable>
              </View>

              {isAddingCategory ? (
                <View style={styles.addCatRow}>
                  <TextInput
                    style={[styles.addCatInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
                    placeholder="Category name"
                    placeholderTextColor={colors.textTertiary}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoFocus
                  />
                  <Button
                    label="Add"
                    variant="primary"
                    onPress={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    style={styles.addCatBtn}
                  />
                </View>
              ) : (
                <View style={styles.chipGrid}>
                  {availableCategories.map(cat => (
                    <CategoryChip
                      key={cat}
                      name={cat}
                      isActive={category === cat}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setCategory(cat);
                      }}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Note */}
            <View style={styles.inputGroup}>
              <Typography variant="label" style={{ color: colors.textSecondary, ...styles.label }}>
                NOTE (OPTIONAL)
              </Typography>
              <TextInput
                style={[styles.noteInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
                placeholder="What was this for?"
                placeholderTextColor={colors.textTertiary}
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>

            <Button
              label={isEdit ? 'Update Transaction' : (type === 'expense' ? 'Add Expense' : 'Add Income')}
              variant="primary"
              onPress={handleSave}
              loading={loading}
              disabled={!isValid}
              style={styles.submit}
            />
          </BottomSheetScrollView>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
);

AddTransactionSheet.displayName = 'bAddTransactionSheet';

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing['2xl'], gap: Spacing.xl, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabSwitch: { marginBottom: Spacing.sm },
  inputGroup: { gap: Spacing.sm },
  label: { letterSpacing: 1, fontSize: 10, textTransform: 'uppercase' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderBottomWidth: 1, paddingBottom: Spacing.xs },
  amountInput: { flex: 1, fontSize: 40, fontWeight: '700', padding: 0 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  addCatRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  addCatInput: { flex: 1, borderRadius: Radii.md, padding: Spacing.md },
  addCatBtn: { height: 48, paddingHorizontal: Spacing.xl },
  noteInput: { borderRadius: Radii.md, padding: Spacing.md, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  submit: { marginTop: Spacing.md },
});
