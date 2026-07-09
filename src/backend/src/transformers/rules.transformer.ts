import { Prisma } from '@prisma/client';
import { Rule, ProjectRule, Ruleset, RulesetType } from 'shared';
import { RulesetQueryArgs, RulePreviewQueryArgs, ProjectRuleQueryArgs } from '../prisma-query-args/rules.query-args.js';

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
    referencedRuleIds: rule.referencedRule.map((ref) => ref.ruleId),
    teams: rule.teams?.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName
    })),
    projects: rule.projects?.map((projectRule) => ({
      projectId: projectRule.project.projectId,
      projectName: projectRule.project.wbsElement.name,
      teamIds: projectRule.project.teams.map((team) => team.teamId)
    })),
    isComplete: rule.isComplete,
    completedBy: rule.completedBy
      ? {
          firstName: rule.completedBy.firstName,
          lastName: rule.completedBy.lastName
        }
      : undefined,
    completedInProject: rule.completedInProject
      ? {
          projectId: rule.completedInProject.projectId,
          projectName: rule.completedInProject.wbsElement.name
        }
      : undefined
  };
};

export const projectRuleTransformer = (projectRule: Prisma.Project_RuleGetPayload<ProjectRuleQueryArgs>): ProjectRule => {
  return {
    projectRuleId: projectRule.projectRuleId,
    rule: ruleTransformer(projectRule.rule),
    projectId: projectRule.projectId
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
