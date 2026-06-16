/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types.js';

export interface FrequentlyAskedQuestion {
  faqId: string;
  question: string;
  answer: string;
  userCreated: User;
  userDeleted?: User;
  dateCreated: Date;
  dateDeleted?: Date;
  isOnRecruitingDashboard: boolean;
  isOnNewMemberDashboard: boolean;
  isOnPartReviewPage: boolean;
}

export enum GuestDefinitionType {
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  INFO_PAGE = 'INFO_PAGE'
}

export interface GuestDefinition {
  definitionId: string;
  term: string;
  description: string;
  order: number;
  type: GuestDefinitionType;
  buttonText?: string;
  buttonLink?: string;
  icon?: string;
}
