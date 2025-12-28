/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import { Rule, TeamPreview } from 'shared';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHistory, useParams } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useToast } from '../../hooks/toasts.hooks';
import { NERButton } from '../../components/NERButton';
import RuleRow from './RuleRow';

/*
 * Props for the assign rules tab.
 */
interface AssignRulesTabProps {
  rules: Rule[];
}

const getLeafRuleIds = (ruleId: string, allRules: Rule[]): string[] => {
  const rule = allRules.find((r) => r.ruleId === ruleId);
  if (!rule) {
    return [];
  }

  if (rule.subRuleIds.length === 0) {
    return [ruleId];
  }

  return rule.subRuleIds.flatMap((subId) => getLeafRuleIds(subId, allRules));
};

/*
 * Props for the team row.
 */
interface TeamRowProps {
  team: TeamPreview;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Row component for displaying a team in the teams table.
 */
const TeamRow: React.FC<TeamRowProps> = ({ team, isSelected, onClick }) => {
  return (
    <TableRow
      onClick={onClick}
      sx={{
        borderBottom: '1px solid #7d7d7d',
        backgroundColor: isSelected ? '#b36b6b' : '#CECECE',
        '&:hover': { backgroundColor: isSelected ? '#a05858' : '#5e5e5e' },
        cursor: 'pointer',
        '&:last-child': { borderBottom: 'none' }
      }}
    >
      <TableCell
        sx={{
          fontSize: '16px',
          padding: '8px 16px',
          backgroundColor: 'inherit',
          borderBottom: 'none',
          color: '#000000'
        }}
      >
        {team.teamName}
      </TableCell>
    </TableRow>
  );
};

/**
 * Tab component for assigning rules to teams.
 * Displays teams and rules side-by-side for selection.
 */
const AssignRulesTab: React.FC<AssignRulesTabProps> = ({ rules }) => {
  const theme = useTheme();
  const history = useHistory();
  const { rulesetId } = useParams<{ rulesetId: string }>();
  const toast = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [originalAssignments, setOriginalAssignments] = useState<Set<string>>(new Set());

  const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErrorData } = useAllTeams();

  // TODO: Fetch all team assignments on mount and populate originalAssignments and assignments
  // Not implemented yet since we do not use an actual ruleset yet

  const handleTeamSelect = (teamId: string) => setSelectedTeamId(teamId);

  const isRuleAssigned = (ruleId: string) => {
    if (!selectedTeamId) return false;
    return assignments.has(`${selectedTeamId}:${ruleId}`);
  };

  const getAssignedTeamNames = (ruleId: string): string[] => {
    if (!teams) return [];
    const assignedTeamIds = [...assignments].filter((key) => key.endsWith(`:${ruleId}`)).map((key) => key.split(':')[0]);
    return teams.filter((t) => assignedTeamIds.includes(t.teamId)).map((t) => t.teamName);
  };

  const renderTeamTags = (ruleId: string) => {
    const teamNames = getAssignedTeamNames(ruleId);
    if (teamNames.length === 0) return null;
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {teamNames.map((name) => (
          <Chip
            key={name}
            label={name}
            size="small"
            sx={{
              height: '18px',
              fontSize: '11px',
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary
            }}
          />
        ))}
      </Box>
    );
  };

  const handleRuleToggle = (ruleId: string) => {
    if (!selectedTeamId) {
      toast.error('Please select a team first');
      return;
    }

    const leafIds = getLeafRuleIds(ruleId, rules);
    if (leafIds.length === 0) {
      return;
    }

    const newAssignments = new Set(assignments);
    let allSelected = true;
    for (const id of leafIds) {
      if (!newAssignments.has(`${selectedTeamId}:${id}`)) {
        allSelected = false;
        break;
      }
    }

    for (const id of leafIds) {
      const key = `${selectedTeamId}:${id}`;
      if (allSelected) {
        newAssignments.delete(key);
      } else {
        newAssignments.add(key);
      }
    }

    setAssignments(newAssignments);
  };

  const handleSaveAndExit = () => {
    const toAdd = [...assignments].filter((key) => !originalAssignments.has(key));
    const toRemove = [...originalAssignments].filter((key) => !assignments.has(key));

    if (toAdd.length === 0 && toRemove.length === 0) {
      toast.info('No changes to save');
      return;
    }

    // TODO: Save changes via backend
    if (toAdd.length > 0 || toRemove.length > 0) {
      toast.success(`Placeholder: Would save ${toAdd.length} additions and ${toRemove.length} removals`);
    }

    history.push(`${routes.RULES}/${rulesetId}`);
  };

  if (teamsLoading) {
    return <LoadingIndicator />;
  }

  if (teamsError) {
    return <ErrorPage message={teamsErrorData?.message} error={teamsErrorData} />;
  }

  const topLevelRules = rules.filter((rule) => !rule.parentRule);

  return (
    <Box sx={{ paddingBottom: '100px' }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Teams Column */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 2, color: '#ffffff' }}>
            Teams:
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '8px',
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto'
            }}
          >
            <Table sx={{ borderCollapse: 'collapse' }}>
              <TableBody sx={{ backgroundColor: '#CECECE' }}>
                {teams?.map((team) => (
                  <TeamRow
                    key={team.teamId}
                    team={team}
                    isSelected={selectedTeamId === team.teamId}
                    onClick={() => handleTeamSelect(team.teamId)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Rules Column */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 2, color: '#ffffff' }}>
            Rules:
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: '8px',
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 300px)',
              overflowY: 'auto'
            }}
          >
            <Table sx={{ borderCollapse: 'collapse' }}>
              <TableBody sx={{ backgroundColor: '#CECECE' }}>
                {topLevelRules.map((rule) => (
                  <RuleRow
                    key={rule.ruleId}
                    rule={rule}
                    allRules={rules}
                    backgroundColor={(r) => {
                      const isLeaf = r.subRuleIds.length === 0;
                      return isLeaf && isRuleAssigned(r.ruleId) ? '#b36b6b' : '#CECECE';
                    }}
                    hoverColor={(r) => {
                      const isLeaf = r.subRuleIds.length === 0;
                      return isLeaf && isRuleAssigned(r.ruleId) ? '#a05858' : '#5e5e5e';
                    }}
                    textColor="#000000"
                    onRowClick={(r) => handleRuleToggle(r.ruleId)}
                    middleContent={() => null}
                    rightContent={(r) => renderTeamTags(r.ruleId)}
                    verticalPadding="8px"
                    leftWidth="70%"
                    middleWidth="0%"
                    rightWidth="30%"
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Save & Exit Button */}
      <Box
        sx={{
          backgroundColor: '#121313',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%'
        }}
      >
        <Box
          sx={{
            borderBottom: '2px solid white',
            mb: 2,
            ml: '30px'
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: '30px', pb: 1 }}>
          <NERButton
            variant="contained"
            onClick={handleSaveAndExit}
            sx={{
              backgroundColor: '#dd514c',
              '&:hover': { backgroundColor: '#c74340' }
            }}
          >
            Save & Exit
          </NERButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AssignRulesTab;
