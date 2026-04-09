import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { SkeletonLoader } from '../common/SkeletonLoader';

export const TransactionSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary + '80' }]}>
      {/* Icon box placeholder */}
      <SkeletonLoader 
        width={46} 
        height={46} 
        borderRadius={Radii.lg} 
      />

      {/* Text block placeholder */}
      <View style={styles.textBlock}>
        <SkeletonLoader width="60%" height={16} borderRadius={4} />
        <SkeletonLoader width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      {/* Amount placeholder */}
      <View style={styles.amountBlock}>
        <SkeletonLoader width={60} height={20} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
});
