import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

interface TransactionFormProps {
  isSpend: boolean;
  amount: string;
  setAmount: (v: string) => void;
  amountErr: string;
  setAmountErr: (v: string) => void;
  date: Date;
  setDate: (d: Date) => void;
  showPicker: boolean;
  setShowPicker: (v: boolean) => void;
  openDatePicker: () => void;
  merchant: string;
  setMerchant: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
}

const formatDate = (d: Date) => {
  const now = new Date();
  const yest = new Date(); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isSpend, amount, setAmount, amountErr, setAmountErr,
  date, setDate, showPicker, setShowPicker, openDatePicker,
  merchant, setMerchant, note, setNote,
}) => {
  const { colors } = useTheme();

  const onDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  };

  return (
    <View style={styles.container}>
      {/* ── Amount card ── */}
      <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Typography variant="caption" style={[styles.cardLabel, { color: colors.textTertiary }]}>
          {isSpend ? 'Amount spent' : 'Amount received'}
        </Typography>

        <View style={[styles.amountRow, { borderBottomColor: amountErr ? '#ef4444' : colors.border }]}>
          <Typography style={{ fontSize: 28, fontWeight: '300', color: colors.textTertiary }}>₹</Typography>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={v => { setAmount(v); if (amountErr) setAmountErr(''); }}
            autoFocus
            returnKeyType="next"
          />
          <Ionicons name="arrow-up-circle-outline" size={22} color={colors.textTertiary} />
        </View>

        {!!amountErr && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
            <Typography variant="caption" style={{ color: '#ef4444', marginLeft: 4 }}>{amountErr}</Typography>
          </View>
        )}

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        {/* Date & time */}
        <TouchableOpacity style={styles.infoRow} onPress={openDatePicker} activeOpacity={0.7}>
          <Typography variant="body" style={{ color: colors.textSecondary, flex: 1 }}>Date & time</Typography>
          <Typography variant="body" style={{ color: colors.text }}>{formatDate(date)}</Typography>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        {/* Paid to / Source */}
        <View style={styles.infoRow}>
          <Typography variant="body" style={{ color: colors.textSecondary, flex: 1 }}>
            {isSpend ? 'Paid to' : 'Source'}
          </Typography>
          <TextInput
            style={[styles.inlineInput, { color: colors.text }]}
            placeholder={isSpend ? 'Enter name or place' : 'Enter source'}
            placeholderTextColor={colors.textTertiary}
            value={merchant}
            onChangeText={setMerchant}
            returnKeyType="next"
          />
        </View>

        <View style={[styles.sep, { backgroundColor: colors.border }]} />

        {/* Notes */}
        <View style={styles.notesRow}>
          <Ionicons name="create-outline" size={18} color={colors.textTertiary} style={{ marginTop: 2 }} />
          <TextInput
            style={[styles.notesInput, { color: colors.text }]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
            returnKeyType="done"
            multiline
            blurOnSubmit
          />
        </View>
      </View>

      {/* Android date picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* iOS date picker */}
      {showPicker && Platform.OS === 'ios' && (
        <View style={[styles.iosPickerCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <View style={styles.iosPickerHeader}>
            <Typography variant="caption" style={{ color: colors.textTertiary }}>Select date</Typography>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Typography variant="bodySemiBold" style={{ color: '#3BB9A1' }}>Done</Typography>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={date}
            mode="datetime"
            display="spinner"
            maximumDate={new Date()}
            onChange={onDateChange}
            style={{ height: 180 }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  card: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardLabel: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    gap: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    padding: 0,
    letterSpacing: -0.5,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xs + 2,
    paddingBottom: Spacing.xs,
  },
  sep: { height: 1, marginHorizontal: Spacing.xl },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  inlineInput: {
    flex: 1,
    fontSize: 15,
    textAlign: 'right',
    padding: 0,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  notesInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    maxHeight: 80,
  },
  iosPickerCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
});
