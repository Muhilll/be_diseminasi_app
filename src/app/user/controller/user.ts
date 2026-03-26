import { Context } from "hono";
import { UserModel } from "../model/user";
import { generateToken } from "../../../utils/jwt";
import { compare, hash } from "bcryptjs";
import { TokenPayload } from "../../../utils/jwt";

export class UserController {
  // POST login - Generate JWT token
  static async login(c: Context) {
    try {
      const body = await c.req.json();

      // Validation
      if (!body.email || !body.password) {
        return c.json(
          {
            success: false,
            message: "Email and password are required",
          },
          400,
        );
      }

      // Get user by email
      const user = await UserModel.getUserByEmail(body.email);
      if (!user) {
        return c.json(
          { success: false, message: "Invalid email or password" },
          401,
        );
      }

      // Compare password using bcryptjs
      const isPasswordValid = await compare(body.password, user.password);
      if (!isPasswordValid) {
        return c.json(
          { success: false, message: "Invalid email or password" },
          401,
        );
      }

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
      });

      return c.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role_id: user.role_id,
          },
        },
        message: "Login successful",
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

  // GET all users
  static async getAll(c: Context) {
    try {
      const users = await UserModel.getAllUsers();
      return c.json({
        success: true,
        data: users,
        message: "Users fetched successfully",
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

  // GET current user navigation
  static async getNavigation(c: Context) {
    try {
      const user = c.get("user") as TokenPayload | undefined;

      if (!user?.role_id) {
        return c.json(
          {
            success: false,
            message: "Unauthorized - User role not found",
          },
          401,
        );
      }

      const navigation = await UserModel.getNavigationByRoleId(user.role_id);

      return c.json({
        success: true,
        data: navigation,
        message: "Navigation fetched successfully",
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

  // GET user by ID
  static async getById(c: Context) {
    try {
      const idParam = c.req.param("id");
      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid user ID" }, 400);
      }

      const user = await UserModel.getUserById(id);
      if (!user) {
        return c.json({ success: false, message: "User not found" }, 404);
      }

      return c.json({
        success: true,
        data: user,
        message: "User fetched successfully",
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

  // POST create new user
  static async create(c: Context) {
    try {
      const body = await c.req.json();

      // Validation
      if (!body.email || !body.password || !body.name) {
        return c.json(
          {
            success: false,
            message: "Email, password, and name are required",
          },
          400,
        );
      }

      // Check if email already exists
      const existingUser = await UserModel.getUserByEmail(body.email);
      if (existingUser) {
        return c.json(
          { success: false, message: "Email already registered" },
          400,
        );
      }

      // Hash password before creating user
      const hashedPassword = await hash(body.password, 10);

      const result = await UserModel.createUser({
        ...body,
        password: hashedPassword,
      });

      return c.json(
        {
          success: true,
          data: result,
          message: "User created successfully",
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

  // PUT update user
  static async update(c: Context) {
    try {
      const idParam = c.req.param("id");
      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid user ID" }, 400);
      }

      const body = await c.req.json();

      const user = await UserModel.getUserById(id);
      if (!user) {
        return c.json({ success: false, message: "User not found" }, 404);
      }

      // Hash password if being updated
      let updateData = body;
      if (body.password) {
        updateData.password = await hash(body.password, 10);
      }

      const result = await UserModel.updateUser(id, updateData);

      return c.json({
        success: true,
        data: result,
        message: "User updated successfully",
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

  // DELETE user
  static async delete(c: Context) {
    try {
      const idParam = c.req.param("id");
      if (!idParam) {
        return c.json({ success: false, message: "ID is required" }, 400);
      }

      const id = parseInt(idParam, 10);
      if (isNaN(id)) {
        return c.json({ success: false, message: "Invalid user ID" }, 400);
      }

      const user = await UserModel.getUserById(id);
      if (!user) {
        return c.json({ success: false, message: "User not found" }, 404);
      }

      const result = await UserModel.deleteUser(id);

      return c.json({
        success: true,
        data: result,
        message: "User deleted successfully",
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
