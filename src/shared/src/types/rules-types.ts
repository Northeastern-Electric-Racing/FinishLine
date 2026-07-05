/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

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
  referencedRuleIds: string[];
  teams?: Array<{
    teamId: string;
    teamName: string;
  }>;
  isComplete: boolean;
  completedBy?: {
    firstName: string;
    lastName: string;
  };
  completedInProject?: { projectId: string; projectName: string };
}

export interface ProjectRule {
  projectRuleId: string;
  rule: Rule;
  projectId: string;
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
