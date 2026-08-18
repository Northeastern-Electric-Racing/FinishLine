/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export enum RuleStatus {
  PENDING = 'PENDING',
  PASS = 'PASS',
  FAIL = 'FAIL'
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
  ruleAmount: number;
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
  referencedRules: Array<{
    ruleId: string;
    ruleCode: string;
  }>;
  teams?: Array<{
    teamId: string;
    teamName: string;
  }>;
  projects?: Array<{
    projectId: string;
    projectName: string;
    teamIds: string[];
    projectRuleId: string;
    status: RuleStatus;
    statusUpdatedBy?: {
      firstName: string;
      lastName: string;
    };
    statusUpdatedAt?: Date;
    hasStatusHistory: boolean;
  }>;
  status: RuleStatus;
  statusUpdatedBy?: {
    firstName: string;
    lastName: string;
  };
  statusUpdatedAt?: Date;
  // true if this rule (general-view status, or its status in any project) has ever been marked PASS or FAIL
  hasStatusHistory: boolean;
}

export interface ProjectRule {
  projectRuleId: string;
  rule: Rule;
  projectId: string;
  status: RuleStatus;
  statusUpdatedBy?: {
    firstName: string;
    lastName: string;
  };
  statusUpdatedAt?: Date;
  // true if this rule has ever been marked PASS or FAIL within this specific project
  hasStatusHistory: boolean;
}

export interface RuleStatusHistoryEntry {
  status: RuleStatus;
  updatedBy: {
    firstName: string;
    lastName: string;
  };
  updatedAt: Date;
  projectName?: string;
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
