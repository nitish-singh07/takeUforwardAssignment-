import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, ColorScheme } from '../../constants/theme';
import { Typography as Typos } from '../common/Typography';

interface DataPoint {
  label: string;
  value: number;
  total: number;
}

interface SpendingChartProps {
  data: DataPoint[];
  scheme?: ColorScheme;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({
  data,
  scheme = 'dark',
}) => {
  const themeColors = Colors[scheme];
  const chartHeight = 150;
  
  return (
    <View style={styles.container}>
      {/* Chart Bars */}
      <View style={[styles.chartArea, { height: chartHeight }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / item.total) * chartHeight;
          const bgHeight = chartHeight;
          
          return (
            <View key={index} style={styles.barGroup}>
              <View style={[styles.barBackground, { height: bgHeight, backgroundColor: themeColors.backgroundSecondary }]}>
                <LinearGradient
                  colors={['#3BB9A1', '#FBDE9D']}
                  style={[styles.barForeground, { height: barHeight }]}
                />
              </View>
            </View>
          );
        })}
      </View>
      
      {/* Legend / Info */}
      <View style={styles.footer}>
        <Typos variant="caption" color="textSecondary" scheme={scheme}>
          Current margin: April Spendings
        </Typos>
        <View style={styles.marginInfo}>
          <Typos variant="caption" color="primary" scheme={scheme} style={styles.valueText}>
            $350.00
          </Typos>
          <Typos variant="caption" color="textTertiary" scheme={scheme} style={styles.separator}>
             / 
          </Typos>
          <Typos variant="caption" color="textTertiary" scheme={scheme}>
            $640.00
          </Typos>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    width: 32,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barForeground: {
    width: '100%',
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marginInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontWeight: '700',
  },
  separator: {
    marginHorizontal: 4,
  },
});
