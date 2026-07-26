/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Rule } from 'shared';

/**
 * Counts the total number of rules that will be deleted when deleting a rule, including
 * the rule itself and all its descendants. Does not include parents or siblings.
 * @param rule - The rule to delete
 * @param allRules - All rules in the ruleset
 * @returns The total number of rules that will be deleted
 */
export const countRulesToDelete = (rule: Rule, allRules: Rule[]): number => {
  let count = 1;
  const children = allRules.filter((r) => rule.subRuleIds.includes(r.ruleId));
  for (const child of children) {
    count += countRulesToDelete(child, allRules);
  }
  return count;
};

/**
 * Gets all leaf rules of a given rule (the rule itself if it has no children).
 * Does not include the rule's parent or siblings.
 *
 * @param rule - rule to start from
 * @param allRules - all rules in scope
 * @returns The leaf rules under the given rule, or rule if it is already a leaf
 */
export const getDescendantLeafRules = (rule: Rule, allRules: Rule[]): Rule[] => {
  const children = allRules.filter((r) => r.parentRule?.ruleId === rule.ruleId);
  if (children.length === 0) {
    return [rule];
  }
  return children.flatMap((child) => getDescendantLeafRules(child, allRules));
};

/**
 * Whether a rule is complete. A leaf uses its own completion; a parent is
 * complete only if all of its descendant leaf rules are complete.
 * @param rule - The rule to check
 * @param allRules - All rules in scope
 * @returns True if the rule (or all its leaves) are complete
 */
export const isRuleComplete = (rule: Rule, allRules: Rule[]): boolean => {
  const leafRules = getDescendantLeafRules(rule, allRules);
  return leafRules.every((leafRule) => leafRule.isComplete);
};

/**
 * Status chip label and color for a completion state.
 */
export const getRuleStatusConfig = (isComplete: boolean): { label: string; color: string } => {
  return isComplete ? { label: 'Complete', color: '#4caf50' } : { label: 'Incomplete', color: '#f44336' };
};

/**
 * Collects a rule and all of its descendants, down to the leaf rules.
 */
export const getRuleAndDescendantIds = (ruleId: string, allRules: Rule[]): string[] => {
  const rule = allRules.find((r) => r.ruleId === ruleId);
  if (!rule) {
    return [];
  }

  return [ruleId, ...rule.subRuleIds.flatMap((subId) => getRuleAndDescendantIds(subId, allRules))];
};

/**
 * Collects the ancestors of a rule, from its immediate parent up to the top-level rule.
 */
export const getAncestorIds = (ruleId: string, allRules: Rule[]): string[] => {
  const ancestorIds: string[] = [];
  let current = allRules.find((r) => r.ruleId === ruleId);

  while (current?.parentRule) {
    const parentId = current.parentRule.ruleId;
    ancestorIds.push(parentId);
    current = allRules.find((r) => r.ruleId === parentId);
  }

  return ancestorIds;
};

/**
 * Comparator that orders rules by their rule code numerically, so codes sort
 * as F.2 before F.10 rather than alphabetically
 */
export const compareRuleCodes = (a: Rule, b: Rule): number =>
  a.ruleCode.localeCompare(b.ruleCode, undefined, { numeric: true });

export interface TeamProject {
  projectId: string;
  projectName: string;
  rules: Rule[];
}

export interface TeamRules {
  teamId: string;
  teamName: string;
  projects: TeamProject[];
  unassignedRules: Rule[];
}

/**
 * Groups ruleset's rules by team and project for team view. First groups by team
 * assigned to, then by projects assign to within that team, or unassigned to any
 * project. Finally groups by rules not assigned to any team.
 * Note that rules can be on more than one team and in more than one project for that team.
 */
export const getTeamOrganization = (allRules: Rule[]): { teamRules: TeamRules[]; unassignedToTeam: Rule[] } => {
  const teamMap = new Map<string, TeamRules>();
  const teamProjectMaps = new Map<string, Map<string, TeamProject>>();
  const unassignedToTeam: Rule[] = [];

  // iterate through all rules and organize by team and project
  allRules.forEach((rule) => {
    // rule with no team belongs to the top-level "unassigned to team" bucket.
    if (!rule.teams || rule.teams.length === 0) {
      unassignedToTeam.push(rule);
      return;
    }

    // otherwise place the rule under each team it belongs to
    rule.teams.forEach((team) => {
      // create the team's buckets the first time we see it
      if (!teamMap.has(team.teamId)) {
        teamMap.set(team.teamId, {
          teamId: team.teamId,
          teamName: team.teamName,
          projects: [],
          unassignedRules: []
        });
        teamProjectMaps.set(team.teamId, new Map());
      }

      const teamRules = teamMap.get(team.teamId)!;
      const projectMap = teamProjectMaps.get(team.teamId)!;

      // Keep only the rule's projects that belong to this team. Since rules can be on multiple teams,
      // this ensures projects don't show up under teams they are not a part of
      const projectsForTeam = rule.projects?.filter((project) => project.teamIds.includes(team.teamId)) ?? [];

      // Add the rule under each of its projects, or unassigned to project, for this team
      if (projectsForTeam.length > 0) {
        projectsForTeam.forEach((project) => {
          if (!projectMap.has(project.projectId)) {
            projectMap.set(project.projectId, {
              projectId: project.projectId,
              projectName: project.projectName,
              rules: []
            });
          }
          projectMap.get(project.projectId)!.rules.push(rule);
        });
      } else {
        teamRules.unassignedRules.push(rule);
      }
    });
  });

  teamMap.forEach((teamRules, teamId) => {
    teamRules.projects = Array.from(teamProjectMaps.get(teamId)!.values());
  });

  return { teamRules: Array.from(teamMap.values()), unassignedToTeam };
};

/**
 * Prepares one bucket's rules for the shared RuleRow tree.
 * Ids are prefixed with their bucket since the same rule can live in multiple teams or projects
 */
export const scopeRulesToBucket = (bucketId: string, rules: Rule[]): { rows: Rule[]; rootIds: string[] } => {
  const idsInBucket = new Set(rules.map((rule) => rule.ruleId));
  const bucketPrefixId = (ruleId: string) => `${bucketId}::${ruleId}`;

  // add bucket prefix id to each rule, filtering out subRuleIds that are not in this bucket
  const rows: Rule[] = rules.map((rule) => ({
    ...rule,
    ruleId: bucketPrefixId(rule.ruleId),
    subRuleIds: rule.subRuleIds.filter((id) => idsInBucket.has(id)).map(bucketPrefixId)
  }));

  // find top level rules in this bucket where parentRule is either not set or not in this bucket
  const rootIds = rules
    .filter((rule) => !rule.parentRule || !idsInBucket.has(rule.parentRule.ruleId))
    .map((rule) => bucketPrefixId(rule.ruleId));

  return { rows, rootIds };
};

/**
 * Builds a structural header row (team, project, or "unassigned" section), not a real rule
 */
export const makeSectionRow = (ruleId: string, ruleCode: string, subRuleIds: string[]): Rule => ({
  ruleId,
  ruleCode,
  ruleContent: '',
  imageFileIds: [],
  parentRule: undefined,
  subRuleIds,
  referencedRules: [],
  isComplete: false
});
