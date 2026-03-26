import { db } from "../../../db";
import { menus } from "../../../db/schema";
import { eq, isNull } from "drizzle-orm";

export class MenuModel {
  // Get all menus
  static async getAllMenus() {
    try {
      const result = await db.select().from(menus);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch menus: ${error}`);
    }
  }

  // Get menu by ID
  static async getMenuById(id: number) {
    try {
      const result = await db
        .select()
        .from(menus)
        .where(eq(menus.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch menu: ${error}`);
    }
  }

  // Get menus by parent ID
  static async getMenusByParentId(parentId: number | null) {
    try {
      if (parentId === null) {
        const result = await db
          .select()
          .from(menus)
          .where(isNull(menus.parent_id));
        return result;
      }
      const result = await db
        .select()
        .from(menus)
        .where(eq(menus.parent_id, parentId));
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch menus: ${error}`);
    }
  }

  // Create menu
  static async createMenu(data: {
    name: string;
    path: string;
    icon?: string | null;
    parent_id?: number | null;
  }) {
    try {
      const result = await db.insert(menus).values(data);
      return result;
    } catch (error) {
      throw new Error(`Failed to create menu: ${error}`);
    }
  }

  // Update menu
  static async updateMenu(
    id: number,
    data: Partial<{
      name: string;
      path: string;
      icon: string | null;
      parent_id: number | null;
    }>
  ) {
    try {
      const result = await db
        .update(menus)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(menus.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to update menu: ${error}`);
    }
  }

  // Delete menu
  static async deleteMenu(id: number) {
    try {
      const result = await db.delete(menus).where(eq(menus.id, id));
      return result;
    } catch (error) {
      throw new Error(`Failed to delete menu: ${error}`);
    }
  }
}
