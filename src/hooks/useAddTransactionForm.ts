import { useState, useEffect, useCallback } from 'react';
import { Keyboard, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';
import { useSettingsStore } from '../store/settingsStore';
import { ExpenseRecord } from '../types';

interface UseAddTransactionFormProps {
  editRecord?: ExpenseRecord;
  onSuccess: (addAnother: boolean) => void;
  onError: (title: string, message: string) => void;
}

export const useAddTransactionForm = ({
  editRecord,
  onSuccess,
  onError,
}: UseAddTransactionFormProps) => {
  const { user } = useAuthStore();
  const { addTransaction, updateTransaction, loading } = useFinanceStore();
  const triggerHaptic = useSettingsStore(s => s.triggerHaptic);

  // Form state
  const [isSpend, setIsSpend] = useState(editRecord ? editRecord.trend === 'decrement' : true);
  const [amount, setAmount] = useState(editRecord ? String(editRecord.amount) : '');
  const [merchant, setMerchant] = useState(editRecord ? editRecord.merchant || '' : '');
  const [note, setNote] = useState(editRecord ? editRecord.description || '' : '');
  const [category, setCategory] = useState(editRecord ? editRecord.category : 'Food');
  const [paymentMethod, setPaymentMethod] = useState(editRecord ? editRecord.payment_method || 'cash' : 'cash');
  const [date, setDate] = useState(editRecord ? new Date(editRecord.timestamp) : new Date());
  
  const [amountErr, setAmountErr] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showPayMenu, setShowPayMenu] = useState(false);

  // Switching type resets category
  const handleTypeChange = (spend: boolean) => {
    setIsSpend(spend);
    setCategory(spend ? 'Food' : 'Salary');
  };

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
        onSuccess(true);
      } else {
        onSuccess(false);
      }
    } else {
      onError('Error', 'Failed to save transaction.');
    }
  };

  const openDatePicker = () => {
    Keyboard.dismiss();
    setTimeout(() => setShowPicker(true), Platform.OS === 'android' ? 100 : 0);
  };

  return {
    state: {
      isSpend, amount, merchant, note, category, paymentMethod, date,
      amountErr, showPicker, showPayMenu, loading,
    },
    actions: {
      setIsSpend: handleTypeChange,
      setAmount,
      setMerchant,
      setNote,
      setCategory,
      setPaymentMethod,
      setDate,
      setAmountErr,
      setShowPicker,
      setShowPayMenu,
      handleSave,
      openDatePicker,
    }
  };
};
