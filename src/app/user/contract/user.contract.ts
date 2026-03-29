export type NavigationPermission = {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_report: boolean;
};

export type NavigationItem = {
  id: number;
  name: string;
  path: string;
  icon: string | null;
  parent_id: number | null;
  permissions: NavigationPermission;
  children: NavigationItem[];
};

export type UserWithRelationsRow = {
  id: number;
  email: string;
  employee_id: string | null;
  name: string;
  grade_id: number;
  position_id: number;
  signature_image: string | null;
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role_ref_id: number;
  role_code: string;
  role_name: string;
  grade_ref_id: number;
  grade_level: number;
  grade_name: string;
  grade_des: string | null;
  position_ref_id: number;
  position_category: string;
  position_des: string | null;
};

export type PublicUser = {
  id: number;
  email: string;
  employee_id: string | null;
  name: string;
  grade_id: number;
  position_id: number;
  signature_image: string | null;
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role: {
    id: number;
    code: string;
    name: string;
  };
  grade: {
    id: number;
    level: number;
    grade: string;
    des: string | null;
  };
  position: {
    id: number;
    category: string;
    des: string | null;
  };
};
