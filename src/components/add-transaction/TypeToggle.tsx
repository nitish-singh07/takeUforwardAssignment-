import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

interface TypeToggleProps {
  isSpend: boolean;
  onChange: (v: boolean) => void;
}

export const TypeToggle: React.FC<TypeToggleProps> = ({ isSpend, onChange }) => {
  const { colors } = useTheme();

  const Pill = ({
    active, label, activeColor, activeText,
  }: { active: boolean; label: string; activeColor: string; activeText: string }) => (
    <TouchableOpacity
      onPress={() => { onChange(label === 'Spend'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      activeOpacity={0.8}
      style={[
        styles.pill,
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
    <View style={styles.row}>
      <Pill active={isSpend} label="Spend" activeColor="#1e4d30" activeText="#6fcf97" />
      <Pill active={!isSpend} label="Income" activeColor="#1a3a5c" activeText="#56b4d3" />
    </View>
  );
};

const styles = StyleSheet.create({
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
});
