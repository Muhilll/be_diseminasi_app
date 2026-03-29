import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { grades, positions, roles, users } from "../../../db/schema";
import { PublicUser, UserWithRelationsRow } from "../contract/user.contract";

const userWithRelationsSelect = {
  id: users.id,
  email: users.email,
  employee_id: users.employee_id,
  name: users.name,
  grade_id: users.grade_id,
  position_id: users.position_id,
  signature_image: users.signature_image,
  role_id: users.role_id,
  created_at: users.created_at,
  updated_at: users.updated_at,
  role_ref_id: roles.id,
  role_code: roles.code,
  role_name: roles.name,
  grade_ref_id: grades.id,
  grade_level: grades.level,
  grade_name: grades.grade,
  grade_des: grades.des,
  position_ref_id: positions.id,
  position_category: positions.category,
  position_des: positions.des,
};

function mapUserWithRelations(user: UserWithRelationsRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    employee_id: user.employee_id,
    name: user.name,
    grade_id: user.grade_id,
    position_id: user.position_id,
    signature_image: user.signature_image,
    role_id: user.role_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
    role: {
      id: user.role_ref_id,
      code: user.role_code,
      name: user.role_name,
    },
    grade: {
      id: user.grade_ref_id,
      level: user.grade_level,
      grade: user.grade_name,
      des: user.grade_des,
    },
    position: {
      id: user.position_ref_id,
      category: user.position_category,
      des: user.position_des,
    },
  };
}

export class UserReadRepository {
  static async getAllUsers() {
    try {
      const result = await db
        .select(userWithRelationsSelect)
        .from(users)
        .innerJoin(roles, eq(users.role_id, roles.id))
        .innerJoin(grades, eq(users.grade_id, grades.id))
        .innerJoin(positions, eq(users.position_id, positions.id));

      return result.map(mapUserWithRelations);
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error}`);
    }
  }

  static async getUserById(id: number) {
    try {
      const result = await db
        .select(userWithRelationsSelect)
        .from(users)
        .innerJoin(roles, eq(users.role_id, roles.id))
        .innerJoin(grades, eq(users.grade_id, grades.id))
        .innerJoin(positions, eq(users.position_id, positions.id))
        .where(eq(users.id, id))
        .limit(1);

      return result[0] ? mapUserWithRelations(result[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }
}
