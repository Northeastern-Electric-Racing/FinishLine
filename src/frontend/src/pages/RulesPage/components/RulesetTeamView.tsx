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
  teamRules: TeamRules[];
  unassignedToTeam: Rule[];
}

/**
 * Displays rules organized by team and project
 * Teams and projects are rendered as RuleRows for consistent formatting
 */
const RulesetTeamView: React.FC<RulesetTeamViewProps> = ({ allRules, teamRules, unassignedToTeam }) => {
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
    referencedRuleIds: []
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
      referencedRuleIds: []
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
      referencedRuleIds: []
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
          referencedRuleIds: []
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
