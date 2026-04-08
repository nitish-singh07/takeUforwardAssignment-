/**
 * CategoryPickerSheet
 *
 * Fixes in this version:
 *  1. Shows ONLY income categories when transactionType='income',
 *     ONLY expense categories when transactionType='expense'.
 *     No mixed sections — single clean grid.
 *  2. New category text input: keyboard-aware inside BottomSheet.
 *  3. BottomSheetTextInput used so the sheet doesn't dismiss when keyboard opens.
 *  4. StyleSheet.flatten used for style arrays to avoid TextStyle type errors.
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import {
  getCategoryConfig,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from '../../utils/categoryConfig';
import { useFinanceStore } from '../../store/financeStore';
import { useAuthStore } from '../../store/authStore';
import * as Haptics from 'expo-haptics';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryPickerSheetProps {
  sheetRef:        React.RefObject<BottomSheet | null>;
  transactionType: 'income' | 'expense';
  selected:        string;
  onSelect:        (name: string) => void;
}

// ─── Category bubble ─────────────────────────────────────────────────────────

const CategoryBubble: React.FC<{
  name: string; isActive: boolean; onPress: () => void;
}> = ({ name, isActive, onPress }) => {
  const { colors } = useTheme();
  const config     = getCategoryConfig(name);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={bubbleStyles.wrapper}>
      <View
        style={[
          bubbleStyles.circle,
          {
            backgroundColor: isActive ? config.color + '22' : colors.backgroundTertiary,
            borderColor:      isActive ? config.color : colors.border,
            borderWidth:      isActive ? 2 : 1,
          },
        ]}
      >
        <Ionicons name={config.icon} size={26} color={config.color} />
        {isActive && (
          <View style={[bubbleStyles.activeDot, { backgroundColor: config.color }]} />
        )}
      </View>
      <Typography
        numberOfLines={1}
        style={StyleSheet.flatten([
          bubbleStyles.label,
          { color: isActive ? config.color : colors.textSecondary, fontWeight: isActive ? '700' : '400' },
        ]) as any}
      >
        {name}
      </Typography>
    </TouchableOpacity>
  );
};

const bubbleStyles = StyleSheet.create({
  wrapper: {
    width:       '33.33%',
    alignItems:  'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  circle: {
    width:          68,
    height:         68,
    borderRadius:   34,
    justifyContent: 'center',
    alignItems:     'center',
  },
  activeDot: {
    position:     'absolute',
    bottom:       4,
    width:        20,
    height:       3,
    borderRadius: 2,
  },
  label: {
    marginTop:  Spacing.xs + 2,
    fontSize:   11,
    textAlign:  'center',
    maxWidth:   72,
  },
});

// ─── Main sheet ───────────────────────────────────────────────────────────────

export const CategoryPickerSheet = React.forwardRef<BottomSheet, CategoryPickerSheetProps>(
  ({ sheetRef, transactionType, selected, onSelect }) => {
    const { colors }  = useTheme();
    const { user }    = useAuthStore();
    const { categories: userCategories, addCategory } = useFinanceStore();

    const [newCatName,   setNewCatName]   = useState('');
    const [newCatIncome, setNewCatIncome] = useState(transactionType === 'income');
    const [inputFocused, setInputFocused] = useState(false);

    const snapPoints = useMemo(() => ['80%'], []);

    // ── Category lists — filtered by transactionType ──────────────────────────

    const defaultNames = useMemo(
      () => Object.keys(transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES),
      [transactionType]
    );

    const customNames = useMemo(
      () => userCategories.filter(c => c.type === transactionType).map(c => c.name),
      [userCategories, transactionType]
    );

    const allNames = useMemo(
      () => Array.from(new Set([...defaultNames, ...customNames])),
      [defaultNames, customNames]
    );

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSelect = (name: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(name);
      (sheetRef as any)?.current?.close();
    };

    const handleAddCustom = async () => {
      if (!user || !newCatName.trim()) return;
      const type = newCatIncome ? 'income' : 'expense';
      await addCategory(user.id, newCatName.trim(), type, 'apps-outline');
      onSelect(newCatName.trim());
      setNewCatName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      (sheetRef as any)?.current?.close();
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const accentColor = transactionType === 'income' ? '#56b4d3' : '#6fcf97';

    return (
      <BottomSheet
        ref={sheetRef as any}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={(props: any) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.6}
          />
        )}
        backgroundStyle={{ backgroundColor: colors.backgroundSecondary }}
        handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={sheetStyles.header}>
            <TouchableOpacity
              onPress={() => (sheetRef as any)?.current?.close()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Typography variant="heading3">Categories</Typography>
            <View style={{ width: 24 }} />
          </View>

          {/* Section label */}
          <View style={sheetStyles.sectionRow}>
            <View style={[sheetStyles.sectionLine, { backgroundColor: colors.border }]} />
            <Typography
              variant="caption"
              style={{ color: colors.textTertiary, marginHorizontal: Spacing.md, fontSize: 10 }}
            >
              {transactionType === 'income' ? 'Select income category' : 'Select expense category'}
            </Typography>
            <View style={[sheetStyles.sectionLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Category grid */}
          <View style={sheetStyles.grid}>
            {allNames.map(name => (
              <CategoryBubble
                key={name}
                name={name}
                isActive={selected === name}
                onPress={() => handleSelect(name)}
              />
            ))}
          </View>

          {/* ── New category input ── */}
          <View style={[sheetStyles.newCatSection, { borderTopColor: colors.border }]}>
            <Typography variant="label" style={{ color: colors.textTertiary, letterSpacing: 0.5, marginBottom: Spacing.md }}>
              CREATE NEW
            </Typography>

            {/* Input card */}
            <View
              style={[
                sheetStyles.newCatCard,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderColor: inputFocused ? accentColor : colors.border,
                  borderWidth: inputFocused ? 2 : 1,
                },
              ]}
            >
              <View style={[sheetStyles.colorDot, { backgroundColor: newCatIncome ? '#56b4d3' : '#6fcf97' }]} />
              <BottomSheetTextInput
                style={[sheetStyles.catInput, { color: colors.text }]}
                placeholder="Category name..."
                placeholderTextColor={colors.textTertiary}
                value={newCatName}
                onChangeText={setNewCatName}
                returnKeyType="done"
                onSubmitEditing={handleAddCustom}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              {newCatName.trim().length > 0 && (
                <TouchableOpacity
                  onPress={handleAddCustom}
                  style={[sheetStyles.addBtn, { backgroundColor: accentColor }]}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            {/* Income toggle */}
            <View style={[sheetStyles.toggleRow, { borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Typography variant="bodySemiBold">Mark as income</Typography>
                <Typography
                  variant="caption"
                  style={{ color: colors.textTertiary, marginTop: 2 }}
                >
                  Transactions in this category count as income
                </Typography>
              </View>
              <Switch
                value={newCatIncome}
                onValueChange={setNewCatIncome}
                trackColor={{ false: colors.border, true: '#56b4d3' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={{ height: 60 }} />
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

CategoryPickerSheet.displayName = 'CategoryPickerSheet';

// ─── Styles ──────────────────────────────────────────────────────────────────

const sheetStyles = StyleSheet.create({
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical:   Spacing.lg,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical:   2,
    borderRadius:      Radii.full,
    borderWidth:       1,
  },
  sectionRow: {
    flexDirection:     'row',
    alignItems:        'center',
    marginHorizontal:  Spacing.xl,
    marginBottom:      Spacing.xl,
  },
  sectionLine: { flex: 1, height: 1 },
  grid: {
    flexDirection:     'row',
    flexWrap:          'wrap',
    paddingHorizontal: Spacing.lg,
  },
  newCatSection: {
    borderTopWidth:    1,
    marginTop:         Spacing.sm,
    paddingTop:        Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  newCatCard: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      Radii.xl,
    borderWidth:       1,
    paddingHorizontal: Spacing.lg,
    height:            54,
    gap:               Spacing.md,
  },
  colorDot: {
    width:        14,
    height:       14,
    borderRadius: 7,
  },
  catInput: {
    flex:     1,
    fontSize: 16,
    padding:  0,
  },
  addBtn: {
    width:          34,
    height:         34,
    borderRadius:   17,
    justifyContent: 'center',
    alignItems:     'center',
  },
  toggleRow: {
    flexDirection:   'row',
    alignItems:      'center',
    borderTopWidth:  1,
    marginTop:       Spacing.lg,
    paddingTop:      Spacing.lg,
    gap:             Spacing.lg,
  },
});
