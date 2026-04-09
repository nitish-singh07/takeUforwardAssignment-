import React from 'react';
import { StyleSheet, TouchableOpacity, View, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import BottomSheet from '@gorhom/bottom-sheet';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { getCategoryConfig } from '../../utils/categoryConfig';

interface CategorySelectorProps {
  category: string;
  catSheetRef: React.RefObject<BottomSheet>;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ category, catSheetRef }) => {
  const { colors } = useTheme();
  const catConfig = getCategoryConfig(category);

  return (
    <TouchableOpacity
      style={[styles.catCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
      onPress={() => {
        Keyboard.dismiss();
        setTimeout(() => catSheetRef.current?.expand(), 100);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.catIconBox, { backgroundColor: catConfig.color + '22' }]}>
        <Ionicons name={catConfig.icon} size={22} color={catConfig.color} />
      </View>
      <Typography variant="bodySemiBold" style={{ flex: 1, marginLeft: Spacing.md }}>
        {category}
      </Typography>
      <Typography variant="caption" style={{ color: colors.textTertiary, marginRight: Spacing.sm }}>
        Category
      </Typography>
      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
