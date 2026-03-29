import { DisseminationEntity } from "../contract/dissemination.contract";

export type DisseminationResponseDto = DisseminationEntity & {
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
