import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Typography as TypographyStyles } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface CustomTypographyProps extends TextProps {
  variant?: keyof typeof TypographyStyles;
  color?: string;
  style?: TextStyle;
}

export const Typography: React.FC<CustomTypographyProps> = ({
  variant = 'body',
  color = 'text',
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();
  const typographyStyle = TypographyStyles[variant];

  // Resolve color: try as key in colors object, else treat as raw color value
  const textColor =
    (colors as any)[color] ?? color;

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
