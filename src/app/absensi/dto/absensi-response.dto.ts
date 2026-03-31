import { AbsensiEntity } from "../contract/absensi.contract";

export type AbsensiResponseDto = AbsensiEntity & {
  user: {
    id: number;
    email: string;
    employee_id: string | null;
    name: string;
    grade_id: number;
    position_id: number;
    signature_image: string | null;
    role_id: number;
  };
};
