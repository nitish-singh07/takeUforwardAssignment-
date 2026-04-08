import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { UserProfile } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const BANNER_HEIGHT = 88;
const AVATAR_SIZE   = 76;
const AVATAR_BORDER = 4;
// How much the avatar peeks above the body section
const AVATAR_OVERLAP = AVATAR_SIZE / 2 + AVATAR_BORDER;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map(part => part[0] ?? '')
    .join('')
    .toUpperCase();
}

function formatMemberSince(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('default', {
    month: 'long',
    year: 'numeric',
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileHeroCardProps {
  user: UserProfile;
  onEditPress: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  user,
  onEditPress,
}) => {
  const { colors, scheme } = useTheme();

  const initials    = getInitials(user.fullName);
  const memberSince = formatMemberSince(user.created_at);

  // Subtle gradient that adapts to scheme
  const bannerColors: readonly [string, string] =
    scheme === 'dark' ? ['#1e2a3a', '#111827'] : ['#dde8ff', '#eef3ff'];

  return (
    /**
     * Outer shell — border + corner radius, but NO overflow:hidden so the
     * avatar ring is not clipped when it overlaps the banner boundary.
     */
    <View style={[styles.shell, { borderColor: colors.border }]}>

      {/* ── Banner (gradient top section) ── */}
      <LinearGradient
        colors={bannerColors}
        style={styles.banner}
      />

      {/* ── Edit button, positioned over the banner ── */}
      <TouchableOpacity
        onPress={onEditPress}
        style={[
          styles.editButton,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="pencil" size={14} color={colors.text} />
      </TouchableOpacity>

      {/* ── Body (info section below banner) ── */}
      <View style={[styles.body, { backgroundColor: colors.backgroundSecondary }]}>

        {/* Avatar ring — pulled up over the banner by negative margin */}
        <View
          style={[
            styles.avatarRing,
            {
              borderColor: colors.backgroundSecondary,
              marginTop: -AVATAR_OVERLAP,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.text }]}>
            <Typography
              variant="heading2"
              style={{ color: colors.textInverse, fontWeight: '800' }}
            >
              {initials}
            </Typography>
          </View>
        </View>

        {/* Name */}
        <Typography variant="heading3" style={styles.name}>
          {user.fullName}
        </Typography>

        {/* Email */}
        <Typography
          variant="bodySmall"
          style={{ color: colors.textSecondary, marginTop: 2 }}
        >
          {user.email}
        </Typography>

        {/* Member since badge */}
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <Ionicons name="calendar-outline" size={11} color={colors.textTertiary} />
          <Typography
            variant="caption"
            style={{ color: colors.textTertiary, marginLeft: 4 }}
          >
            Member since {memberSince}
          </Typography>
        </View>

      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  /**
   * The outer shell holds the border + radius.
   * overflow is NOT 'hidden' so the avatar can safely overlap the banner edge.
   */
  shell: {
    marginHorizontal: Spacing['2xl'],
    marginTop: Spacing['2xl'],
    borderRadius: Radii['2xl'],
    borderWidth: 1,
  },
  banner: {
    height: BANNER_HEIGHT,
    // Match only the top corners to the shell's border radius
    borderTopLeftRadius: Radii['2xl'] - 1,
    borderTopRightRadius: Radii['2xl'] - 1,
  },
  editButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Needs zIndex to sit on top of the banner
    zIndex: 10,
  },
  body: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    alignItems: 'flex-start',
    // Match only the bottom corners so the body fills the shell cleanly
    borderBottomLeftRadius: Radii['2xl'] - 1,
    borderBottomRightRadius: Radii['2xl'] - 1,
  },
  avatarRing: {
    borderWidth: AVATAR_BORDER,
    borderRadius: AVATAR_SIZE / 2 + AVATAR_BORDER,
    marginBottom: Spacing.md,
    // Shadow so the avatar lifts off the banner
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
});
