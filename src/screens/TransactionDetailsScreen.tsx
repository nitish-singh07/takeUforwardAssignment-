import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Spacing, Radii } from '../constants/theme';
import { Typography } from '../components/common/Typography';
import { useTheme } from '../context/ThemeContext';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types';
import { formatCurrency } from '../utils/currency';
import { getCategoryConfig } from '../utils/categoryConfig';
import * as Haptics from 'expo-haptics';

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;

export const TransactionDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TransactionDetailsRouteProp>();
  const { transaction: initialTransaction } = route.params;
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { deleteTransaction, transactions } = useFinanceStore();

  // Find the 'live' transaction from the store to ensure we reflect updates immediately
  const transaction = transactions.find(t => t.id === initialTransaction.id) || initialTransaction;

  const config = getCategoryConfig(transaction.category);
  const isIncome = transaction.trend === 'increment';
  const amountColor = isIncome ? colors.success : colors.error;

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('default', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to permanently delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              const success = await deleteTransaction(transaction.id, user.id);
              if (success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                navigation.goBack();
              }
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate('AddTransaction', { transaction });
  };

  const InfoRow = ({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) => (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: colors.backgroundTertiary }]}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.infoContent}>
        <Typography variant="caption" style={{ color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body" style={{ color: colors.text, marginTop: 2 }}>
          {value}
        </Typography>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.backgroundSecondary }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Typography variant="heading3">Details</Typography>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <View style={[styles.catIconContainer, { backgroundColor: config.color + '22' }]}>
            <Ionicons name={config.icon} size={32} color={config.color} />
          </View>
          <Typography variant="caption" style={{ color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.lg }}>
            {transaction.category}
          </Typography>
          <Typography style={StyleSheet.flatten([styles.amountText, { color: amountColor }])}>
            {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
          </Typography>
          <Typography variant="bodySmall" style={{ color: colors.textTertiary }}>
            {formatDate(transaction.timestamp)}
          </Typography>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Typography variant="label" style={{ color: colors.textTertiary, marginBottom: Spacing.md }}>
            TRANSACTION INFO
          </Typography>
          
          <View style={[styles.detailsCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <InfoRow 
              label="Paid to" 
              value={transaction.merchant || 'Unknown'} 
              icon="business-outline" 
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow 
              label="Note" 
              value={transaction.description || 'No notes added'} 
              icon="document-text-outline" 
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InfoRow 
              label="Payment Method" 
              value={transaction.payment_method?.toUpperCase() || 'CASH'} 
              icon="card-outline" 
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color={colors.text} />
            <Typography variant="bodySemiBold" style={{ marginLeft: 8 }}>Edit Transaction</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary, borderColor: colors.error + '22' }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Typography variant="bodySemiBold" style={{ marginLeft: 8, color: colors.error }}>Delete Permanent</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing['2xl'],
  },
  amountCard: {
    alignItems: 'center',
    padding: Spacing['2xl'],
    borderRadius: Radii['2xl'],
    borderWidth: 1,
  },
  catIconContainer: {
    width: 72,
    height: 72,
    borderRadius: Radii.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 42,
    fontWeight: '900',
    marginVertical: Spacing.sm,
    lineHeight: 52,
    includeFontPadding: false,
  },
  section: {
    marginTop: Spacing.md,
  },
  detailsCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: Radii.xl,
    borderWidth: 1,
  },
});
