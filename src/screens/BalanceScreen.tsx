import { StyleSheet, Text, View, ScrollView } from 'react-native';

export const BalanceScreen: React.FC = () => (
  <View style={styles.screen}>
    <View style={styles.balanceHeader}>
      <Text style={styles.balanceLabel}>Current Balance</Text>
      <Text style={styles.balanceAmount}>$12,740.50</Text>
    </View>

    <View style={styles.chartPlaceholder}>
      <View style={[styles.bar, { height: '60%' }]} />
      <View style={[styles.bar, { height: '80%' }]} />
      <View style={[styles.bar, { height: '40%' }]} />
      <View style={[styles.bar, { height: '90%' }]} />
      <View style={[styles.bar, { height: '70%' }]} />
    </View>

    <View style={styles.transactionList}>
      <Text style={styles.sectionHeader}>Recent Transactions</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {[
          { name: 'Apple Store', price: '-$1,299.00', date: 'Today' },
          { name: 'Spotify Premium', price: '-$9.99', date: 'Yesterday' },
          { name: 'Stripe Payout', price: '+$3,400.00', date: 'Oct 12' },
          { name: 'Starbucks', price: '-$5.50', date: 'Oct 11' },
        ].map((item, index) => (
          <View key={index} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionName}>{item.name}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
            </View>
            <Text style={[styles.transactionValue, { color: item.price.startsWith('+') ? '#10b981' : '#f8fafc' }]}>
              {item.price}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 24,
  },
  balanceHeader: {
    paddingTop: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: -1,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    height: 100,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  bar: {
    width: 35,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  transactionList: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  transactionName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  transactionValue: {
    fontSize: 17,
    fontWeight: '800',
  },
});
