export type DisseminationDetailEntity = {
  id: number;
  disseminations_id: number;
  basis: string | null;
  material: string | null;
  date: Date | null;
  location: string | null;
  methode: string | null;
  participants: string | null;
  result: string | null;
  image: string | null;
  image_public_id: string | null;
  created_at: Date;
  updated_at: Date;
};
