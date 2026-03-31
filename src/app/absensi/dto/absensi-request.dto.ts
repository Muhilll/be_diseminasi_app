export type CreateAbsensiRequestDto = {
  gambar?: string | File;
  gambar_public_id?: string | null;
  des?: string;
  user_id: number;
};

export type UpdateAbsensiRequestDto = Partial<{
  gambar: string | File;
  gambar_public_id: string | null;
  des: string;
  user_id: number;
}>;
