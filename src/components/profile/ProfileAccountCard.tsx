import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../constants/theme';
import { Card } from '../common/Card';
import { Typography } from '../common/Typography';
import { SettingsRow } from './SettingsRow';
import { useTheme } from '../../context/ThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileAccountCardProps {
  onSignOutPress: () => void;
  onDeletePress: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfileAccountCard: React.FC<ProfileAccountCardProps> = ({
  onSignOutPress,
  onDeletePress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Typography
        variant="label"
        style={{ ...styles.sectionLabel, color: colors.textTertiary }}
      >
        ACCOUNT
      </Typography>

      <Card variant="solid" style={styles.card}>
        {/* App version — non-interactive info row */}
        <SettingsRow
          icon="information-circle-outline"
          label="Version"
          rightElement={
            <Typography variant="body" style={{ color: colors.textSecondary }}>
              1.0.0
            </Typography>
          }
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Sign out */}
        <SettingsRow
          icon="log-out-outline"
          label="Sign Out"
          iconBoxColor={colors.warning + '1A'}
          iconColor={colors.warning}
          labelColor={colors.warning}
          onPress={onSignOutPress}
        />

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Delete account */}
        <SettingsRow
          icon="trash-outline"
          label="Delete Account"
          caption="Irreversible — all data will be erased"
          iconBoxColor={colors.error + '1A'}
          iconColor={colors.error}
          labelColor={colors.error}
          onPress={onDeletePress}
        />
      </Card>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: 36 + Spacing.md + Spacing.lg,
  },
});
