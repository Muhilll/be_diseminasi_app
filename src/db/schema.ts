import {
  int,
  varchar,
  text,
  datetime,
  boolean,
  mysqlTable,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm/sql/sql";

export const menus = mysqlTable(
  "menus",
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 100 }).notNull(),
    path: varchar({ length: 255 }).notNull(),
    icon: varchar({ length: 255 }),
    parent_id: int(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    parent_fk: foreignKey({
      columns: [table.parent_id],
      foreignColumns: [table.id],
    }),
  })
);

// Roles Table
export const roles = mysqlTable("roles", {
  id: int().primaryKey().autoincrement(),
  code: varchar({ length: 50 }).notNull().unique(),
  name: varchar({ length: 100 }).notNull(),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Grades Table
export const grades = mysqlTable("grades", {
  id: int().primaryKey().autoincrement(),
  level: int().notNull(),
  grade: varchar({ length: 50 }).notNull(),
  des: text(),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Positions Table
export const positions = mysqlTable("positions", {
  id: int().primaryKey().autoincrement(),
  category: varchar({ length: 50 }).notNull(), // 'expertise' or 'skills'
  des: text(),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Users Table
export const users = mysqlTable(
  "users",
  {
    id: int().primaryKey().autoincrement(),
    email: varchar({ length: 100 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    employee_id: varchar({ length: 50 }),
    name: varchar({ length: 100 }).notNull(),
    grade_id: int().notNull(),
    position_id: int().notNull(),
    signature_image: varchar({ length: 255 }),
    role_id: int().notNull(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    grade_fk: foreignKey({
      columns: [table.grade_id],
      foreignColumns: [grades.id],
    }),
    position_fk: foreignKey({
      columns: [table.position_id],
      foreignColumns: [positions.id],
    }),
    role_fk: foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
    }),
  })
);

// Absensis Table
export const absensis = mysqlTable(
  "absensis",
  {
    id: int().primaryKey().autoincrement(),
    gambar: varchar({ length: 255 }),
    des: text(),
    user_id: int().notNull(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    user_fk: foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
  })
);

// Role Permissions Table
export const role_permissions = mysqlTable(
  "role_permissions",
  {
    id: int().primaryKey().autoincrement(),
    role_id: int().notNull(),
    menu_id: int().notNull(),
    can_read: boolean().default(false),
    can_create: boolean().default(false),
    can_update: boolean().default(false),
    can_delete: boolean().default(false),
    can_report: boolean().default(false),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    role_fk: foreignKey({
      columns: [table.role_id],
      foreignColumns: [roles.id],
    }),
    menu_fk: foreignKey({
      columns: [table.menu_id],
      foreignColumns: [menus.id],
    }),
  })
);

// Disseminations Table
export const disseminations = mysqlTable(
  "disseminations",
  {
    id: int().primaryKey().autoincrement(),
    title: varchar({ length: 255 }).notNull(),
    province: varchar({ length: 100 }).notNull(),
    city: varchar({ length: 100 }).notNull(),
    district: varchar({ length: 100 }).notNull(),
    village: varchar({ length: 100 }).notNull(),
    date: datetime().notNull(),
    user_id: int().notNull(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    user_fk: foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
  })
);

// Disseminations Details Table
export const disseminations_details = mysqlTable(
  "disseminations_details",
  {
    id: int().primaryKey().autoincrement(),
    disseminations_id: int().notNull(),
    basis: text(),
    material: text(),
    date: datetime(),
    location: varchar({ length: 255 }),
    methode: varchar({ length: 100 }),
    participants: varchar({ length: 255 }),
    result: text(),
    image: varchar({ length: 255 }),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    disseminations_fk: foreignKey({
      columns: [table.disseminations_id],
      foreignColumns: [disseminations.id],
    }),
  })
);
