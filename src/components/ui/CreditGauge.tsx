import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CreditGaugeProps {
  /** Score between 0 and maxScore. Displayed in the centre. */
  score:    number;
  maxScore?: number;
  label?:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function polarToCartesian(
  cx: number, cy: number, r: number, angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function describeArc(
  cx: number, cy: number, r: number, startDeg: number, endDeg: number
): string {
  const s = polarToCartesian(cx, cy, r, endDeg);
  const e = polarToCartesian(cx, cy, r, startDeg);
  const large = startDeg - endDeg <= 180 ? '0' : '1';
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CreditGauge: React.FC<CreditGaugeProps> = ({
  score,
  maxScore = 1000,
  label,
}) => {
  const { colors } = useTheme();

  const screenWidth = Dimensions.get('window').width;
  const size        = screenWidth * 0.8;
  const strokeWidth = 20;
  const radius      = (size - strokeWidth) / 2;
  const center      = size / 2;

  const progress     = Math.min(Math.max(score / maxScore, 0), 1);
  const currentAngle = 180 - progress * 180;

  const bgPath       = describeArc(center, center, radius, 180, 0);
  const progressPath = describeArc(center, center, radius, 180, currentAngle);
  const indicatorPos = polarToCartesian(center, center, radius, currentAngle);

  // Derive label from score if not provided
  const displayLabel = label ?? (
    score > 700 ? 'Excellent financial health 🎉' :
    score > 400 ? 'Stable financial health 👍' :
                  'High spending this month ⚠️'
  );

  const today = new Date().toLocaleDateString('default', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <Svg
        width={size}
        height={size / 1.5}
        viewBox={`0 0 ${size} ${size / 2 + 50}`}
      >
        <Defs>
          <SvgLinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%"   stopColor="#3BB9A1" />
            <Stop offset="50%"  stopColor="#EE89DF" />
            <Stop offset="100%" stopColor="#3B2C6E" />
          </SvgLinearGradient>
        </Defs>

        {/* Background track */}
        <Path
          d={bgPath}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="10, 5"
        />

        {/* Filled progress arc */}
        <Path
          d={progressPath}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Indicator dot */}
        <G>
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={12}
            fill={colors.background}
            stroke={colors.primary ?? '#3BB9A1'}
            strokeWidth={4}
          />
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={4}
            fill={colors.text}
          />
        </G>

        {/* Score number */}
        <SvgText
          x={center}
          y={center - 10}
          textAnchor="middle"
          fontSize="64"
          fontWeight="900"
          fill={colors.text}
        >
          {score}
        </SvgText>
      </Svg>

      {/* Label below */}
      <View style={styles.labelBlock}>
        <Typography variant="heading4" style={styles.scoreLabel}>
          {displayLabel}
        </Typography>
        <Typography variant="caption" style={{ color: colors.textTertiary }}>
          Calculated on {today}
        </Typography>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems:      'center',
    justifyContent:  'center',
    marginVertical:  Spacing['2xl'],
  },
  labelBlock: {
    alignItems:  'center',
    marginTop:   -Spacing.xl,
    gap:         4,
  },
  scoreLabel: {
    fontWeight:   '700',
    textAlign:    'center',
  },
});
