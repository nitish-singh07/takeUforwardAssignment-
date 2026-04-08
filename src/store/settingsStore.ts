import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export type ThemeMode = 'dark' | 'light' | 'system';

interface SettingsState {
  hapticsEnabled: boolean;
  themeMode: ThemeMode;

  setHapticsEnabled: (enabled: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;

  /**
   * Safe wrapper for haptic feedback that respects the global setting.
   */
  triggerHaptic: (type: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType | 'selection') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hapticsEnabled: true,
      themeMode: 'system', // default: follow OS

      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      setThemeMode: (mode) => set({ themeMode: mode }),

      triggerHaptic: (type) => {
        const { hapticsEnabled } = get();
        if (!hapticsEnabled) return;

        try {
          if (type === 'selection') {
            Haptics.selectionAsync();
          } else if (type in Haptics.ImpactFeedbackStyle) {
            Haptics.impactAsync(type as Haptics.ImpactFeedbackStyle);
          } else {
            Haptics.notificationAsync(type as Haptics.NotificationFeedbackType);
          }
        } catch (err) {
          console.error('Failed to trigger haptic:', err);
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
