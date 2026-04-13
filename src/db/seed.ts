import { isNotNull, isNull } from "drizzle-orm";
import {
  absensis,
  db,
  disseminations,
  disseminations_details,
  grades,
  menus,
  positions,
  role_permissions,
  roles,
  users,
} from "./index";

const gradeSeedData = [
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

const positionSeedData = [
  { category: "expertise", des: "Ahli Regulasi" },
  { category: "expertise", des: "Ahli Teknologi Informasi" },
  { category: "expertise", des: "Ahli Komunikasi" },
  { category: "skills", des: "Keterampilan Pimpinan" },
  { category: "skills", des: "Keterampilan Teknis" },
  { category: "skills", des: "Keterampilan Administrasi" },
];

const roleSeedData = [
  { code: "ADMIN", name: "Administrator" },
  { code: "OPERATOR", name: "Operator" },
  { code: "USER", name: "User" },
];

const menuSeedData = [
  { name: "Dashboard", path: "/dashboard", icon: null, parentName: null },
  { name: "Master Data", path: "/master-data", icon: null, parentName: null },
  { name: "Web Management", path: "/web-management", icon: null, parentName: null },
  { name: "Grade", path: "/master-data/grades", icon: null, parentName: "Master Data" },
  { name: "Position", path: "/master-data/positions", icon: null, parentName: "Master Data" },
  { name: "Role", path: "/master-data/roles", icon: null, parentName: "Master Data" },
  { name: "User", path: "/master-data/users", icon: null, parentName: "Master Data" },
  { name: "Menu", path: "/web-management/menus", icon: null, parentName: "Web Management" },
  {
    name: "Role Permission",
    path: "/web-management/role-permissions",
    icon: null,
    parentName: "Web Management",
  },
];

async function clearAllTables() {
  await db.delete(absensis);
  await db.delete(disseminations_details);
  await db.delete(disseminations);
  await db.delete(role_permissions);
  await db.delete(menus).where(isNotNull(menus.parent_id));
  await db.delete(menus).where(isNull(menus.parent_id));
  await db.delete(users);
  await db.delete(roles);
  await db.delete(grades);
  await db.delete(positions);
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    await clearAllTables();

    console.log("Seeding positions...");
    const insertedPositions = await db.insert(positions).values(positionSeedData).$returningId();

    console.log("Seeding grades...");
    const insertedGrades = await db.insert(grades).values(gradeSeedData).$returningId();

    console.log("Seeding roles...");
    const insertedRoles = await db.insert(roles).values(roleSeedData).$returningId();

    console.log("Seeding users...");
    await db.insert(users).values([
      {
        email: "admin@diseminasi.com",
        password: "$2b$10$zfTsPNHSUcbiTWXmkxWyIuxBPZzG5WPfp/.ycvXNWrJJ2u1IeXYJm",
        employee_id: "ADM001",
        name: "Admin User",
        grade_id: insertedGrades[0].id,
        position_id: insertedPositions[3].id,
        signature_image: null,
        role_id: insertedRoles[0].id,
      },
      {
        email: "operator@diseminasi.com",
        password: "$2b$10$/YsMJenSdyljUSnSFYoExuDn3iyscv9vZROUQSUdag0UL3QuqsLqy",
        employee_id: "OPR001",
        name: "Operator User",
        grade_id: insertedGrades[4].id,
        position_id: insertedPositions[5].id,
        signature_image: null,
        role_id: insertedRoles[1].id,
      },
    ]);

    console.log("Seeding parent menus...");
    const parentMenus = menuSeedData.filter((menu) => menu.parentName === null);
    const insertedParentMenus = await db
      .insert(menus)
      .values(
        parentMenus.map((menu) => ({
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          parent_id: null,
        })),
      )
      .$returningId();

    const parentMenuIdByName = new Map<string, number>();
    parentMenus.forEach((menu, index) => {
      parentMenuIdByName.set(menu.name, insertedParentMenus[index].id);
    });

    console.log("Seeding child menus...");
    const childMenus = menuSeedData.filter((menu) => menu.parentName !== null);
    const insertedChildMenus = await db
      .insert(menus)
      .values(
        childMenus.map((menu) => ({
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          parent_id: parentMenuIdByName.get(menu.parentName as string) ?? null,
        })),
      )
      .$returningId();

    const allInsertedMenuIds = [...insertedParentMenus, ...insertedChildMenus].map((menu) => menu.id);

    console.log("Seeding role permissions...");
    await db.insert(role_permissions).values(
      allInsertedMenuIds.map((menuId) => ({
        role_id: insertedRoles[0].id,
        menu_id: menuId,
        can_read: true,
        can_create: true,
        can_update: true,
        can_delete: true,
        can_report: true,
      })),
    );

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
