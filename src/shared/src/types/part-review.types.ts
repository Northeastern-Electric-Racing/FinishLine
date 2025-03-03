export interface PartReviewCommonMistake {
  id: string;
  title: string;
  description: string;
  starred: boolean;
  userCreatedId: string;
}

export interface PartTag {
  partTagId: string;
  name: string;
  colorHexCode: string;
}
