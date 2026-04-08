/**
 * AuthFormField
 * Themed text input with label, inline error, and optional password toggle.
 * Focus border uses colors.secondary (brand teal).
 * All colors come from the theme — no hardcoded hex values.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Radii } from '../../constants/theme';

// ─── Inline error ─────────────────────────────────────────────────────────────

export const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={errStyles.row}>
      <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
      <Typography variant="caption" style={StyleSheet.flatten([errStyles.text, { color: colors.error }])}>
        {message}
      </Typography>
    </View>
  );
};

const errStyles = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 4 },
  text: { flex: 1 },
});

// ─── Password hint row ────────────────────────────────────────────────────────

interface PasswordHintRowProps {
  value: string;
}

interface Requirement {
  label: string;
  met:   (v: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { label: 'At least 6 characters',     met: v => v.length >= 6 },
  { label: 'No leading/trailing spaces', met: v => v === v.trim() },
];

export const PasswordHintRow: React.FC<PasswordHintRowProps> = ({ value }) => {
  const { colors } = useTheme();

  return (
    <View style={hintStyles.container}>
      {REQUIREMENTS.map(req => {
        const met = value.length > 0 && req.met(value);
        return (
          <View key={req.label} style={hintStyles.row}>
            <Ionicons
              name={met ? 'checkmark-circle' : 'ellipse-outline'}
              size={13}
              color={met ? colors.success : colors.textTertiary}
            />
            <Typography
              variant="caption"
              style={{ color: met ? colors.success : colors.textTertiary, marginLeft: 5 }}
            >
              {req.label}
            </Typography>
          </View>
        );
      })}
    </View>
  );
};

const hintStyles = StyleSheet.create({
  container: { marginTop: 8, gap: 4, paddingLeft: 2 },
  row:       { flexDirection: 'row', alignItems: 'center' },
});

// ─── Main field component ─────────────────────────────────────────────────────

interface AuthFormFieldProps {
  label:            string;
  value:            string;
  onChangeText:     (v: string) => void;
  placeholder:      string;
  error?:           string;
  isPassword?:      boolean;
  keyboardType?:    TextInput['props']['keyboardType'];
  autoCapitalize?:  TextInput['props']['autoCapitalize'];
  returnKeyType?:   TextInput['props']['returnKeyType'];
  inputRef?:        React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  autoFocus?:       boolean;
}

export const AuthFormField: React.FC<AuthFormFieldProps> = ({
  label, value, onChangeText, placeholder, error, isPassword,
  keyboardType = 'default', autoCapitalize = 'none',
  returnKeyType = 'next', inputRef, onSubmitEditing, autoFocus,
}) => {
  const { colors } = useTheme();
  const [hidden,  setHidden]  = useState(true);
  const [focused, setFocused] = useState(false);

  // Border priority: error > focused > default
  const borderColor = error
    ? colors.error
    : focused
      ? colors.text
      : colors.border;

  const borderWidth = focused && !error ? 2 : 1;

  return (
    <View style={fieldStyles.wrapper}>
      <Typography
        variant="caption"
        style={StyleSheet.flatten([fieldStyles.label, { color: colors.textSecondary }])}
      >
        {label}
      </Typography>

      <View
        style={[
          fieldStyles.box,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor,
            borderWidth,
          },
        ]}
      >
        <TextInput
          ref={inputRef as any}
          style={[fieldStyles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          autoCorrect={false}
          blurOnSubmit={returnKeyType === 'done'}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setHidden(h => !h)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ paddingRight: Spacing.md }}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
      </View>

      <FieldError message={error} />
    </View>
  );
};

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.sm },
  label:   { marginBottom: 6, letterSpacing: 0.3 },
  box: {
    flexDirection:     'row',
    alignItems:        'center',
    borderRadius:      Radii.lg,
    height:            52,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex:     1,
    fontSize: 16,
    padding:  0,
  },
});
