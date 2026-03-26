import { db } from "../../../db";
import { role_permissions } from "../../../db/schema";
import { eq } from "drizzle-orm";

export class RolePermissionModel {
  // Get all role permissions
  static async getAllRolePermissions() {
    try {
      const result = await db.select().from(role_permissions);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch role permissions: ${error}`);
    }
  }

  // Get role permission by ID
  static async getRolePermissionById(id: number) {
    try {
      const result = await db
        .select()
        .from(role_permissions)
        .where(eq(role_permissions.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch role permission: ${error}`);
    }
  }

  // Get permissions by role ID
  static async getPermissionsByRoleId(roleId: number) {
    try {
      const result = await db
        .select()
        .from(role_permissions)
        .where(eq(role_permissions.role_id, roleId));
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch role permissions: ${error}`);
    }
  }

  // Create role permission
  static async createRolePermission(data: {
    role_id: number;
    menu_id: number;
    can_read?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
    can_report?: boolean;
  }) {
    try {
      const result = await db.insert(role_permissions).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create role permission: ${error}`);
    }
  }

  // Update role permission
  static async updateRolePermission(
    id: number,
    data: Partial<{
      role_id: number;
      menu_id: number;
      can_read: boolean;
      can_create: boolean;
      can_update: boolean;
      can_delete: boolean;
      can_report: boolean;
    }>
  ) {
    try {
      const result = await db
        .update(role_permissions)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(role_permissions.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update role permission: ${error}`);
    }
  }

  // Delete role permission
  static async deleteRolePermission(id: number) {
    try {
      const result = await db
        .delete(role_permissions)
        .where(eq(role_permissions.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete role permission: ${error}`);
    }
  }
}
