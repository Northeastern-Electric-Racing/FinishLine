import React from 'react';
import { Box, Paper, Table, TableBody, TableContainer } from '@mui/material';
import { ProjectRule, Rule, TeamPreview } from 'shared';
import RuleRow from '../RuleRow';

interface RulesetTeamViewProps {
  allRules: Rule[];
  teamData: Array<{
    team: { teamId: string; teamName: string };
    projectRules: ProjectRule[];
    unassignedTeamRules: Rule[];
    isLoading: boolean;
    isError: boolean;
  }>;
  unassignedToTeam: Rule[];
  isLoading?: boolean;
  overallError?: Error | null;
}

/**
 * Displays rules organized by team and project
 * Teams and projects are rendered as RuleRows for consistent formatting
 */
const RulesetTeamView: React.FC<RulesetTeamViewProps> = ({
  allRules,
  teamData,
  unassignedToTeam,
  isLoading = false,
  overallError = null
}) => {
  const buildHierarchyRules = (): Rule[] => {
    const hierarchyRules: Rule[] = [];

    // group rules for each project
    teamData.forEach((teamItem) => {
      const projectsMap = new Map<string, { projectId: string; rules: Rule[] }>();
      teamItem.projectRules.forEach((pr) => {
        if (!projectsMap.has(pr.projectId)) {
          projectsMap.set(pr.projectId, { projectId: pr.projectId, rules: [] });
        }
        projectsMap.get(pr.projectId)!.rules.push(pr.rule);
      });
      const projects = Array.from(projectsMap.values());

      // create team label row
      const teamRule: Rule = {
        ruleId: `team-${teamItem.team.teamId}`,
        ruleCode: `${teamItem.team.teamName}`,
        ruleContent: '',
        imageFileIds: [],
        parentRule: undefined,
        subRuleIds: [
          ...projects.map((p) => `project-${p.projectId}-${teamItem.team.teamId}`),
          ...(teamItem.unassignedTeamRules.length > 0 ? [`unassigned-project-${teamItem.team.teamId}`] : [])
        ],
        referencedRuleIds: []
      };
      hierarchyRules.push(teamRule);

      projects.forEach((project) => {
        // create project label row
        const projectRule: Rule = {
          ruleId: `project-${project.projectId}-${teamItem.team.teamId}`,
          ruleCode: `Project ${project.projectId}`,
          ruleContent: '',
          imageFileIds: [],
          parentRule: {
            ruleId: `team-${teamItem.team.teamId}`,
            ruleCode: teamItem.team.teamName
          },
          subRuleIds: project.rules.map((r) => r.ruleId),
          referencedRuleIds: []
        };
        hierarchyRules.push(projectRule);
      });

      // unassigned to project section
      if (teamItem.unassignedTeamRules.length > 0) {
        // create unassigned to project label row
        const unassignedProjectRule: Rule = {
          ruleId: `unassigned-project-${teamItem.team.teamId}`,
          ruleCode: 'Unassigned to Project',
          ruleContent: '',
          imageFileIds: [],
          parentRule: {
            ruleId: `team-${teamItem.team.teamId}`,
            ruleCode: teamItem.team.teamName
          },
          subRuleIds: teamItem.unassignedTeamRules.map((r) => r.ruleId),
          referencedRuleIds: []
        };
        hierarchyRules.push(unassignedProjectRule);
      }
    });
    // create unassigned to team label row
    const unassignedTeamRule: Rule = {
      ruleId: 'unassigned-to-team',
      ruleCode: 'Unassigned to Team',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: unassignedToTeam.map((r) => r.ruleId),
      referencedRuleIds: []
    };
    hierarchyRules.push(unassignedTeamRule);
    return hierarchyRules;
  };

  const hierarchyRules = buildHierarchyRules();
  const allRulesCombined = [...hierarchyRules, ...allRules];
  const topLevelRules = hierarchyRules.filter((rule) => !rule.parentRule);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table sx={{ borderCollapse: 'collapse' }}>
          <TableBody sx={{ backgroundColor: '#9d9d9d' }}>
            {topLevelRules.map((rule) => (
              <RuleRow
                key={rule.ruleId}
                rule={rule}
                allRules={allRulesCombined}
                rightContent={() => null}
                backgroundColor="#9d9d9d"
                textColor="#000000"
                hoverColor="#5e5e5e"
                rowHeight="10px"
                verticalPadding="5px"
                initiallyExpanded={rule.ruleId.startsWith('team-')}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RulesetTeamView;
