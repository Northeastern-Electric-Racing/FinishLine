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
import { useState, useEffect, useRef } from 'react';
import { Rule, TeamPreview } from 'shared';
import { useAllTeams } from '../../hooks/teams.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useToast } from '../../hooks/toasts.hooks';
import { NERButton } from '../../components/NERButton';
import NERModal from '../../components/NERModal';
import WarningIcon from '@mui/icons-material/Warning';
import RuleRow from './RuleRow';
import { useBulkToggleRuleTeam, useGetTopLevelRules, useFetchFullRuleTree } from '../../hooks/rules.hooks';
import { compareRuleCodes } from '../../utils/rules.utils';
import { getAncestorIds, getRuleAndDescendantIds, getDescendantLeafRules } from '../../utils/rules.utils';

/*
 * Props for the team row.
 */
interface TeamRowProps {
  team: TeamPreview;
  backgroundColor: string;
  hoverColor: string;
  onClick: () => void;
}

/**
 * Row component for displaying a team in the teams table.
 */
const TeamRow: React.FC<TeamRowProps> = ({ team, backgroundColor, hoverColor, onClick }) => {
  const theme = useTheme();
  return (
    <TableRow
      onClick={onClick}
      sx={{
        borderBottom: '1px solid #7d7d7d',
        backgroundColor,
        '&:hover': { backgroundColor: hoverColor },
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
          color: theme.palette.common.black
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
const AssignRulesTab: React.FC = () => {
  const theme = useTheme();
  const history = useHistory();
  const { rulesetId } = useParams<{ rulesetId: string }>();
  const location = useLocation();
  const toast = useToast();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Set<string>>(new Set());
  const [originalAssignments, setOriginalAssignments] = useState<Set<string>>(new Set());
  // unassign impact for the amount of project rules that would be deleted by this action, used to warn the user before saving
  const [pendingToggles, setPendingToggles] = useState<Array<{ ruleId: string; teamId: string }> | null>(null);
  const [unassignImpact, setUnassignImpact] = useState<{ ruleCount: number; projectCount: number }>({
    ruleCount: 0,
    projectCount: 0
  });

  const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErrorData } = useAllTeams();
  const { mutate: bulkToggle, isLoading: isSaving } = useBulkToggleRuleTeam();

  // Top-level rules render immediately; subrules are fetched as rows are expanded
  const {
    data: topLevelRules,
    isError: isTopLevelRulesError,
    error: topLevelRulesError,
    isLoading: isTopLevelRulesLoading
  } = useGetTopLevelRules(rulesetId);

  // Loaded fresh on every mount so it reflects any edits just made
  const fetchFullRuleTree = useFetchFullRuleTree(rulesetId);
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchFullRuleTree().then((loadedRules) => {
      if (!cancelled) setRules(loadedRules);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchFullRuleTree]);

  // background refetches ensure current toggles remain
  const hasPendingChangesRef = useRef(false);

  // Reload when rule data changes, unless the user has unsaved toggles pending
  useEffect(() => {
    if (!teams || teams.length === 0) return;

    if (!hasPendingChangesRef.current) {
      const initialAssignments = new Set<string>();
      rules.forEach((rule) => {
        rule.teams?.forEach((team) => {
          initialAssignments.add(`${team.teamId}:${rule.ruleId}`);
        });
      });

      setOriginalAssignments(initialAssignments);
      setAssignments(new Set(initialAssignments));
    }

    if (!selectedTeamId) {
      const teamIdParam = new URLSearchParams(location.search).get('teamId');
      if (teamIdParam && teams.some((team) => team.teamId === teamIdParam)) {
        setSelectedTeamId(teamIdParam);
      }
    }
  }, [rules, teams, location.search, selectedTeamId]);

  const handleTeamSelect = (teamId: string) => setSelectedTeamId(teamId);

  const isRuleAssigned = (ruleId: string) => {
    if (!selectedTeamId) return false;
    return assignments.has(`${selectedTeamId}:${ruleId}`);
  };

  // A rule is considered selected when all of its leaf rules are assigned to the current team.
  const isRuleSelected = (rule: Rule) => {
    const leafIds = getDescendantLeafRules(rule, rules).map((leaf) => leaf.ruleId);
    return leafIds.length > 0 && leafIds.every((id) => isRuleAssigned(id));
  };

  // Shared highlight logic for both the team rows and rule rows.
  const rowBackgroundColor = (isSelected: boolean) => (isSelected ? '#b36b6b' : theme.palette.grey[500]);
  const rowHoverColor = (isSelected: boolean) => (isSelected ? '#a05858' : theme.palette.grey[700]);

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

    // Assign the clicked rule and all of its descendants, not just leaves, so
    // every rule in the subtree gets its own team relation
    const subtreeIds = getRuleAndDescendantIds(ruleId, rules);
    if (subtreeIds.length === 0) {
      return;
    }

    const newAssignments = new Set(assignments);
    const teamAssignmentKey = (id: string) => `${selectedTeamId}:${id}`; // needed since the same rule can be assigned to multiple teams
    const allSelected = subtreeIds.every((id) => newAssignments.has(teamAssignmentKey(id)));

    if (allSelected) {
      // Unassign the rule and its descendants
      subtreeIds.forEach((id) => newAssignments.delete(teamAssignmentKey(id)));

      // Drop each parent that no longer has ANY assigned descendant.
      for (const ancestorId of getAncestorIds(ruleId, rules)) {
        const hasAssignedDescendant = getRuleAndDescendantIds(ancestorId, rules).some(
          (id) => id !== ancestorId && newAssignments.has(teamAssignmentKey(id))
        );
        // Stop at the first ancestor still holding an assigned leaf rule, since every
        // higher ancestor shares that descendant and must remain assigned.
        if (hasAssignedDescendant) {
          break;
        }
        newAssignments.delete(teamAssignmentKey(ancestorId));
      }
    } else {
      // Assign the rule, its descendants, and all of its ancestors so there is
      // always a path to the top-level rule
      subtreeIds.forEach((id) => newAssignments.add(teamAssignmentKey(id)));
      getAncestorIds(ruleId, rules).forEach((id) => newAssignments.add(teamAssignmentKey(id)));
    }

    hasPendingChangesRef.current = true;
    setAssignments(newAssignments);
  };

  // Counts the amount of rules and projects that would lose their project rule
  // assignments when the given team-unassignments are saved
  const getUnassignImpact = (removedKeys: string[]): { ruleCount: number; projectCount: number } => {
    const affectedRuleIds = new Set<string>();
    const affectedProjectIds = new Set<string>();

    removedKeys.forEach((key) => {
      const [teamId, ruleId] = key.split(':');
      const rule = rules.find((r) => r.ruleId === ruleId);
      // teams the rule will remain on after this save
      const remainingTeamIds = [...assignments]
        .filter((assignmentKey) => assignmentKey.endsWith(`:${ruleId}`))
        .map((assignmentKey) => assignmentKey.split(':')[0]);

      rule?.projects?.forEach((project) => {
        if (!project.teamIds.includes(teamId)) return;
        // A project can belong to multiple teams
        // Therefore a project only loses the rule if the rule no longer shares ANY team with it
        const sharesRemainingTeam = project.teamIds.some((id) => remainingTeamIds.includes(id));
        if (!sharesRemainingTeam) {
          affectedRuleIds.add(ruleId);
          affectedProjectIds.add(project.projectId);
        }
      });
    });

    return { ruleCount: affectedRuleIds.size, projectCount: affectedProjectIds.size };
  };

  const executeToggles = (toggles: Array<{ ruleId: string; teamId: string }>) => {
    bulkToggle(toggles, {
      onSuccess: () => {
        hasPendingChangesRef.current = false;
        history.push(routes.RULESET_EDIT.replace(':rulesetId', rulesetId));
      },
      onSettled: () => {
        setPendingToggles(null);
      }
    });
  };

  const handleSaveAndExit = () => {
    const toAdd = [...assignments].filter((key) => !originalAssignments.has(key));
    const toRemove = [...originalAssignments].filter((key) => !assignments.has(key));

    if (toAdd.length === 0 && toRemove.length === 0) {
      toast.info('No changes to save');
      return;
    }

    // Build array of toggles to execute
    const toggles = [...toAdd, ...toRemove].map((key) => {
      const [teamId, ruleId] = key.split(':');
      return { ruleId, teamId };
    });

    // Warn before saving if unassignments would remove existing project assignments
    const impact = getUnassignImpact(toRemove);
    if (impact.ruleCount > 0) {
      setUnassignImpact(impact);
      setPendingToggles(toggles);
      return;
    }

    executeToggles(toggles);
  };

  const handleConfirmSave = () => {
    if (pendingToggles) {
      executeToggles(pendingToggles);
    }
  };

  if (teamsError) {
    return <ErrorPage message={teamsErrorData?.message} error={teamsErrorData} />;
  }

  if (isTopLevelRulesError) {
    return <ErrorPage error={topLevelRulesError} />;
  }

  if (teamsLoading || isTopLevelRulesLoading || !topLevelRules) {
    return <LoadingIndicator />;
  }

  const sortedTopLevelRules = [...topLevelRules].sort(compareRuleCodes);

  return (
    <Box sx={{ paddingBottom: '100px' }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Teams Column */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 2, color: theme.palette.text.primary }}>
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
              <TableBody sx={{ backgroundColor: theme.palette.grey[500] }}>
                {teams?.map((team) => (
                  <TeamRow
                    key={team.teamId}
                    team={team}
                    backgroundColor={rowBackgroundColor(selectedTeamId === team.teamId)}
                    hoverColor={rowHoverColor(selectedTeamId === team.teamId)}
                    onClick={() => handleTeamSelect(team.teamId)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Rules Column */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 2, color: theme.palette.text.primary }}>
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
              <TableBody sx={{ backgroundColor: theme.palette.grey[500] }}>
                {sortedTopLevelRules.map((rule) => (
                  <RuleRow
                    key={rule.ruleId}
                    rule={rule}
                    backgroundColor={(r) => rowBackgroundColor(isRuleSelected(r))}
                    hoverColor={(r) => rowHoverColor(isRuleSelected(r))}
                    textColor={theme.palette.common.black}
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
            borderBottom: `2px solid ${theme.palette.divider}`,
            mb: 2,
            ml: '20px'
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: '30px', pb: 2 }}>
          <NERButton variant="contained" sx={{ color: '#ededed' }} onClick={handleSaveAndExit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save & Exit'}
          </NERButton>
        </Box>
      </Box>

      <NERModal
        open={pendingToggles !== null}
        onHide={() => setPendingToggles(null)}
        title="Confirm Unassignment"
        cancelText="Cancel"
        submitText="Save"
        onSubmit={handleConfirmSave}
        disabled={isSaving}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ color: '#ef4345', fontSize: 30 }} />
          <Typography sx={{ fontSize: '1rem' }}>
            This will remove {unassignImpact.ruleCount} rule{unassignImpact.ruleCount === 1 ? '' : 's'} from{' '}
            {unassignImpact.projectCount} project{unassignImpact.projectCount === 1 ? '' : 's'}.
          </Typography>
        </Box>
      </NERModal>
    </Box>
  );
};

export default AssignRulesTab;
