import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Keyboard } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import BottomSheet from '@gorhom/bottom-sheet';

import { Spacing } from '../constants/theme';
import { CategoryPickerSheet } from '../components/ui/CategoryPickerSheet';
import { CentralModal } from '../components/common/CentralModal';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';

// Modular Components
import { AddTransactionHeader } from '../components/add-transaction/AddTransactionHeader';
import { TypeToggle } from '../components/add-transaction/TypeToggle';
import { TransactionForm } from '../components/add-transaction/TransactionForm';
import { PaymentMethodSelector } from '../components/add-transaction/PaymentMethodSelector';
import { CategorySelector } from '../components/add-transaction/CategorySelector';
import { AddTransactionActions } from '../components/add-transaction/AddTransactionActions';

// Custom Hook
import { useAddTransactionForm } from '../hooks/useAddTransactionForm';

type AddTransactionRouteProp = RouteProp<RootStackParamList, 'AddTransaction'>;

export const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddTransactionRouteProp>();
  const editRecord = route.params?.transaction;
  const { colors } = useTheme();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [modalCfg, setModalCfg] = useState({
    visible: false, title: '', message: '', type: 'error' as any,
  });

  const catSheetRef = useRef<BottomSheet | null>(null);

  // 1. Initialize logic hook
  const { state, actions } = useAddTransactionForm({
    editRecord,
    onSuccess: (addAnother) => {
      if (!addAnother) navigation.goBack();
    },
    onError: (title, message) => {
      setModalCfg({ visible: true, title, message, type: 'error' });
    }
  });

  // 2. Keyboard listeners for footer spacing
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <View style={styles.flex}>
        <AddTransactionHeader title={editRecord ? 'Edit Transaction' : 'New Transaction'} />

        <TypeToggle isSpend={state.isSpend} onChange={actions.setIsSpend} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TransactionForm
            isSpend={state.isSpend}
            amount={state.amount}
            setAmount={actions.setAmount}
            amountErr={state.amountErr}
            setAmountErr={actions.setAmountErr}
            date={state.date}
            setDate={actions.setDate}
            showPicker={state.showPicker}
            setShowPicker={actions.setShowPicker}
            openDatePicker={actions.openDatePicker}
            merchant={state.merchant}
            setMerchant={actions.setMerchant}
            note={state.note}
            setNote={actions.setNote}
          />

          <PaymentMethodSelector
            paymentMethod={state.paymentMethod}
            setPaymentMethod={actions.setPaymentMethod}
            isSpend={state.isSpend}
            setIsSpend={actions.setIsSpend}
            showPayMenu={state.showPayMenu}
            setShowPayMenu={actions.setShowPayMenu}
          />

          <CategorySelector
            category={state.category}
            catSheetRef={catSheetRef}
          />
        </ScrollView>

        <AddTransactionActions
          isEdit={!!editRecord}
          isSpend={state.isSpend}
          loading={state.loading}
          keyboardVisible={keyboardVisible}
          onSave={actions.handleSave}
        />
      </View>

      <CategoryPickerSheet
        sheetRef={catSheetRef}
        transactionType={state.isSpend ? 'expense' : 'income'}
        selected={state.category}
        onSelect={actions.setCategory}
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
});
