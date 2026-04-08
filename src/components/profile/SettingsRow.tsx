import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsRowProps {
  /** Ionicons icon name shown in the left icon box. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Primary label text. */
  label: string;
  /** Optional secondary caption text below the label. */
  caption?: string;
  /** Override color for the icon box background (e.g. warning tint). */
  iconBoxColor?: string;
  /** Override color for the icon itself. */
  iconColor?: string;
  /** Override color for the label text. */
  labelColor?: string;
  /** Right-side element — defaults to a chevron if onPress is provided. */
  rightElement?: React.ReactNode;
  /** If provided the entire row becomes pressable and a chevron appears. */
  onPress?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Reusable settings list row.
 *
 * Usage:
 *   <SettingsRow icon="contrast-outline" label="Appearance" caption="System" onPress={…} />
 *   <SettingsRow icon="phone-portrait-outline" label="Haptics" rightElement={<ToggleSwitch … />} />
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  caption,
  iconBoxColor,
  iconColor,
  labelColor,
  rightElement,
  onPress,
}) => {
  const { colors } = useTheme();

  const resolvedIconBox  = iconBoxColor ?? colors.backgroundTertiary;
  const resolvedIcon     = iconColor    ?? colors.text;
  const resolvedLabel    = labelColor   ?? colors.text;

  const content = (
    <View style={styles.inner}>
      {/* Left icon box */}
      <View style={[styles.iconBox, { backgroundColor: resolvedIconBox }]}>
        <Ionicons name={icon} size={18} color={resolvedIcon} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Typography variant="bodySemiBold" style={{ color: resolvedLabel }}>
          {label}
        </Typography>
        {caption !== undefined && (
          <Typography variant="caption" style={{ color: colors.textTertiary }}>
            {caption}
          </Typography>
        )}
      </View>

      {/* Right element */}
      {rightElement ?? (
        onPress
          ? <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          : null
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
});
