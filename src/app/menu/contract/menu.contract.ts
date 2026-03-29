export type MenuEntity = {
  id: number;
  name: string;
  path: string;
  icon: string | null;
  parent_id: number | null;
  created_at: Date;
  updated_at: Date;
};
