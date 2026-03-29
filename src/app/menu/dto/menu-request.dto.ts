export type CreateMenuRequestDto = {
  name: string;
  path: string;
  icon?: string | null;
  parent_id?: number | null;
};

export type UpdateMenuRequestDto = Partial<{
  name: string;
  path: string;
  icon: string | null;
  parent_id: number | null;
}>;
