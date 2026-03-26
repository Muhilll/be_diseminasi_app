import { Context } from "hono";
import { RolePermissionModel } from "../model/role_permission";

export class RolePermissionController {
  // GET all role permissions
  static async getAll(c: Context) {
    try {
      const rolePermissions = await RolePermissionModel.getAllRolePermissions();
      return c.json({
        success: true,
        data: rolePermissions,
        message: "Role permissions fetched successfully",
      });
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
  }

  // GET role permission by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid role permission ID" },
          400,
        );
      }

      const rolePermission = await RolePermissionModel.getRolePermissionById(id);
      if (!rolePermission) {
        return c.json(
          { success: false, message: "Role permission not found" },
          404,
        );
      }

      return c.json({
        success: true,
        data: rolePermission,
        message: "Role permission fetched successfully",
      });
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
  }

  // GET permissions by role ID
  static async getByRoleId(c: Context) {
    try {
      const roleIdParam = c.req.param("roleId");

      if (!roleIdParam) {
        return c.json(
          { success: false, message: "Role ID is required" },
          400,
        );
      }

      const roleId = parseInt(roleIdParam, 10);
      if (isNaN(roleId)) {
        return c.json(
          { success: false, message: "Invalid role ID" },
          400,
        );
      }

      const permissions = await RolePermissionModel.getPermissionsByRoleId(roleId);

      return c.json({
        success: true,
        data: permissions,
        message: "Role permissions fetched successfully",
      });
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
  }

  // POST create new role permission
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.role_id || !body.menu_id) {
        return c.json(
          {
            success: false,
            message: "Role ID and Menu ID are required",
          },
          400,
        );
      }

      const result = await RolePermissionModel.createRolePermission(body);

      return c.json(
        {
          success: true,
          data: result,
          message: "Role permission created successfully",
        },
        201,
      );
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
  }

  // PUT update role permission
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid role permission ID" },
          400,
        );
      }

      const body = await c.req.json();

      const rolePermission = await RolePermissionModel.getRolePermissionById(id);
      if (!rolePermission) {
        return c.json(
          { success: false, message: "Role permission not found" },
          404,
        );
      }

      const result = await RolePermissionModel.updateRolePermission(id, body);

      return c.json({
        success: true,
        data: result,
        message: "Role permission updated successfully",
      });
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
  }

  // DELETE role permission
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json(
          { success: false, message: "Invalid role permission ID" },
          400,
        );
      }

      const rolePermission = await RolePermissionModel.getRolePermissionById(id);
      if (!rolePermission) {
        return c.json(
          { success: false, message: "Role permission not found" },
          404,
        );
      }

      const result = await RolePermissionModel.deleteRolePermission(id);

      return c.json({
        success: true,
        data: result,
        message: "Role permission deleted successfully",
      });
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
  }
}
