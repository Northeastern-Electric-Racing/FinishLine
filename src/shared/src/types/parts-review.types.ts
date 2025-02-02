import { User } from './user-types';

export interface PartPreview {
  id: string;
  index: number;
  commonName: string;
  description?: string;
  previewImageLink?: string;
  status: PartReviewStatus;
  tags: PartTag[];
  projectId: string;
  assignees: User[];
  history: string[];
  createdAt: Date;
  updatedAt: Date;
  userCreatedId: string;
}

export interface Part extends PartPreview {
  submissions: PartSubmission[];
  reviews: PartReview[];
}

export enum PartReviewStatus {
  NA = 'NA',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  IN_REVIEW = 'IN_REVIEW',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED'
}

export interface PartTag {
  id: string;
  name: string;
  color: string;
}

export interface PartSubmission {
  id: string;
  files: string[];
  name: string;
  notes?: string;
  part: Part;
  createdAt: Date;
  updatedAt: Date;
  userCreated: User;
  review: PartReview[];
}

export interface PartReview {
  id: string;
  files: string[];
  notes?: string;
  submission: PartSubmission;
  popUps: PartReviewPopUp[];
  createdAt: Date;
  updatedAt: Date;
  userCreated: User;
}

export interface PartReviewPopUp {
  id: string;
  xCoord: number;
  yCoord: number;
  title: string;
  description: string;
  review: PartReview;
  createdAt: Date;
  updatedAt: Date;
}
