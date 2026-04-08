import React, { useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from './Typography';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsStore, ThemeMode } from '../../store/settingsStore';
import * as Haptics from 'expo-haptics';

interface ThemePickerSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
  {
    mode: 'dark',
    label: 'Dark',
    icon: 'moon',
    description: 'Always use dark appearance',
  },
  {
    mode: 'system',
    label: 'System',
    icon: 'phone-portrait-outline',
    description: 'Match device appearance',
  },
  {
    mode: 'light',
    label: 'Light',
    icon: 'sunny',
    description: 'Always use light appearance',
  },
];

export const ThemePickerSheet: React.FC<ThemePickerSheetProps> = ({ sheetRef }) => {
  const { colors, themeMode } = useTheme();
  const { setThemeMode, triggerHaptic } = useSettingsStore();
  const snapPoints = useMemo(() => ['38%'], []);

  const handleSelect = useCallback((mode: ThemeMode) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setThemeMode(mode);
    sheetRef.current?.close();
  }, [setThemeMode, triggerHaptic, sheetRef]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      )}
      backgroundStyle={{ backgroundColor: colors.backgroundSecondary }}
      handleIndicatorStyle={{ backgroundColor: colors.textTertiary }}
    >
      <BottomSheetView style={styles.content}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Typography variant="heading3">Appearance</Typography>
            <Typography variant="bodySmall" color="textSecondary" style={{ marginTop: 2 }}>
              Choose how PayU looks to you
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => sheetRef.current?.close()}
            style={[styles.closeButton, { backgroundColor: colors.backgroundTertiary }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsList}>
          {THEME_OPTIONS.map((option) => {
            const isActive = themeMode === option.mode;
            return (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.optionRow,
                  { borderColor: colors.border },
                  isActive && { borderColor: colors.text, backgroundColor: colors.backgroundTertiary },
                ]}
                onPress={() => handleSelect(option.mode)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.backgroundSecondary }]}>
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={isActive ? colors.text : colors.textSecondary}
                  />
                </View>
                <View style={styles.optionText}>
                  <Typography
                    variant="bodySemiBold"
                    style={{ color: isActive ? colors.text : colors.textSecondary }}
                  >
                    {option.label}
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.textTertiary }}>
                    {option.description}
                  </Typography>
                </View>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.text} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
