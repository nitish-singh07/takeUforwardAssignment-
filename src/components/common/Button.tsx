import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  ColorValue,
} from 'react-native';
import { Colors, Spacing, Radii, Typography as TypographyStyles, ColorScheme } from '../../constants/theme';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'error';
  loading?: boolean;
  scheme?: ColorScheme;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  scheme = 'dark',
  style,
  disabled,
  ...props
}) => {
  const themeColors = Colors[scheme];
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: themeColors.text, // White/Light in dark mode
          borderColor: themeColors.text,
        };
      case 'secondary':
        return {
          backgroundColor: themeColors.backgroundSecondary,
          borderColor: themeColors.border,
          borderWidth: 1,
        };
      case 'error':
        return {
          backgroundColor: themeColors.error,
          borderColor: themeColors.error,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getLabelColor = (): keyof typeof Colors.dark => {
    if (variant === 'primary') return 'textInverse';
    if (variant === 'error') return 'white' as any;
    return 'text';
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getButtonStyle(),
        disabled && { opacity: 0.5 },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={themeColors[getLabelColor() as keyof typeof themeColors] as ColorValue} />
      ) : (
        <Typography
          variant="label"
          scheme={scheme}
          color={getLabelColor()}
          style={styles.labelStyle}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  labelStyle: {
    fontWeight: '700',
  },
});
