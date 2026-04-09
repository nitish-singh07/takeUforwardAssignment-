/**
 * Base properties for any entity stored in the database.
 */
export interface BaseEntity {
  id: string;
  created_at: number;
  updated_at: number;
}

/**
 * User Profile information.
 */
export interface UserProfile extends BaseEntity {
  fullName: string;
  email: string;
  balance: number;
  totalSpendings: number;
}

/**
 * Expense or Transaction record.
 */
export interface ExpenseRecord extends BaseEntity {
  category: string;
  amount: number;
  description: string;    // note / tag
  merchant?: string;      // "Paid to" payee name
  payment_method?: string; // 'cash' | 'upi' | 'card' | 'bank'
  trend: 'increment' | 'decrement';
  timestamp: number;
}

/**
 * Representing a physical or digital card.
 */
export interface CardInfo {
  bankName: string;
  cardNumber: string;
  cardHolderName: string;
  expiredDate: string;
}

/**
 * Navigation route params definition.
 */
export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Balances: undefined;
  Profile: undefined;
  Search: undefined;
  AddTransaction: { transaction?: ExpenseRecord };
  TransactionDetails: { transaction: ExpenseRecord };
  History: undefined;
};
