export type CreateAbsensiRequestDto = {
  gambar?: string;
  des?: string;
  user_id: number;
};

export type UpdateAbsensiRequestDto = Partial<{
  gambar: string;
  des: string;
  user_id: number;
}>;
