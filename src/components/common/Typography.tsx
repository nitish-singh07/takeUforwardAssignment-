import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography as TypographyStyles, ColorScheme } from '../../constants/theme';

interface CustomTypographyProps extends TextProps {
  variant?: keyof typeof TypographyStyles;
  color?: keyof typeof Colors.dark;
  scheme?: ColorScheme;
  style?: TextStyle;
}

export const Typography: React.FC<CustomTypographyProps> = ({
  variant = 'body',
  color = 'text',
  scheme = 'dark',
  style,
  children,
  ...props
}) => {
  const themeColors = Colors[scheme];
  const typographyStyle = TypographyStyles[variant];
  
  // Type-safe color lookup excluding the 'gradients' object
  const textColor = (themeColors[color as keyof typeof themeColors] as string) || themeColors.text;

  return (
    <Text
      style={[
        {
          color: textColor,
          ...typographyStyle,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
