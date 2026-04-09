import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Radii } from '../../constants/theme';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  color?: string;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ 
  label, 
  isActive, 
  onPress 
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          borderColor:     isActive ? colors.text : colors.border,
          backgroundColor: isActive ? colors.text : 'transparent',
        },
      ]}
    >
      <Typography
        variant="caption"
        style={{
          color:      isActive ? colors.background : colors.textSecondary,
          fontWeight: isActive ? '700' : '400',
        }}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs + 2,
    borderRadius:      Radii.full,
    borderWidth:       1,
  },
});
