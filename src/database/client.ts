import * as SQLite from 'expo-sqlite';

/**
 * Global database name for the Finance Manager.
 */
const DATABASE_NAME = 'payu_finance.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database connection with custom PRAGMAs for performance and integrity.
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  
  dbInstance = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  // Enable Write-Ahead Logging (WAL) and Foreign Keys
  await dbInstance.execAsync('PRAGMA journal_mode = WAL;');
  await dbInstance.execAsync('PRAGMA foreign_keys = ON;');
  
  return dbInstance;
};

/**
 * Run schema initialization to ensure all tables and indexes are present.
 * Uses 'IF NOT EXISTS' for idempotency, ensuring the database is correctly
 * configured on every startup without the need for version tracking.
 */
export const initMigrations = async (): Promise<void> => {
  const db = await getDatabase();
  
  await db.withTransactionAsync(async () => {
    // ── Users ──────────────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 0,
        totalSpendings REAL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // ── Transactions ───────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        note TEXT,
        merchant TEXT,
        payment_method TEXT DEFAULT 'cash',
        timestamp INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ── Categories ─────────────────────────────────────────────────────────
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // ── Indexes for high-performance reporting ────────────────────────────
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_user_ts ON transactions(user_id, timestamp DESC);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category);');
    await db.execAsync('CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);');
  });

  console.log('Database schema synchronized successfully.');
};
