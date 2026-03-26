import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class UserModel {
  // Get semua users
  static async getAllUsers() {
    try {
      const result = await db.select().from(users);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }

  // Get user by ID
  static async getUserById(id: number) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  // Get user by email
  static async getUserByEmail(email: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  // Create user baru
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    employee_id?: string;
    grade_id: number;
    position_id: number;
    role_id: number;
    signature_image?: string;
  }) {
    try {
      const result = await db.insert(users).values({
        ...userData,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  // Update user
  static async updateUser(
    id: number,
    userData: Partial<{
      email: string;
      password: string;
      name: string;
      employee_id: string;
      grade_id: number;
      position_id: number;
      role_id: number;
      signature_image: string;
    }>
  ) {
    try {
      const result = await db
        .update(users)
        .set({
          ...userData,
          updated_at: new Date(),
        })
        .where(eq(users.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  // Delete user
  static async deleteUser(id: number) {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }
}
