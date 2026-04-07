import { Platform } from 'react-native';

// ─── Brand Colors ────────────────────────────────────────────────────────────
const brand = {
    purple: '#3B2C6E',
    teal: '#3BB9A1',
    pink: '#EE89DF',
    gold: '#FBDE9D',
    blue: '#74B8EF',
    red: '#D53436',
};

// ─── Palette ─────────────────────────────────────────────────────────────────
const palette = {
    // Dark Palette (Specified)
    dark: {
        bg: '#0A0A0A',
        heading: '#FAFAFA',
        border: '#262626',
        subheading: '#A1A1A1',
        secondaryBg: '#171717',
        gray500: '#464646',
    },
    // Light Palette (Generated for consistency)
    light: {
        bg: '#FFFFFF',
        heading: '#0A0A0A',
        border: '#E2E8F0',
        subheading: '#525252',
        secondaryBg: '#F8FAFC',
        gray500: '#71717A',
    },
    white: '#FFFFFF',
    black: '#000000',
};

// ─── Gradients ───────────────────────────────────────────────────────────────
export const Gradients = {
    dark: {
        card: ['#262626', '#0A0A0A'],
        pieChart: ['#F6D2B3', '#3FB9A2'],
        creditCard: ['#FBDE9D', '#3BB9A1'],
        itemCard: ['#192D29', '#262626', '#0A0A0A'],
    },
    light: {
        card: ['#FAFAFA', '#F5F5F5'],
        pieChart: ['#F6D2B3', '#3FB9A2'],
        creditCard: ['#FBDE9D', '#3BB9A1'],
        itemCard: ['#E6F4F1', '#F1F5F9', '#FFFFFF'],
    },
};

// ─── Semantic Colors (light / dark) ──────────────────────────────────────────
export const Colors = {
    light: {
        // Brand
        primary: brand.purple,
        secondary: brand.teal,
        accent: brand.pink,
        highlight: brand.gold,

        // Text
        text: palette.light.heading,
        textSecondary: palette.light.subheading,
        textTertiary: '#94A3B8',
        textInverse: palette.dark.heading,

        // Backgrounds
        background: palette.light.bg,
        backgroundSecondary: palette.light.secondaryBg,
        backgroundTertiary: '#F1F5F9',

        // Surfaces
        surface: palette.white,
        surfaceRaised: '#F1F5F9',

        // Borders
        border: palette.light.border,
        borderLight: '#F1F5F9',

        // Icons
        icon: '#64748B',
        iconSecondary: '#94A3B8',

        // Status
        success: '#10B981',
        error: brand.red,
        warning: '#F59E0B',
        info: brand.blue,

        // Gradients
        gradients: Gradients.light,

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.4)',
        scrim: 'rgba(0, 0, 0, 0.2)',

        // Base Colors
        white: palette.white,
        black: palette.black,
        blue: brand.blue,
    },
    dark: {
        // Brand
        primary: brand.purple,
        secondary: brand.teal,
        accent: brand.pink,
        highlight: brand.gold,

        // Text
        text: palette.dark.heading,
        textSecondary: palette.dark.subheading,
        textTertiary: '#737373',
        textInverse: palette.light.heading,

        // Backgrounds
        background: palette.dark.bg,
        backgroundSecondary: palette.dark.secondaryBg,
        backgroundTertiary: palette.dark.border,

        // Surfaces
        surface: palette.dark.secondaryBg,
        surfaceRaised: palette.dark.border,

        // Borders
        border: palette.dark.border,
        borderLight: palette.dark.secondaryBg,

        // Icons
        icon: palette.dark.subheading,
        iconSecondary: palette.dark.gray500,

        // Status
        success: '#3BB9A1',
        error: brand.red,
        warning: '#FBBF24',
        info: brand.blue,

        // Gradients
        gradients: Gradients.dark,

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.7)',
        scrim: 'rgba(0, 0, 0, 0.5)',

        // Base Colors
        white: palette.white,
        black: palette.black,
        blue: brand.blue,
    },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
export const Typography = {
    heading1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
    heading2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
    heading3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    heading4: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodySemiBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    label: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
} as const;

// ─── Border Radii ────────────────────────────────────────────────────────────
export const Radii = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
} as const;

// ─── Fonts ───────────────────────────────────────────────────────────────────
export const Fonts = Platform.select({
    ios: {
        sans: 'system-ui',
        serif: 'ui-serif',
        rounded: 'ui-rounded',
        mono: 'ui-monospace',
    },
    default: {
        sans: 'normal',
        serif: 'serif',
        rounded: 'normal',
        mono: 'monospace',
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});

// ─── Type exports for consumers ──────────────────────────────────────────────
export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;
export type ThemeColorKey = keyof ThemeColors;