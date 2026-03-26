import { db } from "../../../db";
import { menus, role_permissions, users } from "../../../db/schema";
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
