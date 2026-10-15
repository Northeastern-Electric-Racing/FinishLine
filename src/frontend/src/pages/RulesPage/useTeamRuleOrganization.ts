/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMemo } from 'react';
import { Rule } from 'shared';
import { getTeamOrganization, scopeRulesToBucket, makeSectionRow } from '../../utils/rules.utils';

/**
 * Regroups a ruleset's rules by team and project into a rule row tree
 */
export const useTeamRuleOrganization = (allRules: Rule[]) => {
  return useMemo(() => {
    const { teamRules, unassignedToTeam } = getTeamOrganization(allRules);

    // real-rule rows (bucket-scoped)
    const ruleRows: Rule[] = [];
    // header rows: teams, projects, and unassigned sections
    const sectionRows: Rule[] = [];
    // top level: one header row per team, plus "unassigned to team"
    const topLevelItems: Rule[] = [];

    teamRules.forEach((team) => {
      const teamRowId = `team-${team.teamId}`;
      const teamChildIds: string[] = [];

      // one section per project, holding the project's assigned rules
      team.projects.forEach((project) => {
        const projectRowId = `project-${team.teamId}-${project.projectId}`;
        const { rows, rootIds } = scopeRulesToBucket(projectRowId, project.rules);
        ruleRows.push(...rows);
        sectionRows.push(makeSectionRow(projectRowId, project.projectName, rootIds));
        teamChildIds.push(projectRowId);
      });

      // one section for rules on the team but assigned to no project
      if (team.unassignedRules.length > 0) {
        const unassignedRowId = `team-${team.teamId}-unassigned`;
        const { rows, rootIds } = scopeRulesToBucket(unassignedRowId, team.unassignedRules);
        ruleRows.push(...rows);
        sectionRows.push(makeSectionRow(unassignedRowId, 'Unassigned Rules - Unassigned to Project', rootIds));
        teamChildIds.push(unassignedRowId);
      }

      const teamRow = makeSectionRow(teamRowId, team.teamName, teamChildIds);
      sectionRows.push(teamRow);
      topLevelItems.push(teamRow);
    });

    // top-level for rules unassigned to any team
    if (unassignedToTeam.length > 0) {
      const unassignedToTeamRowId = 'unassigned-to-team';
      const { rows, rootIds } = scopeRulesToBucket(unassignedToTeamRowId, unassignedToTeam);
      ruleRows.push(...rows);
      const unassignedToTeamRow = makeSectionRow(unassignedToTeamRowId, 'Unassigned Rules - Unassigned to Team', rootIds);
      sectionRows.push(unassignedToTeamRow);
      topLevelItems.push(unassignedToTeamRow);
    }

    // unassigned headers do not need rule content, "rule code" can span full width
    return {
      topLevelItems,
      rowsById: [...sectionRows, ...ruleRows],
      actualRuleIds: new Set<string>(ruleRows.map((r) => r.ruleId))
    };
  }, [allRules]);
};
