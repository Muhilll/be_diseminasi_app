export type LoginRequestDto = {
  email: string;
  password: string;
};

export type CreateUserRequestDto = {
  email: string;
  password: string;
  name: string;
  employee_id?: string;
  grade_id: number;
  position_id: number;
  role_id: number;
  signature_image?: string;
};

export type UpdateUserRequestDto = Partial<{
  email: string;
  password: string;
  name: string;
  employee_id: string;
  grade_id: number;
  position_id: number;
  role_id: number;
  signature_image: string;
}>;
