import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

interface AddTransactionActionsProps {
  isEdit: boolean;
  isSpend: boolean;
  loading: boolean;
  keyboardVisible: boolean;
  onSave: (addAnother: boolean) => void;
}

export const AddTransactionActions: React.FC<AddTransactionActionsProps> = ({
  isEdit, isSpend, loading, keyboardVisible, onSave,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.actionBar, 
      { 
        borderTopColor: colors.border, 
        backgroundColor: colors.background,
        paddingBottom: keyboardVisible ? Spacing.md : insets.bottom + Spacing.md,
        justifyContent: isEdit ? 'flex-end' : 'space-between'
      }
    ]}>
      {!isEdit && (
        <TouchableOpacity
          style={styles.saveAnotherBtn}
          onPress={() => onSave(true)}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Typography variant="bodySemiBold" style={{ color: colors.textSecondary }}>
            Save & add another
          </Typography>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => onSave(false)}
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
            {isEdit ? 'Update' : 'Save'}
          </Typography>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
