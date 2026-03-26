import { Context } from "hono";
import { MenuModel } from "../model/menu";

export class MenuController {
  // GET all menus
  static async getAll(c: Context) {
    try {
      const menus = await MenuModel.getAllMenus();
      return c.json({
        success: true,
        data: menus,
        message: "Menus fetched successfully",
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

  // GET menu by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid menu ID" }, 400);
      }

      const menu = await MenuModel.getMenuById(id);
      if (!menu) {
        return c.json({ success: false, message: "Menu not found" }, 404);
      }

      return c.json({
        success: true,
        data: menu,
        message: "Menu fetched successfully",
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

  // POST create new menu
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      if (!body.name || !body.path) {
        return c.json(
          {
            success: false,
            message: "Name and path are required",
          },
          400,
        );
      }

      const result = await MenuModel.createMenu(body);

      return c.json(
        {
          success: true,
          data: result,
          message: "Menu created successfully",
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

  // PUT update menu
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid menu ID" }, 400);
      }

      const body = await c.req.json();

      const menu = await MenuModel.getMenuById(id);
      if (!menu) {
        return c.json({ success: false, message: "Menu not found" }, 404);
      }

      const result = await MenuModel.updateMenu(id, body);

      return c.json({
        success: true,
        data: result,
        message: "Menu updated successfully",
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

  // DELETE menu
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");

      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid menu ID" }, 400);
      }

      const menu = await MenuModel.getMenuById(id);
      if (!menu) {
        return c.json({ success: false, message: "Menu not found" }, 404);
      }

      const result = await MenuModel.deleteMenu(id);

      return c.json({
        success: true,
        data: result,
        message: "Menu deleted successfully",
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
