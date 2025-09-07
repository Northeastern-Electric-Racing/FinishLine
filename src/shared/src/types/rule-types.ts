/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';
import { ProjectPreview } from './project-types';

export enum RuleCompletion {
  REVIEW = 'REVIEW',
  INCOMPLETE = 'INCOMPLETE',
  COMPLETED = 'COMPLETED'
}

export interface RulesetType {
  rulesetTypeId: string;
  name: string;
  lastUpdated: Date;
  revisionFiles: Ruleset[];
  createdBy: User;
  deletedBy?: User;
}

export interface Ruleset {
  rulesetId: string;
  fileId: string;
  name: string;
  dateCreated: Date;
  active: boolean;
  rulesetType: RulesetType;
  rules: Rule[];
  car: {
    carId: string;
    name: string;
  };
  createdBy: User;
  deletedBy?: User;
}

export interface Rule {
  ruleId: string;
  ruleCode?: string;
  ruleContent: string;
  imageFileIds: string[];
  ruleset: {
    rulesetId: string;
    name: string;
  };
  parentRule?: {
    ruleId: string;
    ruleCode?: string;
  };
  subRules: Rule[];
  referencedRules: Rule[];
  referencedBy: Rule[];
  projects: ProjectRule[];
  dateCreated: Date;
  dateUpdated?: Date;
  dateDeleted?: Date;
  createdBy: User;
  updatedBy?: User;
  deletedBy?: User;
}

export interface RuleStatusChange {
  historyId: string;
  projectRule: ProjectRule;
  userUpdated: User;
  updatedAt: Date;
  oldStatus?: RuleCompletion;
  newStatus: RuleCompletion;
  note: string;
}

export interface ProjectRule {
  projectRuleId: string;
  rule: Rule;
  project: ProjectPreview;
  statusHistory: RuleStatusChange[];
}
