import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Radii } from '../../constants/theme';

interface SearchHeaderProps {
  query: string;
  setQuery: (q: string) => void;
  searching: boolean;
  isFocused: boolean;
  setIsFocused: (f: boolean) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  setQuery,
  searching,
  isFocused,
  setIsFocused,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const inputRef  = useRef<TextInput>(null);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.searchBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: isFocused ? colors.text : colors.border,
            borderWidth: isFocused ? 1.5 : 1,
          }
        ]}
      >
        <Ionicons name="search-outline" size={18} color={isFocused ? colors.text : colors.textTertiary} style={{ marginLeft: Spacing.md }} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name, category, note..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
        />
        <View style={styles.rightIcons}>
          {searching ? (
            <ActivityIndicator size="small" color={colors.textTertiary} />
          ) : query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md,
    gap:            Spacing.md,
    borderBottomWidth: 1,
  },
  inputWrapper: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   Radii.full,
    borderWidth:    1,
    height:         44,
    gap:            Spacing.sm,
    overflow:       'hidden',
  },
  searchInput: {
    flex:     1,
    fontSize: 16,
    padding:  0,
  },
  rightIcons: {
    paddingRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
});
