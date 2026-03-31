import { hash } from "bcryptjs";
import { eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "./index";
import { grades, menus, positions, role_permissions, roles, users } from "./schema";

async function seed() {
  try {
    console.log("Starting database seeding...");

    await db.delete(role_permissions);
    await db.delete(menus).where(isNotNull(menus.parent_id));
    await db.delete(menus).where(isNull(menus.parent_id));
    await db.delete(users);
    await db.delete(roles);
    await db.delete(grades);
    await db.delete(positions);

    console.log("Seeding roles...");
    const rolesData = [
      { code: "ADMIN", name: "Administrator" },
      { code: "OPERATOR", name: "Operator" },
      { code: "USER", name: "User" },
    ];
    await db.insert(roles).values(rolesData);
    console.log(`${rolesData.length} roles seeded`);

    console.log("Seeding grades...");
    const gradesData = [
      { level: 1, grade: "Ia", des: "Golongan Ia" },
      { level: 1, grade: "Ib", des: "Golongan Ib" },
      { level: 1, grade: "Ic", des: "Golongan Ic" },
      { level: 2, grade: "IIa", des: "Golongan IIa" },
      { level: 2, grade: "IIb", des: "Golongan IIb" },
      { level: 2, grade: "IIc", des: "Golongan IIc" },
      { level: 3, grade: "IIIa", des: "Golongan IIIa" },
      { level: 3, grade: "IIIb", des: "Golongan IIIb" },
      { level: 4, grade: "IVa", des: "Golongan IVa" },
      { level: 4, grade: "IVb", des: "Golongan IVb" },
    ];
    await db.insert(grades).values(gradesData);
    console.log(`${gradesData.length} grades seeded`);

    console.log("Seeding positions...");
    const positionsData = [
      { category: "expertise", des: "Ahli Regulasi" },
      { category: "expertise", des: "Ahli Teknologi Informasi" },
      { category: "expertise", des: "Ahli Komunikasi" },
      { category: "skills", des: "Keterampilan Pimpinan" },
      { category: "skills", des: "Keterampilan Teknis" },
      { category: "skills", des: "Keterampilan Administrasi" },
    ];
    await db.insert(positions).values(positionsData);
    console.log(`${positionsData.length} positions seeded`);

    console.log("Seeding menus...");
    const rootMenusData = [
      { name: "Dashboard", path: "/dashboard", parent_id: null },
      { name: "Master Data", path: "/master-data", parent_id: null },
      { name: "Web Management", path: "/web-management", parent_id: null },
    ];
    await db.insert(menus).values(rootMenusData);

    const masterDataMenu = await db
      .select()
      .from(menus)
      .where(eq(menus.path, "/master-data"))
      .limit(1);

    const webManagementMenu = await db
      .select()
      .from(menus)
      .where(eq(menus.path, "/web-management"))
      .limit(1);

    if (!masterDataMenu[0] || !webManagementMenu[0]) {
      throw new Error("Required parent menus not found");
    }

    const childMenusData = [
      {
        name: "Grade",
        path: "/master-data/grades",
        parent_id: masterDataMenu[0].id,
      },
      {
        name: "Position",
        path: "/master-data/positions",
        parent_id: masterDataMenu[0].id,
      },
      {
        name: "Role",
        path: "/master-data/roles",
        parent_id: masterDataMenu[0].id,
      },
      {
        name: "User",
        path: "/master-data/users",
        parent_id: masterDataMenu[0].id,
      },
      {
        name: "Menu",
        path: "/web-management/menus",
        parent_id: webManagementMenu[0].id,
      },
      {
        name: "Role Permission",
        path: "/web-management/role-permissions",
        parent_id: webManagementMenu[0].id,
      },
    ];
    await db.insert(menus).values(childMenusData);
    console.log(`${rootMenusData.length + childMenusData.length} menus seeded`);

    console.log("Seeding users...");
    const adminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.code, "ADMIN"))
      .limit(1);

    const operatorRole = await db
      .select()
      .from(roles)
      .where(eq(roles.code, "OPERATOR"))
      .limit(1);

    const gradeIa = await db
      .select()
      .from(grades)
      .where(eq(grades.grade, "Ia"))
      .limit(1);

    const gradeIIb = await db
      .select()
      .from(grades)
      .where(eq(grades.grade, "IIb"))
      .limit(1);

    const positionPimpinan = await db
      .select()
      .from(positions)
      .where(eq(positions.des, "Keterampilan Pimpinan"))
      .limit(1);

    const positionAdministrasi = await db
      .select()
      .from(positions)
      .where(eq(positions.des, "Keterampilan Administrasi"))
      .limit(1);

    if (
      !adminRole[0] ||
      !operatorRole[0] ||
      !gradeIa[0] ||
      !gradeIIb[0] ||
      !positionPimpinan[0] ||
      !positionAdministrasi[0]
    ) {
      throw new Error("Required reference data not found");
    }

    const adminPassword = await hash("admin123", 10);
    const operatorPassword = await hash("operator123", 10);

    const usersData = [
      {
        email: "admin@diseminasi.com",
        password: adminPassword,
        employee_id: "ADM001",
        name: "Admin User",
        grade_id: gradeIa[0].id,
        position_id: positionPimpinan[0].id,
        role_id: adminRole[0].id,
      },
      {
        email: "operator@diseminasi.com",
        password: operatorPassword,
        employee_id: "OPR001",
        name: "Operator User",
        grade_id: gradeIIb[0].id,
        position_id: positionAdministrasi[0].id,
        role_id: operatorRole[0].id,
      },
    ];
    await db.insert(users).values(usersData);
    console.log(`${usersData.length} users seeded`);

    console.log("Seeding role permissions...");
    const adminMenus = await db.select().from(menus);

    if (!adminRole[0] || adminMenus.length === 0) {
      throw new Error("Required roles or menus not found");
    }

    const rolePermissionsData = adminMenus.map((menu) => ({
      role_id: adminRole[0].id,
      menu_id: menu.id,
      can_read: true,
      can_create: true,
      can_update: true,
      can_delete: true,
      can_report: true,
    }));
    await db.insert(role_permissions).values(rolePermissionsData);
    console.log(`${rolePermissionsData.length} role permissions seeded`);

    console.log("Database seeding completed successfully!");
    console.log("Default Credentials:");
    console.log("Admin Account:");
    console.log("  Email: admin@diseminasi.com");
    console.log("  Password: admin123");
    console.log("Operator Account:");
    console.log("  Email: operator@diseminasi.com");
    console.log("  Password: operator123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
