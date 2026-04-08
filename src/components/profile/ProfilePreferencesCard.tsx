import React from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Spacing, Radii } from '../../constants/theme';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { SettingsRow } from './SettingsRow';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsStore } from '../../store/settingsStore';
import { ThemeMode } from '../../store/settingsStore';
import * as Haptics from 'expo-haptics';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfilePreferencesCardProps {
  themeMode: ThemeMode;
  onAppearancePress: () => void;
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  value: boolean;
  onToggle: () => void;
}

const THEME_LABEL: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
  system: 'System',
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onToggle }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[
        styles.toggle,
        { backgroundColor: value ? colors.text : colors.border },
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: colors.background,
            transform: [{ translateX: value ? 18 : 2 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfilePreferencesCard: React.FC<ProfilePreferencesCardProps> = ({
  themeMode,
  onAppearancePress,
}) => {
  const { colors } = useTheme();
  const { hapticsEnabled, setHapticsEnabled } = useSettingsStore();

  const handleHapticsToggle = () => {
    setHapticsEnabled(!hapticsEnabled);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.section}>
      <Typography
        variant="label"
        style={{ ...styles.sectionLabel, color: colors.textTertiary }}
      >
        PREFERENCES
      </Typography>

      <Card variant="solid" style={styles.card}>
        <SettingsRow
          icon="contrast-outline"
          label="Appearance"
          caption={THEME_LABEL[themeMode]}
          onPress={onAppearancePress}
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <SettingsRow
          icon="phone-portrait-outline"
          label="Haptic Feedback"
          caption={hapticsEnabled ? 'On' : 'Off'}
          rightElement={
            <ToggleSwitch value={hapticsEnabled} onToggle={handleHapticsToggle} />
          }
        />
      </Card>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: 36 + Spacing.md + Spacing.lg, // align with text block start
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
