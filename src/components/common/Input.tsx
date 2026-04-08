import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography as Typos } from './Typography';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);
  const { colors } = useTheme();

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Typos variant="label" style={{ ...styles.label, color: colors.text }}>
          {label}
        </Typos>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: error
              ? colors.error
              : isFocused
              ? colors.text
              : colors.border,
          },
          style,
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Typos variant="caption" style={{ ...styles.errorText, color: colors.error }}>
          {error}
        </Typos>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
    width: '100%',
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  inputWrapper: {
    height: 52,
    borderRadius: Radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  iconButton: {
    padding: Spacing.xs,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
});
