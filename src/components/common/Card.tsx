import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Spacing, ColorScheme } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'solid' | 'gradient' | 'outline' | 'elevated';
  gradientColors?: string[];
  style?: ViewStyle;
  scheme?: ColorScheme;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'solid',
  gradientColors,
  style,
  scheme = 'dark',
}) => {
  const themeColors = Colors[scheme];

  const getBaseStyle = () => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: themeColors.backgroundSecondary,
          borderColor: themeColors.border,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: themeColors.border,
          borderWidth: 1,
        };
      case 'elevated':
        return {
          backgroundColor: themeColors.backgroundSecondary,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
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
