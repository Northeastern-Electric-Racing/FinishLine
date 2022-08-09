/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProjectPreview } from './project-types';
import { UserPreview } from './user-types';

export interface Risk {
  id: String;
  project: ProjectPreview;
  detail: string;
  isResolved: boolean;
  dateDeleted?: Date;
  dateCreated: Date;
  createdBy: UserPreview;
  resolvedBy?: UserPreview;
  resolvedAt?: Date;
  deletedBy?: UserPreview;
}
