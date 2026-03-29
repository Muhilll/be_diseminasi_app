export type CreateDisseminationRequestDto = {
  title: string;
  province: string;
  city: string;
  district: string;
  village: string;
  date: Date;
  user_id: number;
};

export type UpdateDisseminationRequestDto = Partial<{
  title: string;
  province: string;
  city: string;
  district: string;
  village: string;
  date: Date;
  user_id: number;
}>;
