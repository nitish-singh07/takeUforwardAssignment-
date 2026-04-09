import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

export const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', icon: 'cash-outline' as const },
  { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline' as const },
  { key: 'card', label: 'Card', icon: 'card-outline' as const },
  { key: 'bank', label: 'Bank', icon: 'business-outline' as const },
];

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  setPaymentMethod: (m: string) => void;
  isSpend: boolean;
  setIsSpend: (v: boolean) => void;
  showPayMenu: boolean;
  setShowPayMenu: (v: boolean) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod, setPaymentMethod, isSpend, setIsSpend, showPayMenu, setShowPayMenu,
}) => {
  const { colors } = useTheme();
  const payMethod = PAYMENT_METHODS.find(p => p.key === paymentMethod) ?? PAYMENT_METHODS[0];

  return (
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

        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.5)', marginRight: Spacing.sm }}>
          {isSpend ? 'Expense' : 'Income'}
        </Typography>
        <Switch
          value={isSpend}
          onValueChange={v => { setIsSpend(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
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
  );
};

const styles = StyleSheet.create({
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
});
