export type CreateGradeRequestDto = {
  level: number;
  grade: string;
  des?: string;
};

export type UpdateGradeRequestDto = Partial<{
  level: number;
  grade: string;
  des: string;
}>;
