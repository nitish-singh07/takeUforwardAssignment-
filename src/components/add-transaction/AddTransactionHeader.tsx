import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../constants/theme';

interface AddTransactionHeaderProps {
  title: string;
}

export const AddTransactionHeader: React.FC<AddTransactionHeaderProps> = ({ title }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { 
      borderBottomColor: colors.border,
      paddingTop: insets.top + 10,
      height: 65 + insets.top,
      backgroundColor: colors.background,
    }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.headerIconBtn}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
      
      <Typography variant="body" style={{ color: colors.textSecondary, fontWeight: '600' }}>
        {title}
      </Typography>
      
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.headerIconBtn}
      >
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
