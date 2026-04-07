import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography, ColorScheme } from '../../constants/theme';
import { Typography as Typos } from '../common/Typography';

interface CreditGaugeProps {
  score: number;
  maxScore?: number;
  label?: string;
  scheme?: ColorScheme;
}

export const CreditGauge: React.FC<CreditGaugeProps> = ({
  score,
  maxScore = 850,
  label = 'Your Credit Score is average',
  scheme = 'dark',
}) => {
  const themeColors = Colors[scheme];
  const screenWidth = Dimensions.get('window').width;
  const size = screenWidth * 0.8;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Angle calculations for semi-circle (from 180 to 0 degrees)
  // We want the gauge to go from left to right (9 o'clock to 3 o'clock)
  const startAngle = 180;
  const endAngle = 0;
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY - radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = startAngle - endAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  // The total length of the semi-circle (180 degrees)
  const totalLength = Math.PI * radius;
  // Calculate current progress as a percentage of the total score
  const progress = Math.min(score / maxScore, 1);
  const currentAngle = startAngle - progress * 180;
  
  // Arc path for the background (gray)
  const bgPath = describeArc(center, center, radius, startAngle, endAngle);
  
  // Position of the indicator dot
  const indicatorPos = polarToCartesian(center, center, radius, currentAngle);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size / 1.5} viewBox={`0 0 ${size} ${size / 2 + 50}`}>
        <Defs>
          <SvgLinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#3BB9A1" />
            <Stop offset="50%" stopColor="#EE89DF" />
            <Stop offset="100%" stopColor="#3B2C6E" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Background Arc */}
        <Path
          d={bgPath}
          fill="none"
          stroke={themeColors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="10, 5" // Dashed style as seen in mockup
        />
        
        {/* Progress Arc */}
        <Path
          d={describeArc(center, center, radius, startAngle, currentAngle)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Indicator Dot */}
        <G>
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={12}
            fill={themeColors.background}
            stroke={themeColors.blue}
            strokeWidth={4}
          />
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={4}
            fill={themeColors.text}
          />
        </G>
        
        {/* Score Text */}
        <SvgText
          x={center}
          y={center - 10}
          textAnchor="middle"
          fontSize="64"
          fontWeight="900"
          fill={themeColors.text}
        >
          {score}
        </SvgText>
      </Svg>
      
      <View style={styles.labelContainer}>
        <Typos variant="heading4" color="text" scheme={scheme} style={styles.scoreLabel}>
          {label}
        </Typos>
        <Typos variant="caption" color="textSecondary" scheme={scheme}>
          Last Check on 21 Apr
        </Typos>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  labelContainer: {
    alignItems: 'center',
    marginTop: -20,
  },
  scoreLabel: {
    fontWeight: '700',
    marginBottom: 4,
  },
});
