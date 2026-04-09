import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from './Typography';
import { useTheme } from '../../context/ThemeContext';

export interface TabSwitchOption<T> {
  label:  string;
  value:  T;
  count?: number;
}

interface TabSwitchProps<T> {
  options:      TabSwitchOption<T>[];
  value:        T;
  onChange:     (value: T) => void;
  style?:       ViewStyle;
}

export function TabSwitch<T>({
  options,
  value,
  onChange,
  style,
}: TabSwitchProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [indicatorX] = useState(new Animated.Value(0));
  const { colors } = useTheme();

  const activeIndex = options.findIndex(opt => opt.value === value);

  useEffect(() => {
    if (containerWidth > 0 && activeIndex >= 0) {
      const tabWidth = containerWidth / options.length;
      Animated.spring(indicatorX, {
        toValue: activeIndex * tabWidth,
        useNativeDriver: true,
        bounciness: 2,
        speed: 12,
      }).start();
    }
  }, [activeIndex, containerWidth, options.length]);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const tabWidth = containerWidth / options.length;

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth - 6,
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            transform: [{ translateX: indicatorX }],
          },
        ]}
      />

      {options.map((option, index) => {
        const isActive = activeIndex === index;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onChange(option.value)}
            style={[styles.tab, { width: tabWidth }]}
            activeOpacity={0.7}
          >
            <Typography
              variant="label"
              style={StyleSheet.flatten([
                styles.label,
                { color: isActive ? colors.text : colors.textSecondary },
                isActive && styles.activeLabel,
              ])}
            >
              {option.label}
            </Typography>
            
            {option.count !== undefined && (
              <View style={[
                styles.badge,
                { backgroundColor: isActive ? colors.text + '10' : colors.backgroundTertiary }
              ]}>
                <Typography variant="caption" style={styles.badgeText}>
                  {option.count}
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
    height: 44,
    borderRadius: Radii.xl,
    padding: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  indicator: {
    position: 'absolute',
    height: 36,
    borderRadius: Radii.lg,
    left: 3,
    zIndex: 0,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    gap: 6,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  activeLabel: {
    fontWeight: '700',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
