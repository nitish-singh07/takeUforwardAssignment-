import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radii, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  variant?: 'solid' | 'gradient' | 'outline' | 'elevated';
  gradientColors?: string[];
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'solid',
  gradientColors,
  style,
}) => {
  const { colors, scheme } = useTheme();

  const getBaseStyle = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          borderWidth: 1,
          ...Platform.select({
            ios: {
              shadowColor: scheme === 'dark' ? '#000' : '#94A3B8',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: scheme === 'dark' ? 0.25 : 0.15,
              shadowRadius: 8,
            },
            android: {
              elevation: 4,
            },
          }),
        };
      default:
        return {};
    }
  };

  if (variant === 'gradient' && gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors as unknown as readonly [ColorValue, ColorValue, ...ColorValue[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={[styles.base, getBaseStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    overflow: 'hidden',
  },
});
