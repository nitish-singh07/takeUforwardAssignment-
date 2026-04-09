import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import { getDatabase } from './client';
import { ExpenseRecord } from '../types';

/**
 * Repository for managing transactions, expenses, and income in SQLite.
 */
export class TransactionRepository {
  static async addTransaction(
    userId:          string,
    type:            'income' | 'expense',
    category:        string,
    amount:          number,
    note?:           string,
    timestamp?:      number,
    merchant?:       string,
    payment_method?: string
  ): Promise<ExpenseRecord> {
    const db  = await getDatabase();
    const id  = Crypto.randomUUID();
    const now = Date.now();
    const ts  = timestamp ?? now;
    const pm  = payment_method ?? 'cash';

    const tx: ExpenseRecord = {
      id,
      category,
      amount,
      description:    note || '',
      merchant:       merchant || undefined,
      payment_method: pm,
      trend:          type === 'income' ? 'increment' : 'decrement',
      timestamp:      ts,
      created_at:     now,
      updated_at:     now,
    };

    await db.runAsync(
      `INSERT INTO transactions
         (id, user_id, type, amount, category, note, timestamp, created_at, updated_at,
          merchant, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [tx.id, userId, type, tx.amount, tx.category, tx.description,
       tx.timestamp, tx.created_at, tx.updated_at,
       tx.merchant ?? null, pm]
    );

    return tx;
  }


  /**
   * Helper to map a raw database row to an ExpenseRecord object.
   */
  private static mapRowToExpenseRecord(row: any): ExpenseRecord {
    return {
      id:             row.id,
      category:       row.category,
      amount:         row.amount,
      description:    row.note,
      merchant:       row.merchant || undefined,
      payment_method: row.payment_method || 'cash',
      trend:          row.type === 'income' ? 'increment' : 'decrement',
      timestamp:      row.timestamp,
      created_at:     row.created_at,
      updated_at:     row.updated_at,
    };
  }

  /**
   * Full-featured search with optional filters:
   *   - query  : matches category OR note (case-insensitive)
   *   - type   : 'income' | 'expense'
   *   - category: exact name
   *   - fromDate / toDate: Unix ms range
   */
  static async searchTransactions(
    userId:    string,
    query?:    string,
    type?:     'income' | 'expense',
    category?: string,
    fromDate?: number,
    toDate?:   number,
    limit:     number = 200
  ): Promise<ExpenseRecord[]> {
    const db = await getDatabase();

    const conditions: string[] = ['user_id = ?'];
    const params: (string | number)[] = [userId];

    if (query && query.trim()) {
      conditions.push('(LOWER(category) LIKE ? OR LOWER(note) LIKE ?)');
      const q = `%${query.trim().toLowerCase()}%`;
      params.push(q, q);
    }
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (fromDate !== undefined) {
      conditions.push('timestamp >= ?');
      params.push(fromDate);
    }
    if (toDate !== undefined) {
      conditions.push('timestamp <= ?');
      params.push(toDate);
    }

    params.push(limit);

    const rows = await db.getAllAsync<any>(
      `SELECT * FROM transactions
       WHERE ${conditions.join(' AND ')}
       ORDER BY timestamp DESC
       LIMIT ?;`,
      params
    );

    return rows.map(this.mapRowToExpenseRecord);
  }

  /**
   * Fetch transaction history for a specific user.
   */
  static async getHistory(userId: string, limit = 50): Promise<ExpenseRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?;',
      [userId, limit]
    );

    return rows.map(this.mapRowToExpenseRecord);
  }

  /**
   * Internal helper to fetch income/expense/balance summaries for a given query.
   */
  private static async fetchSummary(
    db: SQLite.SQLiteDatabase,
    sql: string,
    params: any[]
  ): Promise<{ income: number; expense: number; balance: number }> {
    const rows = await db.getAllAsync<{ type: string; total: number }>(sql, params);
    const income  = rows.find((r: { type: string }) => r.type === 'income')?.total  ?? 0;
    const expense = rows.find((r: { type: string }) => r.type === 'expense')?.total ?? 0;
    return { income, expense, balance: income - expense };
  }

  /**
   * Calculate monthly totals (Income, Expenses, Balance).
   */
  static async getMonthlySummary(userId: string, monthYear: string): Promise<{ income: number; expense: number; balance: number }> {
    const db = await getDatabase();
    return this.fetchSummary(
      db,
      `SELECT type, SUM(amount) as total 
       FROM transactions 
       WHERE user_id = ? AND strftime('%Y-%m', datetime(timestamp / 1000, 'unixepoch')) = ?
       GROUP BY type;`,
      [userId, monthYear]
    );
  }

  /**
   * Update an existing transaction with full field support.
   */
  static async updateTransaction(
    id:             string,
    amount:         number,
    category:       string,
    note:           string,
    type:           'income' | 'expense',
    merchant?:      string,
    payment_method?: string,
    timestamp?:     number
  ): Promise<void> {
    const db = await getDatabase();
    const now = Date.now();
    await db.runAsync(
      `UPDATE transactions 
       SET amount = ?, category = ?, note = ?, type = ?, merchant = ?, payment_method = ?, timestamp = ?, updated_at = ? 
       WHERE id = ?;`,
      [amount, category, note, type, merchant ?? null, payment_method ?? 'cash', timestamp ?? now, now, id]
    );
  }

  /**
   * Delete a transaction.
   */
  static async deleteTransaction(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
  }

  /**
   * Get real spending data for the current week (Mon–Sun), broken down by day.
   * Returns an array of 7 items — one per day of the week.
   */
  static async getWeeklySpending(userId: string): Promise<
    { label: string; income: number; expense: number }[]
  > {
    const db = await getDatabase();

    // SQLite strftime %w: 0=Sunday, 1=Monday ... 6=Saturday
    const rows = await db.getAllAsync<{ dow: string; type: string; total: number }>(
      `SELECT
         strftime('%w', datetime(timestamp / 1000, 'unixepoch')) AS dow,
         type,
         SUM(amount) AS total
       FROM transactions
       WHERE user_id = ?
         AND timestamp >= strftime('%s', 'now', 'weekday 0', '-6 days') * 1000
       GROUP BY dow, type;`,
      [userId]
    );

    // Build a full 7-day map keyed by JS day (0=Sun, 1=Mon, ...)
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map: Record<string, { income: number; expense: number }> = {};
    DAY_LABELS.forEach((_, i) => {
      map[String(i)] = { income: 0, expense: 0 };
    });

    rows.forEach(row => {
      if (!map[row.dow]) return;
      if (row.type === 'income')  map[row.dow].income  = row.total;
      if (row.type === 'expense') map[row.dow].expense = row.total;
    });

    return DAY_LABELS.map((label, i) => ({
      label,
      income:  map[String(i)].income,
      expense: map[String(i)].expense,
    }));
  }

  /**
   * Compute total income and expense for a user via SQL SUM.
   * Avoids loading all rows into JS memory.
   */
  static async getUserMetrics(
    userId: string
  ): Promise<{ income: number; expense: number }> {
    const db = await getDatabase();
    return this.fetchSummary(
      db,
      `SELECT type, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ?
       GROUP BY type;`,
      [userId]
    );
  }

  /**
   * Group current month's transactions by week (W1–W4).
   * Used for the "Monthly" view on the Analytics screen.
   *
   * W1 = days  1-7
   * W2 = days  8-14
   * W3 = days 15-21
   * W4 = days 22-end
   */
  static async getMonthlyWeekData(userId: string): Promise<
    { label: string; income: number; expense: number }[]
  > {
    const db  = await getDatabase();
    const now = new Date();
    // Start of current month (midnight, ms)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    // Start of next month
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

    const rows = await db.getAllAsync<{ day: number; type: string; total: number }>(
      `SELECT
         CAST(strftime('%d', datetime(timestamp / 1000, 'unixepoch')) AS INTEGER) AS day,
         type,
         SUM(amount) AS total
       FROM transactions
       WHERE user_id = ?
         AND timestamp >= ?
         AND timestamp <  ?
       GROUP BY day, type;`,
      [userId, monthStart, monthEnd]
    );

    // Initialise 4 week buckets
    const weeks = [
      { label: 'Wk 1', income: 0, expense: 0 },
      { label: 'Wk 2', income: 0, expense: 0 },
      { label: 'Wk 3', income: 0, expense: 0 },
      { label: 'Wk 4', income: 0, expense: 0 },
    ];

    rows.forEach(row => {
      const weekIdx =
        row.day <= 7  ? 0 :
        row.day <= 14 ? 1 :
        row.day <= 21 ? 2 : 3;
      if (row.type === 'income')  weeks[weekIdx].income  += row.total;
      if (row.type === 'expense') weeks[weekIdx].expense += row.total;
    });

    return weeks;
  }

  /**
   * Get income and expense totals for an arbitrary time range (ms timestamps).
   * Used to compute the health score for whichever period the user selected.
   */
  static async getPeriodStats(
    userId:   string,
    fromDate: number,
    toDate:   number
  ): Promise<{ income: number; expense: number; balance: number }> {
    const db   = await getDatabase();
    return this.fetchSummary(
      db,
      `SELECT type, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ?
         AND timestamp >= ?
         AND timestamp <= ?
       GROUP BY type;`,
      [userId, fromDate, toDate]
    );
  }
}

