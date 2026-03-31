export type AbsensiEntity = {
  id: number;
  gambar: string | null;
  gambar_public_id: string | null;
  des: string | null;
  user_id: number;
  created_at: Date;
  updated_at: Date;
};

export type AbsensiWithRelationsRow = {
  id: number;
  gambar: string | null;
  gambar_public_id: string | null;
  des: string | null;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  user_ref_id: number;
  user_email: string;
  user_employee_id: string | null;
  user_name: string;
  user_grade_id: number;
  user_position_id: number;
  user_signature_image: string | null;
  user_role_id: number;
};
