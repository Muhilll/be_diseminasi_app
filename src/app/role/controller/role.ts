import { Context } from "hono";
import { RoleModel } from "../model/role";

export class RoleController {
  // GET all roles
  static async getAll(c: Context) {
    try {
      const roles = await RoleModel.getAllRoles();
      return c.json({
        success: true,
        data: roles,
        message: "Roles fetched successfully",
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

  // GET role by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid role ID" }, 400);
      }

      const role = await RoleModel.getRoleById(id);
      if (!role) {
        return c.json({ success: false, message: "Role not found" }, 404);
      }

      return c.json({
        success: true,
        data: role,
        message: "Role fetched successfully",
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

  // POST create new role
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.code || !body.name) {
        return c.json(
          {
            success: false,
            message: "Code and name are required",
          },
          400,
        );
      }

      const existingRole = await RoleModel.getRoleByCode(body.code);
      if (existingRole) {
        return c.json(
          { success: false, message: "Role code already exists" },
          400,
        );
      }

      const result = await RoleModel.createRole(body);

      return c.json(
        {
          success: true,
          data: result,
          message: "Role created successfully",
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

  // PUT update role
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid role ID" }, 400);
      }

      const body = await c.req.json();

      const role = await RoleModel.getRoleById(id);
      if (!role) {
        return c.json({ success: false, message: "Role not found" }, 404);
      }

      const result = await RoleModel.updateRole(id, body);

      return c.json({
        success: true,
        data: result,
        message: "Role updated successfully",
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

  // DELETE role
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid role ID" }, 400);
      }

      const role = await RoleModel.getRoleById(id);
      if (!role) {
        return c.json({ success: false, message: "Role not found" }, 404);
      }

      const result = await RoleModel.deleteRole(id);

      return c.json({
        success: true,
        data: result,
        message: "Role deleted successfully",
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
