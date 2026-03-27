import { db } from "../../../db";
import { menus, role_permissions, roles } from "../../../db/schema";
import { eq } from "drizzle-orm";

type RolePermissionWithRelationsRow = {
  id: number;
  role_id: number;
  menu_id: number;
  can_read: boolean | null;
  can_create: boolean | null;
  can_update: boolean | null;
  can_delete: boolean | null;
  can_report: boolean | null;
  created_at: Date;
  updated_at: Date;
  role_ref_id: number;
  role_code: string;
  role_name: string;
  menu_ref_id: number;
  menu_name: string;
  menu_path: string;
  menu_icon: string | null;
  menu_parent_id: number | null;
};

type PublicRolePermission = {
  id: number;
  role_id: number;
  menu_id: number;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_report: boolean;
  created_at: Date;
  updated_at: Date;
  role: {
    id: number;
    code: string;
    name: string;
  };
  menu: {
    id: number;
    name: string;
    path: string;
    icon: string | null;
    parent_id: number | null;
  };
};

export class RolePermissionModel {
  private static mapRolePermission(
    rolePermission: RolePermissionWithRelationsRow,
  ): PublicRolePermission {
    return {
      id: rolePermission.id,
      role_id: rolePermission.role_id,
      menu_id: rolePermission.menu_id,
      can_read: Boolean(rolePermission.can_read),
      can_create: Boolean(rolePermission.can_create),
      can_update: Boolean(rolePermission.can_update),
      can_delete: Boolean(rolePermission.can_delete),
      can_report: Boolean(rolePermission.can_report),
      created_at: rolePermission.created_at,
      updated_at: rolePermission.updated_at,
      role: {
        id: rolePermission.role_ref_id,
        code: rolePermission.role_code,
        name: rolePermission.role_name,
      },
      menu: {
        id: rolePermission.menu_ref_id,
        name: rolePermission.menu_name,
        path: rolePermission.menu_path,
        icon: rolePermission.menu_icon,
        parent_id: rolePermission.menu_parent_id,
      },
    };
  }

  // Get all role permissions
  static async getAllRolePermissions() {
    try {
      const result = await db
        .select({
          id: role_permissions.id,
          role_id: role_permissions.role_id,
          menu_id: role_permissions.menu_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
          created_at: role_permissions.created_at,
          updated_at: role_permissions.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          menu_ref_id: menus.id,
          menu_name: menus.name,
          menu_path: menus.path,
          menu_icon: menus.icon,
          menu_parent_id: menus.parent_id,
        })
        .from(role_permissions)
        .innerJoin(roles, eq(role_permissions.role_id, roles.id))
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id));

      return result.map((item) => this.mapRolePermission(item));
    } catch (error) {
      throw new Error(`Failed to fetch role permissions: ${error}`);
    }
  }

  // Get role permission by ID
  static async getRolePermissionById(id: number) {
    try {
      const result = await db
        .select({
          id: role_permissions.id,
          role_id: role_permissions.role_id,
          menu_id: role_permissions.menu_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
          created_at: role_permissions.created_at,
          updated_at: role_permissions.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          menu_ref_id: menus.id,
          menu_name: menus.name,
          menu_path: menus.path,
          menu_icon: menus.icon,
          menu_parent_id: menus.parent_id,
        })
        .from(role_permissions)
        .innerJoin(roles, eq(role_permissions.role_id, roles.id))
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(eq(role_permissions.id, id))
        .limit(1);

      return result[0] ? this.mapRolePermission(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch role permission: ${error}`);
    }
  }

  // Get permissions by role ID
  static async getPermissionsByRoleId(roleId: number) {
    try {
      const result = await db
        .select({
          id: role_permissions.id,
          role_id: role_permissions.role_id,
          menu_id: role_permissions.menu_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
          created_at: role_permissions.created_at,
          updated_at: role_permissions.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          menu_ref_id: menus.id,
          menu_name: menus.name,
          menu_path: menus.path,
          menu_icon: menus.icon,
          menu_parent_id: menus.parent_id,
        })
        .from(role_permissions)
        .innerJoin(roles, eq(role_permissions.role_id, roles.id))
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(eq(role_permissions.role_id, roleId));

      return result.map((item) => this.mapRolePermission(item));
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
