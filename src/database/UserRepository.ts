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
      sync_status: 'pending',
      remote_id: null,
    };

    await db.runAsync(
      `INSERT INTO users (id, fullName, email, password, balance, totalSpendings, created_at, updated_at, sync_status, remote_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        user.id,
        user.fullName,
        user.email,
        passwordHash,
        user.balance,
        user.totalSpendings,
        user.created_at,
        user.updated_at,
        user.sync_status,
        user.remote_id,
      ]
    );

    return user;
  }

  /**
   * Find a user by email and verify password for local login.
   */
  static async authenticate(email: string, passwordPlain: string): Promise<UserProfile | null> {
    const db = await getDatabase();
    const passwordHash = await this.hashPassword(passwordPlain);

    const user = await db.getFirstAsync<UserProfile & { password?: string }>(
      'SELECT * FROM users WHERE email = ? AND password = ?;',
      [email, passwordHash]
    );

    if (!user) return null;

    // Remove sensitive data before returning
    const { password: _, ...profile } = user;
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
}
