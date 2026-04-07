import * as Crypto from 'expo-crypto';
import { getDatabase } from './client';
import { ExpenseRecord } from '../types';

/**
 * Repository for managing transactions, expenses, and income in SQLite.
 */
export class TransactionRepository {
  /**
   * Save a new transaction as an atomic insert.
   */
  static async addTransaction(
    userId: string,
    type: 'income' | 'expense',
    category: string,
    amount: number,
    note?: string
  ): Promise<ExpenseRecord> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    const now = Date.now();

    const tx: ExpenseRecord = {
      id,
      category,
      amount,
      description: note || '',
      trend: type === 'income' ? 'increment' : 'decrement',
      timestamp: now,
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
      remote_id: null,
    };

    await db.runAsync(
      `INSERT INTO transactions (id, user_id, type, amount, category, note, timestamp, created_at, updated_at, sync_status, remote_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        tx.id,
        userId,
        type,
        tx.amount,
        tx.category,
        tx.description,
        tx.timestamp,
        tx.created_at,
        tx.updated_at,
        tx.sync_status,
        tx.remote_id,
      ]
    );

    return tx;
  }

  /**
   * Fetch transaction history for a specific user.
   */
  static async getHistory(userId: string, limit = 50): Promise<ExpenseRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT id, type, amount, category, note, timestamp, created_at, updated_at, sync_status, remote_id FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?;',
      [userId, limit]
    );

    return rows.map((row: any) => ({
      id: row.id,
      category: row.category,
      amount: row.amount,
      description: row.note,
      trend: row.type === 'income' ? 'increment' : 'decrement',
      timestamp: row.timestamp,
      created_at: row.created_at,
      updated_at: row.updated_at,
      sync_status: row.sync_status,
      remote_id: row.remote_id,
    }));
  }

  /**
   * Calculate monthly totals (Income, Expenses, Balance).
   */
  static async getMonthlySummary(userId: string, monthYear: string): Promise<{ income: number; expense: number; balance: number }> {
    const db = await getDatabase();
    
    // We expect monthYear in format 'YYYY-MM'
    // For local SQLite performance, we calculate aggregation directly
    const result = await db.getAllAsync<{ type: string; total: number }>(
      `SELECT type, SUM(amount) as total 
       FROM transactions 
       WHERE user_id = ? AND strftime('%Y-%m', datetime(timestamp / 1000, 'unixepoch')) = ?
       GROUP BY type;`,
      [userId, monthYear]
    );

    const income = result.find(r => r.type === 'income')?.total || 0;
    const expense = result.find(r => r.type === 'expense')?.total || 0;

    return {
      income,
      expense,
      balance: income - expense,
    };
  }
}
