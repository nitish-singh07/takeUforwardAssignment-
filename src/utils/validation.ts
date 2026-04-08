import { z } from 'zod';

/**
 * Validation schema for user registration.
 */
export const SignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

/**
 * Validation schema for user login.
 */
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * Validation schema for financial transactions (Income/Expense).
 */
export const TransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0.'),
  category: z.string().min(1, 'Please select a category.'),
  note: z.string().max(100, 'Note must be less than 100 characters.').optional().or(z.literal('')),
});

// Infer types from schemas
export type SignupData = z.infer<typeof SignupSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type TransactionData = z.infer<typeof TransactionSchema>;
