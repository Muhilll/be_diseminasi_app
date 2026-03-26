import { db } from "../../../db";
import { roles } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class RoleModel {
  // Get all roles
  static async getAllRoles() {
    try {
      const result = await db.select().from(roles);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch roles: ${error}`);
    }
  }

  // Get role by ID
  static async getRoleById(id: number) {
    try {
      const result = await db
        .select()
        .from(roles)
        .where(eq(roles.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch role: ${error}`);
    }
  }

  // Get role by code
  static async getRoleByCode(code: string) {
    try {
      const result = await db
        .select()
        .from(roles)
        .where(eq(roles.code, code))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch role: ${error}`);
    }
  }

  // Create role
  static async createRole(data: {
    code: string;
    name: string;
  }) {
    try {
      const result = await db.insert(roles).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create role: ${error}`);
    }
  }

  // Update role
  static async updateRole(
    id: number,
    data: Partial<{
      code: string;
      name: string;
    }>
  ) {
    try {
      const result = await db
        .update(roles)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(roles.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update role: ${error}`);
    }
  }

  // Delete role
  static async deleteRole(id: number) {
    try {
      const result = await db.delete(roles).where(eq(roles.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete role: ${error}`);
    }
  }
}
