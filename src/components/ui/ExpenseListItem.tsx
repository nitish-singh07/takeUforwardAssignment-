import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, ColorScheme } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { Card } from '../common/Card';

interface ExpenseListItemProps {
  title: string;
  subtitle: string;
  amount: string;
  iconName: keyof typeof Ionicons.glyphMap;
  trend?: 'increment' | 'decrement';
  onPress?: () => void;
  scheme?: ColorScheme;
}

export const ExpenseListItem: React.FC<ExpenseListItemProps> = ({
  title,
  subtitle,
  amount,
  iconName,
  trend = 'decrement',
  onPress,
  scheme = 'dark',
}) => {
  const themeColors = Colors[scheme];
  const amountColor = trend === 'increment' ? themeColors.success : themeColors.error;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        style={StyleSheet.flatten([styles.container, { borderColor: themeColors.border }]) as ViewStyle}
        variant="solid"
        scheme={scheme}
      >
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
            <Ionicons name={iconName} size={24} color={themeColors.text} />
          </View>
          <View style={styles.textContainer}>
            <Typography variant="bodySemiBold" color="text" scheme={scheme}>
              {title}
            </Typography>
            <Typography variant="caption" color="textSecondary" scheme={scheme}>
              {subtitle}
            </Typography>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <Ionicons name="star-outline" size={20} color={themeColors.textTertiary} style={styles.starIcon} />
          <View style={[styles.amountBadge, { backgroundColor: themeColors.background }]}>
            <Typography variant="bodySemiBold" color="text" scheme={scheme} style={{ color: amountColor }}>
              {amount}
            </Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: Spacing.md,
  },
  amountBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    minWidth: 80,
    alignItems: 'center',
  },
});
