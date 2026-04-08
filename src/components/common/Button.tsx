import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from './Typography';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  ...props
}) => {
  const { colors, scheme } = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    if (isDisabled) {
      // Elegant disabled style — muted surface with reduced opacity for both themes
      return {
        backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
        borderWidth: 1,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.text,
          borderColor: colors.text,
        };
      case 'secondary':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getLabelColor = () => {
    if (isDisabled) {
      return scheme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
    }
    if (variant === 'primary') return colors.textInverse;
    if (variant === 'error') return '#FFFFFF';
    return colors.text;
  };

  const getIndicatorColor = () => {
    if (isDisabled) return scheme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)';
    if (variant === 'primary') return colors.textInverse;
    return colors.text;
  };

  return (
    <TouchableOpacity
      style={[styles.base, getButtonStyle(), style]}
      disabled={isDisabled}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getIndicatorColor()} />
      ) : (
        <Typography
          variant="label"
          style={{ ...styles.labelStyle, color: getLabelColor() }}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  labelStyle: {
    fontWeight: '700',
  },
});
