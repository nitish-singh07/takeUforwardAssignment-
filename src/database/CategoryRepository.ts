import { getDatabase } from './client';
import * as Crypto from 'expo-crypto';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  created_at: number;
}

/**
 * Repository for managing user-defined categories.
 */
export class CategoryRepository {
  /**
   * Create a new category for a user.
   */
  static async addCategory(
    userId: string,
    name: string,
    type: 'income' | 'expense',
    icon: string = 'apps-outline'
  ): Promise<Category> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    const now = Date.now();

    const category: Category = {
      id,
      user_id: userId,
      name,
      type,
      icon,
      created_at: now,
    };

    await db.runAsync(
      'INSERT INTO categories (id, user_id, name, type, icon, created_at) VALUES (?, ?, ?, ?, ?, ?);',
      [category.id, category.user_id, category.name, category.type, category.icon, category.created_at]
    );

    return category;
  }

  /**
   * Fetch all categories for a specific user.
   */
  static async getCategories(userId: string): Promise<Category[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY name ASC;',
      [userId]
    );
  }

  /**
   * Delete a category.
   */
  static async deleteCategory(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM categories WHERE id = ?;', [id]);
  }
}
