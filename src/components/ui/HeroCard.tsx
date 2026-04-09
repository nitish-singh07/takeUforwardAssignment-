import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { formatCurrency } from '../../utils/currency';

interface HeroCardProps {
  balance:        number;
  monthlyIncome:  number;
  monthlyExpense: number;
  holderName:     string;
  monthName:      string;
}

/**
 * Premium Hero Card showing balance and monthly summary.
 */
export const HeroCard: React.FC<HeroCardProps> = ({
  balance, monthlyIncome, monthlyExpense, holderName, monthName,
}) => {
  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)
    : 0;

  const isPositive = balance >= 0;

  return (
    <View style={styles.wrapper}>
      {/* ── Bank card ── */}
      <LinearGradient
        colors={['#FBDE9D', '#3BB9A1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <Typography variant="bodySemiBold" style={styles.bankName}>
            PayU
          </Typography>
          <View style={styles.iconCircle}>
            <Ionicons name="wallet-outline" size={20} color="rgba(255,255,255,0.9)" />
          </View>
        </View>

        {/* Balance — centred, large */}
        <View style={styles.balanceBlock}>
          <Typography variant="caption" style={styles.balanceLabel}>
            Net Balance
          </Typography>
          <View style={styles.balanceRow}>
            <Typography style={styles.balanceDollars}>
              {!isPositive ? '−' : ''}{formatCurrency(Math.abs(balance))}
            </Typography>
          </View>
        </View>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View>
            <Typography variant="caption" style={styles.dimLabel}>Card Holder</Typography>
            <Typography variant="bodySemiBold" style={styles.holderName}>
              {holderName.toUpperCase()}
            </Typography>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Typography variant="caption" style={styles.dimLabel}>{monthName}</Typography>
            <Typography variant="bodySemiBold" style={styles.holderName}>
              {savingsRate >= 0 ? '+' : ''}{savingsRate}% saved
            </Typography>
          </View>
        </View>
      </LinearGradient>

      {/* ── Stats strip below card ── */}
      <View style={styles.statsStrip}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
          <View>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
              Income
            </Typography>
            <Typography variant="bodySemiBold" style={{ color: '#10b981' }}>
              +{formatCurrency(monthlyIncome)}
            </Typography>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
          <View>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
              Expenses
            </Typography>
            <Typography variant="bodySemiBold" style={{ color: '#ef4444' }}>
              −{formatCurrency(monthlyExpense)}
            </Typography>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: isPositive ? '#10b981' : '#ef4444' }]} />
          <View>
            <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10 }}>
              Net
            </Typography>
            <Typography
              variant="bodySemiBold"
              style={{ color: isPositive ? '#10b981' : '#ef4444' }}
            >
              {isPositive ? '+' : '−'}{formatCurrency(Math.abs(monthlyIncome - monthlyExpense))}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing['2xl'],
    borderRadius: Radii['2xl'],
    overflow:     'hidden',
    shadowColor:  '#3BB9A1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation:    10,
  },
  card: {
    height:            200,
    padding:           Spacing.xl,
    justifyContent:    'space-between',
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  bankName: {
    color:       'rgba(0,0,0,0.75)',
    fontWeight:  '800',
    fontSize:    18,
    letterSpacing: 0.5,
  },
  iconCircle: {
    width:          38,
    height:         38,
    borderRadius:   19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems:     'center',
  },
  balanceBlock: {
    alignItems: 'center',
  },
  balanceLabel: {
    color:         'rgba(0,0,0,0.5)',
    letterSpacing: 1,
    marginBottom:  4,
    textTransform: 'uppercase',
    fontSize:      10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
  },
  balanceDollars: {
    color:        'rgba(0,0,0,0.85)',
    fontSize:     42,
    fontWeight:   '900',
    letterSpacing: -1,
    lineHeight:   46,
  },
  bottomRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-end',
  },
  dimLabel: {
    color:         'rgba(0,0,0,0.45)',
    fontSize:      10,
    letterSpacing: 0.5,
    marginBottom:  2,
  },
  holderName: {
    color:        'rgba(0,0,0,0.8)',
    fontWeight:   '700',
    letterSpacing: 0.5,
  },
  statsStrip: {
    flexDirection:     'row',
    backgroundColor:  '#111',
    paddingVertical:   Spacing.md,
    paddingHorizontal: Spacing.xl,
    justifyContent:    'space-around',
    alignItems:        'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.sm,
  },
  statDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
  },
  statDivider: {
    width:           1,
    height:          32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
