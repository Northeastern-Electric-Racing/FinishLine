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
  }>;
  status: RuleStatus;
  statusUpdatedBy?: {
    firstName: string;
    lastName: string;
  };
  statusUpdatedAt?: Date;
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
