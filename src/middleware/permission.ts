import { Context, Next } from "hono";
import { RolePermissionReadRepository } from "../app/role_permission/repository/role-permission-read.repository";

export type PermissionAction =
  | "can_read"
  | "can_create"
  | "can_update"
  | "can_delete"
  | "can_report";

type AuthUser = {
  id: number;
  email: string;
  name: string;
  role_id: number;
};

export const requirePermission =
  (menuKey: string, action: PermissionAction) =>
  async (c: Context, next: Next) => {
    try {
      const user = c.get("user") as AuthUser | undefined;

      if (!user?.role_id) {
        return c.json(
          {
            success: false,
            message: "Unauthorized - User role not found",
          },
          401,
        );
      }

      const permission =
        await RolePermissionReadRepository.getPermissionByRoleIdAndMenuKey(
          user.role_id,
          menuKey,
        );

      if (!permission || !Boolean(permission[action])) {
        return c.json(
          {
            success: false,
            message: "Forbidden - You do not have permission to access this resource",
          },
          403,
        );
      }

      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        500,
      );
    }
  };
