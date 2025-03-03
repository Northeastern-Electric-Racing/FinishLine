export interface PartTag {
  partTagId: string;
  name: string;
  colorHexCode: string;
}

export interface PartReviewCommonMistake {
  id: string;
  title: string;
  description: string;
  starred: boolean;
  userCreatedId: string;
}
