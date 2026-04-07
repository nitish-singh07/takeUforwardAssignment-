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
 * Run migrations to initialize or update the schema.
 */
export const initMigrations = async (): Promise<void> => {
  const db = await getDatabase();
  
  // 1. Create _migrations table if not exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY
    );
  `);

  // 2. Fetch current version
  const result = await db.getFirstAsync<{ version: number }>('SELECT MAX(version) as version FROM _migrations;');
  const currentVersion = result?.version || 0;

  // 3. Define Migration Steps
  if (currentVersion < 1) {
    // Version 1: Initial Schema
    await db.withTransactionAsync(async () => {
      // Users Table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          fullName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          balance REAL DEFAULT 0,
          totalSpendings REAL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          sync_status TEXT NOT NULL,
          remote_id TEXT
        );
      `);

      // Transactions Table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL, -- 'income' | 'expense'
          amount REAL NOT NULL,
          category TEXT NOT NULL,
          note TEXT,
          timestamp INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          sync_status TEXT NOT NULL,
          remote_id TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await db.execAsync('INSERT INTO _migrations (version) VALUES (1);');
    });
    console.log('Migration to version 1 complete.');
  }

  // Future migrations go here (if currentVersion < 2)
};
