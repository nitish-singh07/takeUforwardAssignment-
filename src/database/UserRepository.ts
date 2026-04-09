import * as Crypto from 'expo-crypto';
import { getDatabase } from './client';
import { UserProfile } from '../types';

/**
 * Repository for managing offline-first user data in SQLite.
 */
export class UserRepository {
  /**
   * Securely hash a password before storage using SHA-256.
   */
  private static async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
  }

  /**
   * Create a new user in the local database.
   */
  static async createUser(
    fullName: string,
    email: string,
    passwordPlain: string
  ): Promise<UserProfile> {
    const db = await getDatabase();
    
    // Check if email already exists before creation
    const existingUser = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM users WHERE email = ?;',
      [email]
    );
    if (existingUser) {
      throw new Error('EMAIL_EXISTS');
    }

    const id = Crypto.randomUUID();
    const passwordHash = await this.hashPassword(passwordPlain);
    const now = Date.now();

    const user: UserProfile = {
      id,
      fullName,
      email,
      balance: 0,
      totalSpendings: 0,
      created_at: now,
      updated_at: now,
    };

    await db.runAsync(
      `INSERT INTO users (id, fullName, email, password, balance, totalSpendings, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        user.id,
        user.fullName,
        user.email,
        passwordHash,
        user.balance,
        user.totalSpendings,
        user.created_at,
        user.updated_at,
      ]
    );

    return user;
  }

  /**
   * Find a user by email and verify password for local login.
   */
  static async authenticate(email: string, passwordPlain: string): Promise<UserProfile> {
    const db = await getDatabase();
    
    // Check if email exists at all first
    const userResult = await db.getFirstAsync<UserProfile & { password?: string }>(
      'SELECT * FROM users WHERE email = ?;',
      [email]
    );

    if (!userResult) {
      throw new Error('USER_NOT_FOUND');
    }

    const passwordHash = await this.hashPassword(passwordPlain);
    if (userResult.password !== passwordHash) {
      throw new Error('INVALID_PASSWORD');
    }

    // Remove sensitive data before returning
    const { password: _, ...profile } = userResult;
    return profile;
  }

  /**
   * Fetch current user profile from database.
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const db = await getDatabase();
    return await db.getFirstAsync<UserProfile>('SELECT * FROM users WHERE id = ?;', [userId]);
  }

  /**
   * Update user balance information.
   */
  static async updateMetrics(userId: string, balance: number, totalSpendings: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE users SET balance = ?, totalSpendings = ?, updated_at = ? WHERE id = ?;',
      [balance, totalSpendings, Date.now(), userId]
    );
  }

  /**
   * Update user profile (name and email).
   */
  static async updateProfile(userId: string, fullName: string, email: string): Promise<UserProfile> {
    const db = await getDatabase();

    // Check if the new email is taken by a different user
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM users WHERE email = ? AND id != ?;',
      [email, userId]
    );
    if (existing) throw new Error('EMAIL_EXISTS');

    await db.runAsync(
      'UPDATE users SET fullName = ?, email = ?, updated_at = ? WHERE id = ?;',
      [fullName, email, Date.now(), userId]
    );

    const updated = await db.getFirstAsync<UserProfile>('SELECT * FROM users WHERE id = ?;', [userId]);
    if (!updated) throw new Error('USER_NOT_FOUND');
    return updated;
  }

  /**
   * Permanently delete a user account and all associated transactions.
   */
  static async deleteAccount(userId: string): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM transactions WHERE user_id = ?;', [userId]);
      await db.runAsync('DELETE FROM users WHERE id = ?;', [userId]);
    });
  }
}

