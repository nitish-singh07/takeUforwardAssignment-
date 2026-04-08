/**
 * AuthTabSwitch
 * Sign In / Sign Up pill tab switcher.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Radii } from '../../constants/theme';

export type AuthTab = 'signin' | 'signup';

interface AuthTabSwitchProps {
  active: AuthTab;
  onChange: (tab: AuthTab) => void;
}

export const AuthTabSwitch: React.FC<AuthTabSwitchProps> = ({ active, onChange }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
      ]}
    >
      {(['signin', 'signup'] as AuthTab[]).map(tab => {
        const isActive = active === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            activeOpacity={0.8}
            style={[
              styles.btn,
              isActive && {
                backgroundColor: colors.text,
                borderWidth: 1,
                borderRadius: Radii.full,
                borderColor: colors.border,
              },
            ]}
          >
            <Typography
              variant="label"
              style={{
                color: isActive ? colors.background : colors.textTertiary,
                fontWeight: isActive ? '700' : '500',
              }}
            >
              {tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: Radii.full,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.xl,
  },
  btn: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
