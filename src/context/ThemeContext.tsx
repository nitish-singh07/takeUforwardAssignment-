import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { useSettingsStore, ThemeMode } from '../store/settingsStore';

type ThemeColors = typeof Colors.dark | typeof Colors.light;

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: 'dark' | 'light';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors.dark,
  scheme: 'dark',
  themeMode: 'system',
  setThemeMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  const { themeMode, setThemeMode } = useSettingsStore();

  // Resolve the effective scheme from the user's preference
  const scheme = useMemo<'dark' | 'light'>(() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark'; // default to dark if null
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const colors = Colors[scheme];

  const value = useMemo(
    () => ({ colors, scheme, themeMode, setThemeMode }),
    [colors, scheme, themeMode, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to consume the current theme in any component.
 * Returns { colors, scheme, themeMode, setThemeMode }
 */
export const useTheme = () => useContext(ThemeContext);
