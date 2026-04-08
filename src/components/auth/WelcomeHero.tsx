/**
 * WelcomeHero
 * Animated logo + tagline block that collapses smoothly when keyboard is open.
 */

import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Radii } from '../../constants/theme';

interface WelcomeHeroProps {
  /** Animated.Value from 0 (hidden) to 1 (fully visible) */
  visibility: Animated.Value;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ visibility }) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity:   visibility,
          maxHeight: visibility.interpolate({
            inputRange:  [0, 1],
            outputRange: [0, 200],
          }),
          marginBottom: visibility.interpolate({
            inputRange:  [0, 1],
            outputRange: [0, 32],
          }),
        },
      ]}
    >
      {/* Logo circle — bg uses colors.text so it inverts with theme */}
      <View style={[styles.logoCircle, { backgroundColor: colors.text }]}>
        <Typography style={StyleSheet.flatten([styles.logoLetter, { color: colors.background }])}>
          P
        </Typography>
      </View>

      <Typography
        variant="heading1"
        style={{ color: colors.text, marginBottom: Spacing.xs, textAlign: 'center' }}
      >
        Welcome to PayU
      </Typography>

      <Typography
        variant="body"
        style={StyleSheet.flatten([styles.tagline, { color: colors.textSecondary }])}
      >
        Your personal finance manager
      </Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    overflow:   'hidden',
  },
  logoCircle: {
    width:          72,
    height:         72,
    borderRadius:   24,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   Spacing.xl,
  },
  logoLetter: {
    fontSize:   36,
    fontWeight: '900',
  },
  appName: {},   // kept in case needed later
  tagline: {
    fontSize:  15,
    textAlign: 'center',
  },
});
