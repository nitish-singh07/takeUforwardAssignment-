import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Spacing, Radii } from '../constants/theme';
import { Typography } from './common/Typography';
import { useTheme } from '../context/ThemeContext';
import * as Haptic from '../utils/haptic';

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Global header shown on Home and Balances tabs.
 *
 * Search icon navigates to the SearchScreen (NativeStack push)
 * so the transition is a native slide — no inline animation needed.
 */
export const Header: React.FC = () => {
  const insets     = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const handleSearchPress = () => {
    Haptic.tap();
    navigation.navigate('Search');
  };

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor:    colors.background,
          borderBottomColor:  colors.border,
          paddingTop:         insets.top + 10,
          height:             75 + insets.top,
        },
      ]}
    >
      {/* Left — logo + wordmark */}
      <View style={styles.logoRow}>
        <View style={[styles.logoBox, { backgroundColor: colors.text }]}>
          <Typography variant="bodySemiBold" color="textInverse" style={styles.logoLetter}>
            P
          </Typography>
        </View>
        <Typography variant="heading3" color="text" style={styles.wordmark}>
          PayU
        </Typography>
      </View>

      {/* Right — search + notifications */}
      <View style={styles.actions}>
        {/* Search button — navigates to SearchScreen */}
        <Pressable
          onPress={handleSearchPress}
          style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Notification bell */}
        <Pressable
          style={styles.iconBtn}
          onPress={() => Haptic.select()}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.background }]}>
            <Typography variant="caption" style={styles.badgeText}>2</Typography>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing['2xl'],
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
  },
  logoBox: {
    width:          32,
    height:         32,
    borderRadius:   Radii.md,
    justifyContent: 'center',
    alignItems:     'center',
  },
  logoLetter: {
    fontWeight: '900',
  },
  wordmark: {
    fontWeight:    '700',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.md,
  },
  iconBtn: {
    position:       'relative',
    width:          40,
    height:         40,
    borderRadius:   Radii.full,
    justifyContent: 'center',
    alignItems:     'center',
    borderWidth:    1,
  },
  badge: {
    position:     'absolute',
    top:          2,
    right:        2,
    width:        16,
    height:       16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems:     'center',
    borderWidth:  2,
  },
  badgeText: {
    fontSize:   9,
    fontWeight: '900',
    color:      '#fff',
  },
});
