import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, Radii } from '../../constants/theme';
import { Typography } from '../common/Typography';
import { useTheme } from '../../context/ThemeContext';

export interface CustomRange { from: Date; to: Date }

interface DateRangeModalProps {
  visible: boolean;
  initial: CustomRange;
  onApply: (range: CustomRange) => void;
  onCancel: () => void;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  visible, initial, onApply, onCancel,
}) => {
  const { colors } = useTheme();

  const [from,         setFrom]         = useState<Date>(initial.from);
  const [to,           setTo]           = useState<Date>(initial.to);
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    if (visible) { setFrom(initial.from); setTo(initial.to); setActivePicker(null); }
  }, [visible]);

  const handleFromChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setActivePicker(null);
    if (!date) return;
    setFrom(date);
    if (date > to) setTo(date);
  };

  const handleToChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setActivePicker(null);
    if (!date) return;
    setTo(date < from ? from : date);
  };

  const canApply = from <= to;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View />
      </Pressable>

      <View style={[styles.sheet, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        <View style={styles.header}>
          <Typography variant="heading3">Custom Date Range</Typography>
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Typography variant="caption" style={{ color: colors.textTertiary, paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl }}>
          Select a start and end date to filter your transactions.
        </Typography>

        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: colors.backgroundTertiary, borderColor: activePicker === 'from' ? colors.text : colors.border }]}
          onPress={() => setActivePicker(activePicker === 'from' ? null : 'from')}
          activeOpacity={0.8}
        >
          <View style={[styles.dateDot, { backgroundColor: '#10b981' }]} />
          <View style={styles.dateLabelBlock}>
            <Typography variant="caption" style={{ color: colors.textTertiary, letterSpacing: 0.5 }}>
              START DATE
            </Typography>
            <Typography variant="bodySemiBold">{fmtDate(from)}</Typography>
          </View>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.connector}>
          <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
          <View style={[styles.connectorDot, { backgroundColor: colors.border }]}>
            <Ionicons name="arrow-down" size={12} color={colors.textTertiary} />
          </View>
          <View style={[styles.connectorLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: colors.backgroundTertiary, borderColor: activePicker === 'to' ? colors.text : colors.border }]}
          onPress={() => setActivePicker(activePicker === 'to' ? null : 'to')}
          activeOpacity={0.8}
        >
          <View style={[styles.dateDot, { backgroundColor: '#ef4444' }]} />
          <View style={styles.dateLabelBlock}>
            <Typography variant="caption" style={{ color: colors.textTertiary, letterSpacing: 0.5 }}>
              END DATE
            </Typography>
            <Typography variant="bodySemiBold">{fmtDate(to)}</Typography>
          </View>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {canApply && (
          <View style={[styles.rangePill, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
            <Typography variant="caption" style={{ color: colors.textTertiary, marginLeft: 6 }}>
              {from.toDateString() === to.toDateString()
                ? fmtDate(from)
                : `${fmtDate(from)}  →  ${fmtDate(to)}`}
            </Typography>
          </View>
        )}

        {activePicker === 'from' && (
          <DateTimePicker
            value={from}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleFromChange}
            style={styles.picker}
          />
        )}
        {activePicker === 'to' && (
          <DateTimePicker
            value={to}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={from}
            maximumDate={new Date()}
            onChange={handleToChange}
            style={styles.picker}
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Typography variant="bodySemiBold" style={{ color: colors.textSecondary }}>Cancel</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyBtn, !canApply && { opacity: 0.4 }]}
            onPress={() => { if (canApply) onApply({ from, to }); }}
            activeOpacity={0.8}
            disabled={!canApply}
          >
            <LinearGradient
              colors={['#3BB9A1', '#2a8a77']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.applyGrad}
            >
              <Typography variant="bodySemiBold" style={{ color: '#fff' }}>Apply Filter</Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position:      'absolute',
    bottom:        0,
    left:          0,
    right:         0,
    borderTopLeftRadius:  Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    paddingBottom: 40,
  },
  handle: {
    width:        40,
    height:       4,
    borderRadius: 2,
    alignSelf:    'center',
    marginTop:    12,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingHorizontal: Spacing.xl,
    marginBottom:   Spacing.sm,
  },
  dateRow: {
    flexDirection:  'row',
    alignItems:     'center',
    marginHorizontal: Spacing.xl,
    borderRadius:   Radii.xl,
    borderWidth:    1.5,
    padding:        Spacing.lg,
    gap:            Spacing.md,
  },
  dateDot: {
    width:        10,
    height:       10,
    borderRadius: 5,
  },
  dateLabelBlock: {
    flex: 1,
    gap:  2,
  },
  connector: {
    flexDirection:  'row',
    alignItems:     'center',
    marginHorizontal: Spacing.xl + 22,
    marginVertical:   Spacing.xs,
  },
  connectorLine: {
    flex:   1,
    height: 1,
  },
  connectorDot: {
    width:          22,
    height:         22,
    borderRadius:   11,
    justifyContent: 'center',
    alignItems:     'center',
  },
  rangePill: {
    flexDirection:     'row',
    alignItems:        'center',
    alignSelf:         'center',
    marginTop:         Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.xs + 2,
    borderRadius:      Radii.full,
    borderWidth:       1,
  },
  picker: {
    marginHorizontal: Spacing.xl,
    marginTop:        Spacing.md,
  },
  actions: {
    flexDirection:  'row',
    gap:            Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginTop:      Spacing.xl,
  },
  cancelBtn: {
    flex:            1,
    height:          52,
    borderRadius:    Radii.xl,
    borderWidth:     1,
    justifyContent:  'center',
    alignItems:      'center',
  },
  applyBtn: {
    flex:         2,
    borderRadius: Radii.xl,
    overflow:     'hidden',
  },
  applyGrad: {
    height:         52,
    justifyContent: 'center',
    alignItems:     'center',
  },
});
