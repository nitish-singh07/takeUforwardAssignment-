import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Radii, ColorScheme } from '../../constants/theme';
import { Typography } from './Typography';

interface TabSwitchProps {
  options: string[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
  scheme?: ColorScheme;
  style?: ViewStyle;
}

export const TabSwitch: React.FC<TabSwitchProps> = ({
  options,
  activeIndex: externalActiveIndex,
  onSelect,
  scheme = 'dark',
  style,
}) => {
  const [activeIndex, setActiveIndex] = useState(externalActiveIndex || 0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [indicatorX] = useState(new Animated.Value(0));

  const themeColors = Colors[scheme];

  useEffect(() => {
    if (externalActiveIndex !== undefined) {
      setActiveIndex(externalActiveIndex);
    }
  }, [externalActiveIndex]);

  useEffect(() => {
    if (containerWidth > 0) {
      const tabWidth = containerWidth / options.length;
      Animated.spring(indicatorX, {
        toValue: activeIndex * tabWidth,
        useNativeDriver: true,
        bounciness: 0,
      }).start();
    }
  }, [activeIndex, containerWidth, options.length]);

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    onSelect && onSelect(index);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const tabWidth = containerWidth / options.length;

  return (
    <View
      onLayout={onLayout}
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border },
        style,
      ])}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            width: tabWidth - 4, // 2px margin on each side
            backgroundColor: themeColors.background,
            transform: [{ translateX: indicatorX }],
          },
        ]}
      />
      
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleSelect(index)}
          style={[styles.tab, { width: tabWidth }]}
          activeOpacity={1}
        >
          <Typography
            variant="label"
            scheme={scheme}
            color={activeIndex === index ? 'text' : 'textSecondary'}
            style={StyleSheet.flatten([
              styles.label,
              activeIndex === index && styles.activeLabel,
            ]) as TextStyle}
          >
            {option}
          </Typography>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: Radii.lg,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  indicator: {
    position: 'absolute',
    height: 40,
    borderRadius: Radii.md,
    left: 2,
    zIndex: 0,
  },
  tab: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
});
