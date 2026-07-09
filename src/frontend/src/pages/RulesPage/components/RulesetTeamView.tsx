import React, { useMemo } from 'react';
import { Box, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { Rule } from 'shared';
import RuleRow from '../RuleRow';

interface TeamProject {
  projectId: string;
  projectName: string;
  rules: Rule[];
}

interface TeamRules {
  teamId: string;
  teamName: string;
  projects: TeamProject[];
  unassignedRules: Rule[];
}

interface RulesetTeamViewProps {
  allRules: Rule[];
}

/**
 * Groups ruleset's rules by team and project for team view. First groups by team
 * assigned to, then by projects assign to within that team, or unassigned to any
 * project. Finally groups by rules not assigned to any team.
 * Note that rules can be on more than one team and in more than one project for that team.
 */
const getTeamOrganization = (allRules: Rule[]): { teamRules: TeamRules[]; unassignedToTeam: Rule[] } => {
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
const scopeRulesToBucket = (bucketId: string, rules: Rule[]): { rows: Rule[]; rootIds: string[] } => {
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
const makeSectionRow = (ruleId: string, ruleCode: string, subRuleIds: string[]): Rule => ({
  ruleId,
  ruleCode,
  ruleContent: '',
  imageFileIds: [],
  parentRule: undefined,
  subRuleIds,
  referencedRuleIds: [],
  isComplete: false
});

/**
 * Displays rules organized by team and project.
 * Teams, projects, and unassigned sections are all rendered as RuleRows for consistent formatting.
 */
const RulesetTeamView: React.FC<RulesetTeamViewProps> = ({ allRules }) => {
  const theme = useTheme();

  const backgroundColor = theme.palette.background.default;
  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  // recompute row tree only when the rules change
  const { topLevelItems, rowsById } = useMemo(() => {
    const { teamRules, unassignedToTeam } = getTeamOrganization(allRules);

    // real-rule rows (bucket-scoped)
    const ruleRows: Rule[] = [];
    // header rows: teams, projects, and unassigned sections
    const sectionRows: Rule[] = [];
    // top level - one header row per team, plus "unassigned to team"
    const topLevelItems: Rule[] = [];

    teamRules.forEach((team) => {
      const teamRowId = `team-${team.teamId}`;
      const teamChildIds: string[] = [];

      // one section per project, holding that project's assigned rules
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

    return { topLevelItems, rowsById: [...sectionRows, ...ruleRows] };
  }, [allRules]);

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden', backgroundColor }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 8px', backgroundColor }}>
          <TableBody>
            {topLevelItems.map((item) => (
              <RuleRow
                key={item.ruleId}
                rule={item}
                allRules={rowsById}
                rightContent={() => null}
                backgroundColor={tableBackgroundColor}
                textColor={tableTextColor}
                hoverColor={tableHoverColor}
                rowHeight="40px"
                verticalPadding="8px"
                indentRow
                initiallyExpanded={item.ruleId.startsWith('team-')}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RulesetTeamView;
export type { TeamProject, TeamRules };
