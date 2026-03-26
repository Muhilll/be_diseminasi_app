import { db } from "./index";
import { roles, grades, positions, users } from "./schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    await db.delete(users);
    await db.delete(roles);
    await db.delete(grades);
    await db.delete(positions);

    // 1. Seed Roles
    console.log("📝 Seeding roles...");
    try {
      const rolesData = [
        { code: "ADMIN", name: "Administrator" },
        { code: "OPERATOR", name: "Operator" },
        { code: "USER", name: "User" },
      ];
      await db.insert(roles).values(rolesData);
      console.log(`✅ ${rolesData.length} roles seeded`);
    } catch (error: any) {
      console.log(`⚠️  Roles already exist or error: ${error.message}`);
    }

    // 2. Seed Grades
    console.log("📝 Seeding grades...");
    try {
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
      console.log(`✅ ${gradesData.length} grades seeded`);
    } catch (error: any) {
      console.log(`⚠️  Grades already exist or error: ${error.message}`);
    }

    // 3. Seed Positions
    console.log("📝 Seeding positions...");
    try {
      const positionsData = [
        { category: "expertise", des: "Ahli Regulasi" },
        { category: "expertise", des: "Ahli Teknologi Informasi" },
        { category: "expertise", des: "Ahli Komunikasi" },
        { category: "skills", des: "Keterampilan Pimpinan" },
        { category: "skills", des: "Keterampilan Teknis" },
        { category: "skills", des: "Keterampilan Administrasi" },
      ];
      await db.insert(positions).values(positionsData);
      console.log(`✅ ${positionsData.length} positions seeded`);
    } catch (error: any) {
      console.log(`⚠️  Positions already exist or error: ${error.message}`);
    }

    // 4. Seed Users with Dynamic IDs
    console.log("📝 Seeding users...");
    try {
      // Get IDs dynamically from database
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

      const gradeId_1 = await db
        .select()
        .from(grades)
        .where(eq(grades.grade, "Ia"))
        .limit(1);

      const gradeId_5 = await db
        .select()
        .from(grades)
        .where(eq(grades.grade, "IIb"))
        .limit(1);

      const positionId_4 = await db
        .select()
        .from(positions)
        .where(eq(positions.des, "Keterampilan Pimpinan"))
        .limit(1);

      const positionId_6 = await db
        .select()
        .from(positions)
        .where(eq(positions.des, "Keterampilan Administrasi"))
        .limit(1);

      if (
        !adminRole[0] ||
        !operatorRole[0] ||
        !gradeId_1[0] ||
        !gradeId_5[0] ||
        !positionId_4[0] ||
        !positionId_6[0]
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
          grade_id: gradeId_1[0].id,
          position_id: positionId_4[0].id,
          role_id: adminRole[0].id,
        },
        {
          email: "operator@diseminasi.com",
          password: operatorPassword,
          employee_id: "OPR001",
          name: "Operator User",
          grade_id: gradeId_5[0].id,
          position_id: positionId_6[0].id,
          role_id: operatorRole[0].id,
        },
      ];
      await db.insert(users).values(usersData);
      console.log(`✅ ${usersData.length} users seeded`);
    } catch (error: any) {
      console.log(`⚠️  Users already exist or error: ${error.message}`);
    }

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📋 Default Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin Account:");
    console.log("  Email: admin@diseminasi.com");
    console.log("  Password: admin123");
    console.log("\nOperator Account:");
    console.log("  Email: operator@diseminasi.com");
    console.log("  Password: operator123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
