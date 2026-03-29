export type CreatePositionRequestDto = {
  category: string;
  des?: string;
};

export type UpdatePositionRequestDto = Partial<{
  category: string;
  des: string;
}>;
