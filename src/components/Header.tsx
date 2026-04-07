import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii } from '../constants/theme';
import { Typography } from './common/Typography';
import * as Haptic from '../utils/haptic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const Header: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const toggleSearch = () => {
    Haptic.tap();
    if (isSearchVisible) {
      Animated.timing(searchAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setIsSearchVisible(false));
    } else {
      setIsSearchVisible(true);
      Animated.timing(searchAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => inputRef.current?.focus());
    }
  };

  const searchWidth = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [40, SCREEN_WIDTH - 160],
  });

  const logoOpacity = searchAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  return (
    <View
      style={[
        styles.headerWrapper,
        { paddingTop: insets.top + 10, height: 75 + insets.top },
      ]}
    >
      <Animated.View style={[styles.headerLeft, { opacity: logoOpacity }]}>
        <View style={styles.logoBox}>
          <Typography variant="bodySemiBold" color="black" style={styles.logoLetter}>
            P
          </Typography>
        </View>
        <Typography variant="heading3" color="text" style={styles.headerTitle}>
          PayU
        </Typography>
      </Animated.View>

      <View style={styles.headerRight}>
        <Animated.View style={[styles.searchContainer, { width: searchWidth, borderColor: isSearchVisible ? Colors.dark.border : 'transparent' }]}>
          <Pressable onPress={toggleSearch} style={styles.searchIconButton}>
            <Ionicons
              name={isSearchVisible ? 'close' : 'search'}
              size={22}
              color={Colors.dark.textSecondary}
            />
          </Pressable>
          {isSearchVisible && (
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.dark.textTertiary}
              autoFocus
            />
          )}
        </Animated.View>

        <Pressable
          style={styles.notificationButton}
          onPress={() => Haptic.select()}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.dark.text} />
          <View style={styles.badge}>
            <Typography variant="caption" color="white" style={styles.badgeText}>
              2
            </Typography>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: Colors.dark.text,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLetter: {
    fontWeight: '900',
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  searchContainer: {
    height: 48,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  searchIconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    color: Colors.dark.text,
    fontSize: 16,
    paddingRight: Spacing.lg,
  },
  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.dark.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
});
