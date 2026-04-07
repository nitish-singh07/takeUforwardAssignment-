import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography, ColorScheme } from '../../constants/theme';
import { Typography as Typos } from './Typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  scheme?: ColorScheme;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  scheme = 'dark',
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);
  
  const themeColors = Colors[scheme];

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
        <Typos variant="label" color="text" scheme={scheme} style={styles.label}>
          {label}
        </Typos>
      )}
      
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: themeColors.backgroundSecondary,
            borderColor: error ? themeColors.error : isFocused ? themeColors.text : themeColors.border,
          },
          style,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: themeColors.text },
          ]}
          placeholderTextColor={themeColors.textTertiary}
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
              color={themeColors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Typos variant="caption" color="error" scheme={scheme} style={styles.errorText}>
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
