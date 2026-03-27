import { db } from "../../../db";
import {
  grades,
  menus,
  positions,
  role_permissions,
  roles,
  users,
} from "../../../db/schema";
import { eq } from "drizzle-orm";

type NavigationPermission = {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_report: boolean;
};

type NavigationItem = {
  id: number;
  name: string;
  path: string;
  icon: string | null;
  parent_id: number | null;
  permissions: NavigationPermission;
  children: NavigationItem[];
};

type UserWithRelationsRow = {
  id: number;
  email: string;
  employee_id: string | null;
  name: string;
  grade_id: number;
  position_id: number;
  signature_image: string | null;
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role_ref_id: number;
  role_code: string;
  role_name: string;
  grade_ref_id: number;
  grade_level: number;
  grade_name: string;
  grade_des: string | null;
  position_ref_id: number;
  position_category: string;
  position_des: string | null;
};

type PublicUser = {
  id: number;
  email: string;
  employee_id: string | null;
  name: string;
  grade_id: number;
  position_id: number;
  signature_image: string | null;
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role: {
    id: number;
    code: string;
    name: string;
  };
  grade: {
    id: number;
    level: number;
    grade: string;
    des: string | null;
  };
  position: {
    id: number;
    category: string;
    des: string | null;
  };
};

export class UserModel {
  private static mapUserWithRelations(user: UserWithRelationsRow): PublicUser {
    return {
      id: user.id,
      email: user.email,
      employee_id: user.employee_id,
      name: user.name,
      grade_id: user.grade_id,
      position_id: user.position_id,
      signature_image: user.signature_image,
      role_id: user.role_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: {
        id: user.role_ref_id,
        code: user.role_code,
        name: user.role_name,
      },
      grade: {
        id: user.grade_ref_id,
        level: user.grade_level,
        grade: user.grade_name,
        des: user.grade_des,
      },
      position: {
        id: user.position_ref_id,
        category: user.position_category,
        des: user.position_des,
      },
    };
  }

  // Get semua users
  static async getAllUsers() {
    try {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          employee_id: users.employee_id,
          name: users.name,
          grade_id: users.grade_id,
          position_id: users.position_id,
          signature_image: users.signature_image,
          role_id: users.role_id,
          created_at: users.created_at,
          updated_at: users.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          grade_ref_id: grades.id,
          grade_level: grades.level,
          grade_name: grades.grade,
          grade_des: grades.des,
          position_ref_id: positions.id,
          position_category: positions.category,
          position_des: positions.des,
        })
        .from(users)
        .innerJoin(roles, eq(users.role_id, roles.id))
        .innerJoin(grades, eq(users.grade_id, grades.id))
        .innerJoin(positions, eq(users.position_id, positions.id));

      return result.map((user) => this.mapUserWithRelations(user));
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }

  // Get user by ID
  static async getUserById(id: number) {
    try {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          employee_id: users.employee_id,
          name: users.name,
          grade_id: users.grade_id,
          position_id: users.position_id,
          signature_image: users.signature_image,
          role_id: users.role_id,
          created_at: users.created_at,
          updated_at: users.updated_at,
          role_ref_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          grade_ref_id: grades.id,
          grade_level: grades.level,
          grade_name: grades.grade,
          grade_des: grades.des,
          position_ref_id: positions.id,
          position_category: positions.category,
          position_des: positions.des,
        })
        .from(users)
        .innerJoin(roles, eq(users.role_id, roles.id))
        .innerJoin(grades, eq(users.grade_id, grades.id))
        .innerJoin(positions, eq(users.position_id, positions.id))
        .where(eq(users.id, id))
        .limit(1);

      return result[0] ? this.mapUserWithRelations(result[0]) : null;
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

  // Get navigation menus by role ID
  static async getNavigationByRoleId(roleId: number) {
    try {
      const result = await db
        .select({
          id: menus.id,
          name: menus.name,
          path: menus.path,
          icon: menus.icon,
          parent_id: menus.parent_id,
          can_read: role_permissions.can_read,
          can_create: role_permissions.can_create,
          can_update: role_permissions.can_update,
          can_delete: role_permissions.can_delete,
          can_report: role_permissions.can_report,
        })
        .from(role_permissions)
        .innerJoin(menus, eq(role_permissions.menu_id, menus.id))
        .where(
          eq(role_permissions.role_id, roleId),
        );

      const accessibleMenus = result.filter((item) =>
        Boolean(
          item.can_read ||
            item.can_create ||
            item.can_update ||
            item.can_delete ||
            item.can_report,
        ),
      );

      if (accessibleMenus.length === 0) {
        return [];
      }

      const allMenus = await db.select().from(menus);
      const allMenuMap = new Map(allMenus.map((menu) => [menu.id, menu]));

      const navigationMap = new Map<number, NavigationItem>();

      const upsertMenu = (
        menu: {
          id: number;
          name: string;
          path: string;
          icon: string | null;
          parent_id: number | null;
        },
        permissions?: Partial<NavigationPermission>,
      ) => {
        const existing = navigationMap.get(menu.id);

        if (existing) {
          if (permissions) {
            existing.permissions = {
              can_read: existing.permissions.can_read || Boolean(permissions.can_read),
              can_create:
                existing.permissions.can_create || Boolean(permissions.can_create),
              can_update:
                existing.permissions.can_update || Boolean(permissions.can_update),
              can_delete:
                existing.permissions.can_delete || Boolean(permissions.can_delete),
              can_report:
                existing.permissions.can_report || Boolean(permissions.can_report),
            };
          }

          return existing;
        }

        const navigationItem: NavigationItem = {
          id: menu.id,
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          parent_id: menu.parent_id,
          permissions: {
            can_read: Boolean(permissions?.can_read),
            can_create: Boolean(permissions?.can_create),
            can_update: Boolean(permissions?.can_update),
            can_delete: Boolean(permissions?.can_delete),
            can_report: Boolean(permissions?.can_report),
          },
          children: [],
        };

        navigationMap.set(menu.id, navigationItem);
        return navigationItem;
      };

      for (const item of accessibleMenus) {
        upsertMenu(item, {
          can_read: item.can_read ?? false,
          can_create: item.can_create ?? false,
          can_update: item.can_update ?? false,
          can_delete: item.can_delete ?? false,
          can_report: item.can_report ?? false,
        });

        let currentParentId = item.parent_id;

        while (currentParentId !== null) {
          const parentMenu = allMenuMap.get(currentParentId);

          if (!parentMenu) {
            break;
          }

          upsertMenu(parentMenu);
          currentParentId = parentMenu.parent_id;
        }
      }

      const treeMap = new Map<number, NavigationItem>();
      const roots: NavigationItem[] = [];

      for (const item of navigationMap.values()) {
        treeMap.set(item.id, {
          ...item,
          children: [],
        });
      }

      for (const item of treeMap.values()) {
        if (item.parent_id !== null) {
          const parent = treeMap.get(item.parent_id);

          if (parent) {
            parent.children.push(item);
            continue;
          }
        }

        roots.push(item);
      }

      const sortNavigation = (items: NavigationItem[]) => {
        items.sort((a, b) => a.id - b.id);
        for (const item of items) {
          if (item.children.length > 0) {
            sortNavigation(item.children);
          }
        }
      };

      sortNavigation(roots);

      return roots;
    } catch (error) {
      throw new Error(`Failed to fetch navigation menus: ${error}`);
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
