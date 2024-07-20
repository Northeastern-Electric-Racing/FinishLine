/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';

export interface Milestone {
  milestoneId: string
  name: string
  dateOfEvent: Date
  description?: string
  userCreated: User
  userDeleted?: User
  dateCreated: Date
  dateDeleted?: Date
}