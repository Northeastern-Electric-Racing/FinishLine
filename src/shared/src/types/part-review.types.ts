import { User } from './user-types';

export enum Review_Status {
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  IN_REVIEW = 'IN_REVIEW',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED'
}

export interface PartPreview {
  partId: string;
  index: number;
  commonName: string;
  description?: string;
  previewImageLink?: string;
  status: Review_Status;
  tags: PartTag[];
  projectId: string;
  assignees: User[];
  reviewers: User[];
  createdAt: Date;
  userCreated: User;
}

export interface Part extends PartPreview {
  submissions: PartSubmission[];
}

export interface PartSubmission {
  partSubmissionId: string;
  fileIds: string[];
  name: string;
  notes?: string;
  partId: string;
  userCreated: User;
  reviewRequests: PartReviewRequest[];
  reviews: PartReview[];
  createdAt: Date;
}

export interface PartReviewRequest {
  partReviewRequestId: string;
  submissionId: string;
  requester: User;
  reviewerRequested: User;
  createdAt: Date;
}

export interface PartReview {
  partReviewId: string;
  fileIds: string[];
  notes?: string;
  submissionId: string;
  popUps: Part_Review_Popup[];
  completedAt?: Date;
  createdAt: Date;
  userCreated: User;
}

export interface Part_Review_Popup {
  partReviewPopupId: string;
  xCoord: number;
  yCoord: number;
  title: string;
  description: string;
  reviewId: string;
}

export interface PartReviewCommonMistake {
  partReviewCommonMistakeId: string;
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

export interface PartPayload {
  index: number;
  commonName: string;
  description?: string;
  previewImageLink?: string;
  reviewStatus: Review_Status;
  tagIds: string[];
  projectId: string;
  assigneeIds: string[];
}

export interface PartSubmissionPayload {
  fileIds: string[];
  name: string;
  notes?: string;
}

export interface PartReviewRequestPayload {
  requesterId: string;
  reviewRequestedId: string;
}

export interface PartReviewPayload {
  fileIds: string[];
  notes?: string;
  commonMistakeIds: string[];
}
