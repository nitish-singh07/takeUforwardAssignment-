/**
 * AuthSubmitButton
 * Gradient submit button — teal when form is valid, muted when not.
 * Always visible so users can see why the action is unavailable.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Radii } from '../../constants/theme';

interface AuthSubmitButtonProps {
  label:    string;
  onPress:  () => void;
  loading:  boolean;
  enabled:  boolean;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  label, onPress, loading, enabled,
}) => {
  const { colors } = useTheme();

  const bgColor      = enabled ? colors.text              : colors.backgroundTertiary;
  const contentColor = enabled ? colors.background         : colors.textTertiary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
      style={styles.wrapper}
    >
      <View style={[styles.btn, { backgroundColor: bgColor }]}>
        {loading ? (
          <ActivityIndicator color={contentColor} />
        ) : (
          <>
            <Typography variant="bodySemiBold" style={{ color: contentColor }}>
              {label}
            </Typography>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={contentColor}
              style={{ marginLeft: 8 }}
            />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radii.xl,
    overflow:     'hidden',
    marginTop:    16,
  },
  btn: {
    height:         54,
    borderRadius:   Radii.xl,
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
  },
});
