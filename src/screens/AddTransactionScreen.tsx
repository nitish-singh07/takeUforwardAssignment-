/**
 * AddTransactionScreen — Full-screen slide-up form.
 *
 * Fixes applied:
 *  1. DateTimePicker crash on Android — use standard RN KeyboardAvoidingView,
 *     dismiss keyboard before opening picker on Android.
 *  2. Notes input added below "Paid to".
 *  3. Income/Expense toggle drives CategoryPickerSheet filter.
 *  4. Toggle design: Spend = green pill, Income = blue pill (both coloured when active).
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet from '@gorhom/bottom-sheet';
import { Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { CategoryPickerSheet } from '../components/ui/CategoryPickerSheet';
import { CentralModal } from '../components/common/CentralModal';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { getCategoryConfig } from '../utils/categoryConfig';
import { RootStackParamList } from '../types';
import * as Haptics from 'expo-haptics';

type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: 'cash-outline' as const },
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline' as const },
  { key: 'card', label: 'Card', icon: 'card-outline' as const },
  { key: 'bank', label: 'Bank', icon: 'business-outline' as const },
];

// ─── Type toggle ──────────────────────────────────────────────────────────────

interface TypeToggleProps {
  isSpend: boolean;
  onChange: (v: boolean) => void;
}

const TypeToggle: React.FC<TypeToggleProps> = ({ isSpend, onChange }) => {
  const { colors } = useTheme();

  const Pill = ({
    active, label, activeColor, activeText,
  }: { active: boolean; label: string; activeColor: string; activeText: string }) => (
    <TouchableOpacity
      onPress={() => { onChange(label === 'Spend'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      activeOpacity={0.8}
      style={[
        pillStyles.pill,
        active
          ? { backgroundColor: activeColor, borderColor: activeColor }
          : { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
      ]}
    >
      {active && (
        <Ionicons name="checkmark" size={15} color={activeText} style={{ marginRight: 5 }} />
      )}
      <Typography
        variant="bodySemiBold"
        style={{ color: active ? activeText : colors.textTertiary, fontSize: 15 }}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <View style={pillStyles.row}>
      <Pill active={isSpend} label="Spend" activeColor="#1e4d30" activeText="#6fcf97" />
      <Pill active={!isSpend} label="Income" activeColor="#1a3a5c" activeText="#56b4d3" />
    </View>
  );
};

const pillStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  sep: { width: 1, marginVertical: Spacing.xs, marginHorizontal: Spacing.sm },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddTransactionRouteProp>();
  const editRecord = route.params?.transaction;
  
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { addTransaction, updateTransaction, loading } = useFinanceStore();
  const triggerHaptic = useSettingsStore(s => s.triggerHaptic);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Form state - initialized with editRecord if present
  const [isSpend, setIsSpend] = useState(editRecord ? editRecord.trend === 'decrement' : true);
  const [amount, setAmount] = useState(editRecord ? String(editRecord.amount) : '');
  const [merchant, setMerchant] = useState(editRecord ? editRecord.merchant || '' : '');
  const [note, setNote] = useState(editRecord ? editRecord.description || '' : '');
  const [category, setCategory] = useState(editRecord ? editRecord.category : 'Food');
  const [paymentMethod, setPaymentMethod] = useState(editRecord ? editRecord.payment_method || 'cash' : 'cash');
  const [date, setDate] = useState(editRecord ? new Date(editRecord.timestamp) : new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showPayMenu, setShowPayMenu] = useState(false);
  const [amountErr, setAmountErr] = useState('');

  const [modalCfg, setModalCfg] = useState({
    visible: false, title: '', message: '', type: 'error' as any,
  });

  const catSheetRef = useRef<BottomSheet | null>(null);
  const catConfig = getCategoryConfig(category);
  const payMethod = PAYMENT_METHODS.find(p => p.key === paymentMethod) ?? PAYMENT_METHODS[0];

  // When switching type also reset category to first of that type
  const handleTypeChange = (spend: boolean) => {
    setIsSpend(spend);
    setCategory(spend ? 'Food' : 'Salary');
  };

  // ── Date picker ────────────────────────────────────────────────────────────

  const openDatePicker = () => {
    // Dismiss keyboard FIRST to avoid the `dismiss of undefined` crash on Android
    Keyboard.dismiss();
    setTimeout(() => setShowPicker(true), Platform.OS === 'android' ? 100 : 0);
  };

  const onDateChange = (_: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  };

  const formatDate = (d: Date) => {
    const now = new Date();
    const yest = new Date(); yest.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString())
      return 'Today';
    if (d.toDateString() === yest.toDateString())
      return 'Yesterday';
    return d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
  };

  // ── Validation & save ──────────────────────────────────────────────────────

  const validate = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setAmountErr("Amount can't be empty");
      return false;
    }
    setAmountErr('');
    return true;
  };

  const handleSave = async (addAnother = false) => {
    if (!validate() || !user) return;
    triggerHaptic('selection');

    let success = false;
    if (editRecord) {
      // Logic for editing
      success = await updateTransaction(
        editRecord.id,
        user.id,
        isSpend ? 'expense' : 'income',
        category,
        parseFloat(amount),
        note || undefined,
        merchant || undefined,
        paymentMethod,
        date.getTime()
      );
    } else {
      // Logic for adding new
      success = await addTransaction(
        user.id,
        isSpend ? 'expense' : 'income',
        category,
        parseFloat(amount),
        note || undefined,
        date.getTime(),
        merchant || undefined,
        paymentMethod,
      );
    }

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (addAnother && !editRecord) {
        setAmount(''); setMerchant(''); setNote(''); setAmountErr('');
      } else {
        // If we were editing, we should probably go back to the details screen
        // which will refresh its data or we just go back to the list.
        navigation.goBack();
      }
    } else {
      setModalCfg({ visible: true, title: 'Error', message: 'Failed to save.', type: 'error' });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.flex}>
        {/* Header */}
        <View style={[styles.header, { 
          borderBottomColor: colors.border,
          paddingTop: insets.top + 10,
          height: 65 + insets.top,
        }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerIconBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <Typography variant="body" style={{ color: colors.textSecondary, fontWeight: '600' }}>
            {editRecord ? 'Edit Transaction' : 'New Transaction'}
          </Typography>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.headerIconBtn}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Spend / Income toggle */}
        <TypeToggle isSpend={isSpend} onChange={handleTypeChange} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Amount card ── */}
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>

            <Typography
              variant="caption"
              style={StyleSheet.flatten([styles.cardLabel, { color: colors.textTertiary }])}
            >
              {isSpend ? 'Amount spent' : 'Amount received'}
            </Typography>

            {/* Amount row */}
            <View style={[styles.amountRow, { borderBottomColor: amountErr ? '#ef4444' : colors.border }]}>
              <Typography style={{ fontSize: 28, fontWeight: '300', color: colors.textTertiary }}>
                ₹
              </Typography>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="Enter amount"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={v => { setAmount(v); if (amountErr) setAmountErr(''); }}
                autoFocus
                returnKeyType="next"
              />
              <Ionicons name="arrow-up-circle-outline" size={22} color={colors.textTertiary} />
            </View>

            {/* Inline error */}
            {!!amountErr && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
                <Typography variant="caption" style={{ color: '#ef4444', marginLeft: 4 }}>
                  {amountErr}
                </Typography>
              </View>
            )}

            <View style={[styles.sep, { backgroundColor: colors.border }]} />

            {/* Date & time */}
            <TouchableOpacity style={styles.infoRow} onPress={openDatePicker} activeOpacity={0.7}>
              <Typography variant="body" style={{ color: colors.textSecondary, flex: 1 }}>
                Date & time
              </Typography>
              <Typography variant="body" style={{ color: colors.text }}>
                {formatDate(date)}
              </Typography>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <View style={[styles.sep, { backgroundColor: colors.border }]} />

            {/* Paid to */}
            <View style={styles.infoRow}>
              <Typography variant="body" style={{ color: colors.textSecondary, flex: 1 }}>
                Paid to
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
            <View style={[styles.notesRow]}>
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

          {/* Android date picker — shown inline */}
          {showPicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          {/* iOS date picker — inline spinner */}
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

          {/* ── Payment method card ── */}
          <View style={[styles.payCard, { backgroundColor: isSpend ? '#1a2d20' : '#1a2441', borderColor: isSpend ? '#2d5a3d' : '#2a4a7a' }]}>
            <View style={styles.payRow}>
              <View style={[styles.payIconBox, { backgroundColor: isSpend ? '#2d5a3d' : '#2a4a7a' }]}>
                <Ionicons name={payMethod.icon} size={20} color={isSpend ? '#6fcf97' : '#56b4d3'} />
              </View>

              <TouchableOpacity
                style={styles.payMethodBtn}
                onPress={() => { Keyboard.dismiss(); setShowPayMenu(!showPayMenu); }}
                activeOpacity={0.8}
              >
                <Typography
                  variant="bodySemiBold"
                  style={{ color: isSpend ? '#6fcf97' : '#56b4d3', letterSpacing: 0.5 }}
                >
                  {payMethod.label.toUpperCase()}
                </Typography>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={isSpend ? '#6fcf97' : '#56b4d3'}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <Typography
                variant="caption"
                style={{ color: 'rgba(255,255,255,0.5)', marginRight: Spacing.sm }}
              >
                {isSpend ? 'Expense' : 'Income'}
              </Typography>
              <Switch
                value={isSpend}
                onValueChange={v => { handleTypeChange(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                trackColor={{ false: '#2a4a7a', true: '#2d5a3d' }}
                thumbColor="#fff"
              />
            </View>

            {showPayMenu && (
              <View style={[styles.payDropdown, { borderTopColor: isSpend ? '#2d5a3d' : '#2a4a7a', backgroundColor: '#0d1117' }]}>
                {PAYMENT_METHODS.map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.payOption,
                      paymentMethod === m.key && { backgroundColor: isSpend ? '#1e4d30' : '#1a3a5c' },
                    ]}
                    onPress={() => { setPaymentMethod(m.key); setShowPayMenu(false); }}
                  >
                    <Ionicons
                      name={m.icon}
                      size={18}
                      color={paymentMethod === m.key ? (isSpend ? '#6fcf97' : '#56b4d3') : '#666'}
                    />
                    <Typography
                      variant="body"
                      style={{
                        color: paymentMethod === m.key ? (isSpend ? '#6fcf97' : '#56b4d3') : '#888',
                        marginLeft: Spacing.md,
                        flex: 1,
                      }}
                    >
                      {m.label}
                    </Typography>
                    {paymentMethod === m.key && (
                      <Ionicons name="checkmark" size={16} color={isSpend ? '#6fcf97' : '#56b4d3'} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── Category card ── */}
          <TouchableOpacity
            style={[styles.catCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => catSheetRef.current?.expand(), 100);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.catIconBox, { backgroundColor: catConfig.color + '22' }]}>
              <Ionicons name={catConfig.icon} size={22} color={catConfig.color} />
            </View>
            <Typography variant="bodySemiBold" style={{ flex: 1, marginLeft: Spacing.md }}>
              {category}
            </Typography>
            <Typography variant="caption" style={{ color: colors.textTertiary, marginRight: Spacing.sm }}>
              Category
            </Typography>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>

        </ScrollView>

        {/* ── Action bar ── */}
        <View style={[
          styles.actionBar, 
          { 
            borderTopColor: colors.border, 
            backgroundColor: colors.background,
            paddingBottom: keyboardVisible ? Spacing.md : insets.bottom + Spacing.md,
            justifyContent: editRecord ? 'flex-end' : 'space-between'
          }
        ]}>
          {!editRecord && (
            <TouchableOpacity
              style={styles.saveAnotherBtn}
              onPress={() => handleSave(true)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Typography variant="bodySemiBold" style={{ color: colors.textSecondary }}>
                Save & add another
              </Typography>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => handleSave(false)}
            disabled={loading}
            activeOpacity={0.8}
            style={styles.saveBtn}
          >
            <LinearGradient
              colors={isSpend ? ['#1e4d30', '#2a6b3e'] : ['#1a3a5c', '#1e5490']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveGrad}
            >
              <Ionicons name="checkmark" size={18} color={isSpend ? '#6fcf97' : '#56b4d3'} />
              <Typography variant="bodySemiBold" style={{ color: '#fff', marginLeft: 6 }}>
                {editRecord ? 'Update' : 'Save'}
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </View>

      {/* Category picker — shows only income or expense categories */}
      <CategoryPickerSheet
        sheetRef={catSheetRef}
        transactionType={isSpend ? 'expense' : 'income'}
        selected={category}
        onSelect={setCategory}
      />

      <CentralModal
        visible={modalCfg.visible}
        onClose={() => setModalCfg(c => ({ ...c, visible: false }))}
        title={modalCfg.title}
        message={modalCfg.message}
        type={modalCfg.type}
      />
    </KeyboardAvoidingView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
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
  // Payment
  payCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  payIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payMethodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payDropdown: { borderTopWidth: 1 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  // Category
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Actions
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.lg,
  },
  saveAnotherBtn: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  saveBtn: { borderRadius: Radii.xl, overflow: 'hidden' },
  saveGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md + 2,
  },
});
