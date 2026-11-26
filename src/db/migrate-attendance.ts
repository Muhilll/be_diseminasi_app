import "dotenv/config";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  absensis,
  attendance_schedules,
  attendance_settings,
  attendances,
  db,
  menus,
  role_permissions,
  roles,
  users,
} from "./index";
import { getLocalDateParts } from "../utils/attendance";

// Roster from "Jadwal Membersihkan":
// Malam Senin (0=Sun), Malam Selasa (1=Mon), Malam Rabu (2=Tue),
// Malam Kamis (3=Wed), Malam Jumat (4=Thu), Malam Sabtu (5=Fri),
// plus Saturday (6=Sat) active for all 27 assigned members.
const CLEANING_DAY_BY_USER_ID: Record<number, number> = {
  // Malam Senin (Sunday)
  64: 0, // Fatih Maulana
  47: 0, // Hasniawati
  66: 0, // Lusia Ayutizha Ardila Lamahoda
  53: 0, // Fais Pratama
  // Malam Selasa (Monday)
  49: 1, // Ranti H. Sigani
  45: 1, // Safira Muztasyifa Syah
  51: 1, // Mulyanti M. Kedeton
  40: 1, // M Risky Habibie
  72: 1, // Anong La Sanisa
  // Malam Rabu (Tuesday)
  54: 2, // Siti Azzahra Nur Fadhila
  48: 2, // Rahmanhia Ramadhani
  31: 2, // Muhammad Kholilullah
  34: 2, // Muhammad Raihan
  35: 2, // Nafilah Diasty Ramadhan S
  // Malam Kamis (Wednesday)
  69: 3, // Alika Nurazizah
  67: 3, // Nur Zaskia
  44: 3, // Al fina Syarif
  65: 3, // Akbar Ramdani Rumasoreng
  // Malam Jumat (Thursday)
  52: 4, // Aan
  46: 4, // Musliadi As Ad
  70: 4, // Dzulfikar Tadah
  50: 4, // Rahmathia Ramadhani
  43: 4, // Muh. Fathan Diseptian
  // Malam Sabtu (Friday)
  68: 5, // inas almira khalilah
  41: 5, // Fahmi Fauzi
  39: 5, // Muh. Amin Hidayat
  29: 5, // Maudy Aprila Ahmad
};

async function ensureTablesExist() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS attendance_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      location_name VARCHAR(150) NOT NULL,
      latitude DOUBLE NOT NULL,
      longitude DOUBLE NOT NULL,
      radius_meters INT NOT NULL DEFAULT 100,
      check_in_deadline VARCHAR(5) NOT NULL,
      check_out_deadline VARCHAR(5) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS attendance_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      day_of_week INT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT attendance_schedules_user_fk FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE KEY attendance_schedules_user_day_unique (user_id, day_of_week)
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS attendances (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      attendance_date VARCHAR(10) NOT NULL,
      check_in_time DATETIME NOT NULL,
      check_in_lat DOUBLE NULL,
      check_in_lng DOUBLE NULL,
      check_in_image VARCHAR(255) NOT NULL,
      check_in_image_public_id VARCHAR(255) NOT NULL,
      check_in_note TEXT NULL,
      check_in_status VARCHAR(30) NOT NULL,
      check_out_time DATETIME NULL,
      check_out_lat DOUBLE NULL,
      check_out_lng DOUBLE NULL,
      check_out_image VARCHAR(255) NULL,
      check_out_image_public_id VARCHAR(255) NULL,
      check_out_note TEXT NULL,
      check_out_status VARCHAR(30) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT attendances_user_fk FOREIGN KEY (user_id) REFERENCES users(id),
      INDEX attendances_user_date_idx (user_id, attendance_date)
    )
  `);
}

async function migrateLegacyAbsensis() {
  const existing = await db.select({ id: attendances.id }).from(attendances).limit(1);
  if (existing.length > 0) {
    console.log("attendances already populated, skipping legacy absensis copy.");
    return;
  }

  const legacyRows = await db.select().from(absensis);
  if (legacyRows.length === 0) {
    console.log("No legacy absensis rows found.");
    return;
  }

  const chunkSize = 100;
  for (let i = 0; i < legacyRows.length; i += chunkSize) {
    const chunk = legacyRows.slice(i, i + chunkSize);
    await db.insert(attendances).values(
      chunk.map((row) => ({
        user_id: row.user_id,
        attendance_date: getLocalDateParts(new Date(row.created_at)).date,
        check_in_time: row.created_at,
        check_in_lat: null,
        check_in_lng: null,
        check_in_image: row.gambar ?? "",
        check_in_image_public_id: row.gambar_public_id ?? "",
        check_in_note: row.des ?? null,
        check_in_status: "legacy",
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
    );
  }

  console.log(`Migrated ${legacyRows.length} legacy absensis rows into attendances.`);
}

async function seedDefaultSettings() {
  const existing = await db.select({ id: attendance_settings.id }).from(attendance_settings).limit(1);
  if (existing.length > 0) {
    console.log("attendance_settings already exists, skipping.");
    return;
  }

  await db.insert(attendance_settings).values({
    location_name: "Basecamp",
    latitude: -5.147665,
    longitude: 119.432732,
    radius_meters: 100,
    check_in_deadline: "21:00",
    check_out_deadline: "17:00",
  });
  console.log("Inserted default attendance_settings.");
}

async function backfillSchedules() {
  const allUsers = await db.select({ id: users.id }).from(users);
  const existingSchedules = await db
    .select({ user_id: attendance_schedules.user_id, day_of_week: attendance_schedules.day_of_week })
    .from(attendance_schedules);

  const existingKeys = new Set(existingSchedules.map((s) => `${s.user_id}:${s.day_of_week}`));
  const toInsert: Array<{ user_id: number; day_of_week: number; is_active: boolean }> = [];

  for (const u of allUsers) {
    const assignedDay = CLEANING_DAY_BY_USER_ID[u.id];
    const isRosterMember = assignedDay !== undefined;

    for (let day = 0; day <= 6; day++) {
      if (existingKeys.has(`${u.id}:${day}`)) continue;
      const isActive = isRosterMember && (day === assignedDay || day === 6);
      toInsert.push({ user_id: u.id, day_of_week: day, is_active: isActive });
    }
  }

  if (toInsert.length > 0) {
    await db.insert(attendance_schedules).values(toInsert);
  }
  console.log(`Backfilled ${toInsert.length} attendance_schedules rows.`);
}

async function upsertMenusAndPermissions() {
  const oldAbsensiMenus = await db
    .select({ id: menus.id })
    .from(menus)
    .where(eq(menus.path, "/absensis"));

  if (oldAbsensiMenus.length > 0) {
    const oldIds = oldAbsensiMenus.map((m) => m.id);
    await db.delete(role_permissions).where(inArray(role_permissions.menu_id, oldIds));
    await db.delete(menus).where(inArray(menus.id, oldIds));
    console.log("Removed legacy /absensis menu and permissions.");
  }

  const ensureMenu = async (data: {
    name: string;
    path: string;
    permission_path: string | null;
    parent_id: number | null;
  }) => {
    const found = await db.select().from(menus).where(eq(menus.path, data.path)).limit(1);
    if (found.length > 0) return found[0].id;
    await db.insert(menus).values({
      name: data.name,
      path: data.path,
      permission_path: data.permission_path,
      icon: null,
      parent_id: data.parent_id,
    });
    const inserted = await db.select().from(menus).where(eq(menus.path, data.path)).limit(1);
    return inserted[0].id;
  };

  const parentId = await ensureMenu({
    name: "Attendance Management",
    path: "/attendance-management",
    permission_path: null,
    parent_id: null,
  });

  const settingsId = await ensureMenu({
    name: "Settings",
    path: "/attendance/settings",
    permission_path: "/api/attendance-settings",
    parent_id: parentId,
  });

  const scheduleId = await ensureMenu({
    name: "Schedule",
    path: "/attendance/schedules",
    permission_path: "/api/attendance-schedules",
    parent_id: parentId,
  });

  const attendanceId = await ensureMenu({
    name: "Attendance",
    path: "/attendance",
    permission_path: "/api/attendances",
    parent_id: parentId,
  });

  const allRoles = await db.select().from(roles);
  const ensurePerm = async (
    roleId: number,
    menuId: number,
    perms: { can_read: boolean; can_create: boolean; can_update: boolean; can_delete: boolean; can_report: boolean },
  ) => {
    const existing = await db
      .select({ id: role_permissions.id })
      .from(role_permissions)
      .where(and(eq(role_permissions.role_id, roleId), eq(role_permissions.menu_id, menuId)))
      .limit(1);
    if (existing.length > 0) return;
    await db.insert(role_permissions).values({ role_id: roleId, menu_id: menuId, ...perms });
  };

  for (const role of allRoles) {
    if (role.code === "ADMIN") {
      for (const menuId of [parentId, settingsId, scheduleId, attendanceId]) {
        await ensurePerm(role.id, menuId, {
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: true,
          can_report: true,
        });
      }
    } else if (role.code === "OPERATOR" || role.code === "USER") {
      await ensurePerm(role.id, parentId, {
        can_read: true,
        can_create: false,
        can_update: false,
        can_delete: false,
        can_report: false,
      });
      await ensurePerm(role.id, attendanceId, {
        can_read: true,
        can_create: true,
        can_update: true,
        can_delete: false,
        can_report: false,
      });
    }
  }

  console.log("Upserted Attendance Management menus and role_permissions.");
}

async function main() {
  await ensureTablesExist();
  await migrateLegacyAbsensis();
  await seedDefaultSettings();
  await backfillSchedules();
  await upsertMenusAndPermissions();
  console.log("Attendance migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Attendance migration failed:", err);
  process.exit(1);
});
