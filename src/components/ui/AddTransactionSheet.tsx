import React, { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, TextStyle } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { TabSwitch } from '../common/TabSwitch';
import { useFinanceStore } from '../../store/financeStore';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import * as Haptics from 'expo-haptics';

interface AddTransactionSheetProps {
  onSuccess?: () => void;
}

export const AddTransactionSheet = forwardRef<BottomSheet, AddTransactionSheetProps>(
  ({ onSuccess }, ref) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [note, setNote] = useState('');
    
    const { addTransaction, loading } = useFinanceStore();
    const { user } = useAuthStore();
    const triggerHaptic = useSettingsStore(state => state.triggerHaptic);

    const snapPoints = useMemo(() => ['75%'], []);

    const categories = type === 'expense' 
      ? ['Food', 'Transport', 'Rent', 'Shopping', 'General'] 
      : ['Salary', 'Freelance', 'Gift', 'Investment', 'General'];

    const handleAdd = async () => {
      const numAmount = parseFloat(amount);
      if (!user) return;
      if (isNaN(numAmount) || numAmount <= 0) {
        triggerHaptic(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid Amount', 'Please enter a valid number greater than 0.');
        return;
      }

      const success = await addTransaction(user.id, type, category, numAmount, note);
      
      if (success) {
        triggerHaptic(Haptics.NotificationFeedbackType.Success);
        setAmount('');
        setNote('');
        setType('expense');
        setCategory('General');
        onSuccess?.();
        // @ts-ignore
        ref.current?.close();
      } else {
        triggerHaptic(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to save transaction locally.');
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props: any) => (
          <BottomSheetBackdrop {...props} disappearsAt={-1} appearsAt={0} opacity={0.5} />
        )}
        backgroundStyle={{ backgroundColor: Colors.dark.backgroundSecondary }}
        handleIndicatorStyle={{ backgroundColor: Colors.dark.textTertiary }}
      >
        <BottomSheetView style={styles.content}>
          <Typography variant="heading3" style={styles.title}>
            Add New Transaction
          </Typography>

          <TabSwitch
            options={['Expense', 'Income']}
            activeIndex={type === 'expense' ? 0 : 1}
            onSelect={(idx) => setType(idx === 0 ? 'expense' : 'income')}
            style={styles.tabSwitch}
          />

          <View style={styles.inputGroup}>
            <Typography variant="label" color="textSecondary" style={styles.label}>
              Amount
            </Typography>
            <View style={styles.amountInputContainer}>
              <Typography variant="heading1" color="textTertiary">$</Typography>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.dark.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label" color="textSecondary" style={styles.label}>
              Category
            </Typography>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                    setCategory(cat);
                  }}
                  style={[
                    styles.categoryItem,
                    category === cat && styles.categoryItemActive,
                  ]}
                >
                  <Typography
                    variant="caption"
                    color={category === cat ? 'text' : 'textSecondary'}
                    style={{ fontWeight: '700' }}
                  >
                    {cat}
                  </Typography>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label" color="textSecondary" style={styles.label}>
              Note (Optional)
            </Typography>
            <TextInput
              style={styles.noteInput}
              placeholder="What was this for?"
              placeholderTextColor={Colors.dark.textTertiary}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>

          <Button
            label={type === 'expense' ? 'Add Expense' : 'Add Income'}
            variant="primary"
            onPress={handleAdd}
            loading={loading}
            style={styles.submitButton}
          />
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    padding: Spacing['2xl'],
    gap: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  tabSwitch: {
    marginBottom: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingBottom: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '700',
    color: Colors.dark.text,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: 'transparent',
  },
  categoryItemActive: {
    borderColor: Colors.dark.text,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  noteInput: {
    backgroundColor: Colors.dark.backgroundTertiary,
    borderRadius: Radii.md,
    padding: Spacing.md,
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: Spacing.xl,
  },
});
