import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { getCategoryConfig } from '../../utils/categoryConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExpenseListItemProps {
  title:        string;
  subtitle?:    string;
  amount:       string;
  trend:        'increment' | 'decrement';
  /** Transaction timestamp (ms) — shown as formatted date. */
  timestamp?:   number;
  onPress?:     () => void;
  onLongPress?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();

  // Today → "Today, 2:30 PM"
  if (d.toDateString() === now.toDateString()) {
    return 'Today, ' + d.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
  }

  // Yesterday → "Yesterday"
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Otherwise → "8 Apr"
  return d.toLocaleDateString('default', { day: 'numeric', month: 'short' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ExpenseListItem: React.FC<ExpenseListItemProps> = ({
  title,
  subtitle,
  amount,
  trend,
  timestamp,
  onPress,
  onLongPress,
}) => {
  const { colors } = useTheme();
  const config = getCategoryConfig(title);

  const amountColor = trend === 'increment' ? colors.success : colors.error;

  // Subtle icon box background: category colour at ~15% opacity
  const iconBg = config.color + '26';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[
        styles.row,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
      ]}
    >
      {/* Category icon box */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Typography variant="bodySemiBold">{title}</Typography>
        {subtitle ? (
          <Typography variant="caption" style={{ color: colors.textTertiary }}>
            {subtitle}
          </Typography>
        ) : null}
        {timestamp ? (
          <Typography variant="caption" style={{ color: colors.textTertiary, marginTop: 1 }}>
            {formatDate(timestamp)}
          </Typography>
        ) : null}
      </View>

      {/* Amount */}
      <View style={styles.amountBlock}>
        <Typography variant="bodySemiBold" style={{ color: amountColor }}>
          {amount}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   Radii.xl,
    borderWidth:    1,
    padding:        Spacing.md,
    gap:            Spacing.md,
    marginBottom:   Spacing.sm,
  },
  iconBox: {
    width:          46,
    height:         46,
    borderRadius:   Radii.lg,
    justifyContent: 'center',
    alignItems:     'center',
  },
  textBlock: {
    flex: 1,
    gap:  2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
});
