import {
  int,
  double,
  varchar,
  text,
  datetime,
  boolean,
  mysqlTable,
  primaryKey,
  foreignKey,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm/sql/sql";

export const menus = mysqlTable(
  "menus",
  {
    id: int().primaryKey().autoincrement(),
    name: varchar({ length: 100 }).notNull(),
    path: varchar({ length: 255 }).notNull(),
    permission_path: varchar({ length: 255 }),
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
    gambar_public_id: varchar({ length: 255 }).notNull(),
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
    image_public_id: varchar({ length: 255 }).notNull(),
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

// Attendance Settings Table (singleton global config)
export const attendance_settings = mysqlTable("attendance_settings", {
  id: int().primaryKey().autoincrement(),
  location_name: varchar({ length: 150 }).notNull(),
  latitude: double().notNull(),
  longitude: double().notNull(),
  radius_meters: int().notNull().default(100),
  check_in_deadline: varchar({ length: 5 }).notNull(),
  check_out_deadline: varchar({ length: 5 }).notNull(),
  created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Attendance Schedules Table (weekly schedule per user)
export const attendance_schedules = mysqlTable(
  "attendance_schedules",
  {
    id: int().primaryKey().autoincrement(),
    user_id: int().notNull(),
    day_of_week: int().notNull(), // 0 = Sunday .. 6 = Saturday
    is_active: boolean().notNull().default(true),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    user_fk: foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
    user_day_unique: uniqueIndex("attendance_schedules_user_day_unique").on(
      table.user_id,
      table.day_of_week,
    ),
  }),
);

// Attendances Table (check-in / check-out daily records)
export const attendances = mysqlTable(
  "attendances",
  {
    id: int().primaryKey().autoincrement(),
    user_id: int().notNull(),
    attendance_date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD in APP_TIMEZONE
    check_in_time: datetime().notNull(),
    check_in_lat: double(),
    check_in_lng: double(),
    check_in_image: varchar({ length: 255 }).notNull(),
    check_in_image_public_id: varchar({ length: 255 }).notNull(),
    check_in_note: text(),
    check_in_status: varchar({ length: 30 }).notNull(), // 'on_time' | 'late' | 'legacy'
    check_out_time: datetime(),
    check_out_lat: double(),
    check_out_lng: double(),
    check_out_image: varchar({ length: 255 }),
    check_out_image_public_id: varchar({ length: 255 }),
    check_out_note: text(),
    check_out_status: varchar({ length: 30 }), // 'on_time' | 'late_checkout'
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    user_fk: foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
    user_date_idx: index("attendances_user_date_idx").on(
      table.user_id,
      table.attendance_date,
    ),
  }),
);

// Attendance Leaves Table (Izin requests with Approve/Reject workflow)
export const attendance_leaves = mysqlTable(
  "attendance_leaves",
  {
    id: int().primaryKey().autoincrement(),
    user_id: int().notNull(),
    leave_date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD in APP_TIMEZONE
    reason: text().notNull(),
    attachment: varchar({ length: 255 }),
    attachment_public_id: varchar({ length: 255 }),
    status: varchar({ length: 20 }).notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    reviewed_by: int(),
    reviewed_at: datetime(),
    review_note: text(),
    created_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime().default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    user_fk: foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
    reviewer_fk: foreignKey({
      columns: [table.reviewed_by],
      foreignColumns: [users.id],
    }),
    user_date_idx: index("attendance_leaves_user_date_idx").on(
      table.user_id,
      table.leave_date,
    ),
  }),
);