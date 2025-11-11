/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';

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
}

export interface Ruleset {
  rulesetId: string;
  fileId: string;
  name: string;
  dateCreated: Date;
  active: boolean;
  rulesetType: RulesetType;
  assignedPercentage: number;
  car: {
    carId: string;
    name: string;
  };
}

export interface Rule {
  ruleId: string;
  ruleCode: string;
  ruleContent: string;
  imageFileIds: string[];
  parentRule?: {
    ruleId: string;
    ruleCode: string;
  };
  subRuleIds: string[];
  referencedRuleIds: string[];
}

export interface RuleStatusChange {
  historyId: string;
  projectRuleId: string;
  userUpdated: User;
  updatedAt: Date;
  newStatus: RuleCompletion;
  note: string;
}

export interface ProjectRule {
  projectRuleId: string;
  rule: Rule;
  projectId: string;
  currentStatus: RuleCompletion;
  statusHistory: RuleStatusChange[];
}

export interface RulesetPreview {
  name: string;
  dateCreated: Date;
  active: boolean;
  assignedPercentage: number;
  car: {
    carId: string;
    name: string;
  };
}
