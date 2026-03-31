export type CreateDisseminationDetailRequestDto = {
  disseminations_id: number;
  basis?: string;
  material?: string;
  date?: Date;
  location?: string;
  methode?: string;
  participants?: string;
  result?: string;
  image?: string | File;
  image_public_id?: string | null;
};

export type UpdateDisseminationDetailRequestDto = Partial<{
  disseminations_id: number;
  basis: string;
  material: string;
  date: Date;
  location: string;
  methode: string;
  participants: string;
  result: string;
  image: string | File;
  image_public_id: string | null;
}>;
