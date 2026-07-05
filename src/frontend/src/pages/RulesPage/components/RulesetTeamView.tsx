import React from 'react';
import { Box, Paper, Table, TableBody, TableContainer } from '@mui/material';
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
 * Organizes rules by team and project assignments.
 * Rules without team assignments are shown in the unassigned section.
 */
const getTeamOrganization = (allRules: Rule[]): { teamRules: TeamRules[]; unassignedToTeam: Rule[] } => {
  const teamMap = new Map<string, TeamRules>();
  const unassignedToTeam: Rule[] = [];

  // Iterate through all rules and organize by team
  allRules.forEach((rule) => {
    if (!rule.teams || rule.teams.length === 0) {
      // Only add to unassigned if it's a top-level rule (no parent)
      if (!rule.parentRule) {
        unassignedToTeam.push(rule);
      }
    } else {
      // Add rule to each assigned team (includes both parents and children)
      rule.teams.forEach((team) => {
        if (!teamMap.has(team.teamId)) {
          teamMap.set(team.teamId, {
            teamId: team.teamId,
            teamName: team.teamName,
            projects: [],
            unassignedRules: []
          });
        }

        const teamRules = teamMap.get(team.teamId)!;
        if (!rule.parentRule) {
          teamRules.unassignedRules.push(rule);
        }
      });
    }
  });

  return { teamRules: Array.from(teamMap.values()), unassignedToTeam };
};

/**
 * Displays rules organized by team and project
 * Teams and projects are rendered as RuleRows for consistent formatting
 */
const RulesetTeamView: React.FC<RulesetTeamViewProps> = ({ allRules }) => {
  const { teamRules, unassignedToTeam } = getTeamOrganization(allRules);

  // Convert teams to mock rules for rendering with RuleRow
  const teamRulesAsRules: Rule[] = teamRules.map((team) => ({
    ruleId: `team-${team.teamId}`,
    ruleCode: `${team.teamName}`,
    ruleContent: '',
    imageFileIds: [],
    parentRule: undefined,
    subRuleIds: [
      ...team.projects.map((p) => `project-${p.projectId}`),
      ...(team.unassignedRules.length > 0 ? [`team-${team.teamId}-unassigned`] : [])
    ],
    referencedRuleIds: [],
    isComplete: false
  }));

  // Convert projects to mock rules for rendering with RuleRow
  const projectRulesAsRules: Rule[] = teamRules.flatMap((team) =>
    team.projects.map((project) => ({
      ruleId: `project-${project.projectId}`,
      ruleCode: `${project.projectName}`,
      ruleContent: '',
      imageFileIds: [],
      parentRule: {
        ruleId: `team-${team.teamId}`,
        ruleCode: `${team.teamName}`
      },
      subRuleIds: project.rules.map((r) => r.ruleId),
      referencedRuleIds: [],
      isComplete: false
    }))
  );

  // Convert unassigned to project sections to mock rules
  const unassignedToProjectRules: Rule[] = teamRules
    .filter((team) => team.unassignedRules.length > 0)
    .map((team) => ({
      ruleId: `team-${team.teamId}-unassigned`,
      ruleCode: 'Unassigned Rules - Unassigned to Project',
      ruleContent: '',
      imageFileIds: [],
      parentRule: {
        ruleId: `team-${team.teamId}`,
        ruleCode: `${team.teamName}`
      },
      subRuleIds: team.unassignedRules.map((r) => r.ruleId),
      referencedRuleIds: [],
      isComplete: false
    }));

  // Create unassigned to team mock rule
  const unassignedToTeamRule: Rule | null =
    unassignedToTeam.length > 0
      ? {
          ruleId: 'unassigned-to-team',
          ruleCode: 'Unassigned Rules - Unassigned to Team',
          ruleContent: '',
          imageFileIds: [],
          parentRule: undefined,
          subRuleIds: unassignedToTeam.map((r) => r.ruleId),
          referencedRuleIds: [],
          isComplete: false
        }
      : null;

  // mock team/project rules + actual rules
  const allRulesIncludingMock = [
    ...teamRulesAsRules,
    ...projectRulesAsRules,
    ...unassignedToProjectRules,
    ...(unassignedToTeamRule ? [unassignedToTeamRule] : []),
    ...allRules
  ];

  // Top level items are teams and unassigned to team
  const topLevelItems = [...teamRulesAsRules, ...(unassignedToTeamRule ? [unassignedToTeamRule] : [])];

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table sx={{ borderCollapse: 'collapse' }}>
          <TableBody sx={{ backgroundColor: '#9d9d9d' }}>
            {topLevelItems.map((item) => (
              <RuleRow
                key={item.ruleId}
                rule={item}
                allRules={allRulesIncludingMock}
                rightContent={() => null}
                backgroundColor="#9d9d9d"
                textColor="#000000"
                hoverColor="#5e5e5e"
                rowHeight="10px"
                verticalPadding="5px"
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
