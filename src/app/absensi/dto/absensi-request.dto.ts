export type CreateAbsensiRequestDto = {
  gambar?: string;
  gambar_public_id?: string;
  des?: string;
  user_id: number;
};

export type UpdateAbsensiRequestDto = Partial<{
  gambar: string;
  gambar_public_id: string;
  des: string;
  user_id: number;
}>;
