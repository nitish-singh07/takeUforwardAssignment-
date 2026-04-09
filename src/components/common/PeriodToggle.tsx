import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

export interface PeriodToggleOption<T> {
  label: string;
  value: T;
  count?: number;
}

interface PeriodToggleProps<T> {
  options: PeriodToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Standardized pill-style toggle component for switching periods.
 * Used primarily in the Analytics/Balances screen as per user preference.
 */
export function PeriodToggle<T>({ options, value, onChange }: PeriodToggleProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <TouchableOpacity
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
            style={[
              styles.btn,
              { 
                borderColor: isActive ? colors.text : colors.border,
                backgroundColor: isActive ? colors.text : 'transparent'
              },
            ]}
          >
            <Typography
              variant="label"
              style={{
                color: isActive ? colors.background : colors.textSecondary,
                fontWeight: '700',
                letterSpacing: 0.3,
              }}
            >
              {opt.label}
            </Typography>

            {opt.count !== undefined && (
              <View style={[
                styles.badge,
                { backgroundColor: isActive ? colors.background + '30' : colors.backgroundTertiary },
              ]}>
                <Typography
                  variant="caption"
                  style={{
                    color: isActive ? colors.background : colors.textTertiary,
                    fontWeight: '700',
                    fontSize: 10,
                  }}
                >
                  {opt.count}
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});
