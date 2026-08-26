import { Prisma } from '@prisma/client';
import { Rule, ProjectRule, Ruleset, RulesetType, RuleStatus, RuleStatusHistoryEntry } from 'shared';
import {
  RulesetQueryArgs,
  RulePreviewQueryArgs,
  ProjectRuleQueryArgs,
  RuleStatusHistoryQueryArgs
} from '../prisma-query-args/rules.query-args.js';

export const ruleTransformer = (rule: Prisma.RuleGetPayload<RulePreviewQueryArgs>): Rule => {
  return {
    ruleId: rule.ruleId,
    ruleCode: rule.ruleCode,
    ruleContent: rule.ruleContent,
    imageFileIds: rule.imageFileIds,
    parentRule: rule.parentRule
      ? {
          ruleId: rule.parentRule.ruleId,
          ruleCode: rule.parentRule.ruleCode
        }
      : undefined,
    subRuleIds: rule.subRules.map((subRule) => subRule.ruleId),
    referencedRules: rule.referencedRule.map((ref) => ({ ruleId: ref.ruleId, ruleCode: ref.ruleCode })),
    teams: rule.teams?.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName
    })),
    projects: rule.projects?.map((projectRule) => ({
      projectId: projectRule.project.projectId,
      projectName: projectRule.project.wbsElement.name,
      teamIds: projectRule.project.teams.map((team) => team.teamId),
      projectRuleId: projectRule.projectRuleId,
      status: projectRule.status as RuleStatus,
      statusUpdatedBy: projectRule.statusUpdatedBy
        ? {
            firstName: projectRule.statusUpdatedBy.firstName,
            lastName: projectRule.statusUpdatedBy.lastName
          }
        : undefined,
      statusUpdatedAt: projectRule.statusUpdatedAt ?? undefined,
      hasStatusHistory: projectRule._count.statusHistory > 0
    })),
    status: rule.status as RuleStatus,
    statusUpdatedBy: rule.statusUpdatedBy
      ? {
          firstName: rule.statusUpdatedBy.firstName,
          lastName: rule.statusUpdatedBy.lastName
        }
      : undefined,
    statusUpdatedAt: rule.statusUpdatedAt ?? undefined,
    hasStatusHistory: rule._count.statusHistory > 0
  };
};

export const projectRuleTransformer = (projectRule: Prisma.Project_RuleGetPayload<ProjectRuleQueryArgs>): ProjectRule => {
  return {
    projectRuleId: projectRule.projectRuleId,
    rule: ruleTransformer(projectRule.rule),
    projectId: projectRule.projectId,
    status: projectRule.status as RuleStatus,
    statusUpdatedBy: projectRule.statusUpdatedBy
      ? {
          firstName: projectRule.statusUpdatedBy.firstName,
          lastName: projectRule.statusUpdatedBy.lastName
        }
      : undefined,
    statusUpdatedAt: projectRule.statusUpdatedAt ?? undefined,
    hasStatusHistory: projectRule._count.statusHistory > 0
  };
};

export const ruleStatusHistoryTransformer = (
  entry: Prisma.Rule_Status_HistoryGetPayload<RuleStatusHistoryQueryArgs>
): RuleStatusHistoryEntry => {
  return {
    status: entry.status as RuleStatus,
    updatedBy: {
      firstName: entry.updatedBy.firstName,
      lastName: entry.updatedBy.lastName
    },
    updatedAt: entry.dateCreated,
    projectName: entry.projectRule?.project.wbsElement.name
  };
};

export const rulesetTypeTransformer = (rulesetType: any): RulesetType => {
  return {
    rulesetTypeId: rulesetType.rulesetTypeId,
    name: rulesetType.name,
    lastUpdated: rulesetType.lastUpdated,
    revisionFiles: rulesetType.revisionFiles
      ? rulesetType.revisionFiles.filter((ruleset: any) => ruleset.deletedByUserId === null)
      : []
  };
};

export const rulesetTransformer = (ruleset: Prisma.RulesetGetPayload<RulesetQueryArgs>): Ruleset => {
  const rulesWithTeams = ruleset.rules.filter((rule) => rule._count.teams > 0).length;
  const totalRulesLength = ruleset.rules.length;
  const teamsPercentage = totalRulesLength > 0 ? (rulesWithTeams / totalRulesLength) * 100 : 0;

  return {
    fileId: ruleset.fileId,
    rulesetId: ruleset.rulesetId,
    name: ruleset.name,
    dateCreated: ruleset.dateCreated,
    active: ruleset.active,
    assignedPercentage: teamsPercentage,
    rulesetType: rulesetTypeTransformer(ruleset.rulesetType),
    car: {
      carId: ruleset.car.carId,
      name: ruleset.car.wbsElement.name
    },
    ruleAmount: totalRulesLength
  };
};
