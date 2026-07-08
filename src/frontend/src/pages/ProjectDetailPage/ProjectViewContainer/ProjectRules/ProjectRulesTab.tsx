/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Tab,
  Tabs as MuiTabs,
  Table,
  TableBody,
  TableContainer,
  Paper,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import { Project, ProjectRule, Rule } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import RuleRow from '../../../RulesPage/RuleRow';
import UpdateStatusPopover from './UpdateStatusPopover';
import AddRuleModal from './AddProjectRuleModal';
import {
  useAllRulesetTypes,
  useActiveRuleset,
  useProjectRules,
  useSetRuleCompletion,
  useCreateProjectRule
} from '../../../../hooks/rules.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { InfoOutlined } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../../utils/routes';
import RuleStatusTag from '../../../RulesPage/components/RuleStatusTag';

interface ProjectRulesTabProps {
  project: Project;
}

export const ProjectRulesTab = ({ project }: ProjectRulesTabProps) => {
  const toast = useToast();
  const theme = useTheme();
  const history = useHistory();

  // State for modals and popovers
  const [selectedRulesetTypeIndex, setSelectedRulesetTypeIndex] = useState(0);
  const [statusPopoverAnchor, setStatusPopoverAnchor] = useState<HTMLElement | null>(null);
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [selectedProjectRule, setSelectedProjectRule] = useState<ProjectRule | null>(null);

  // Fetch all ruleset types
  const { data: rulesetTypes, isLoading: rulesetTypesLoading, isError: rulesetTypesError } = useAllRulesetTypes();

  // Get the currently selected ruleset type
  const selectedRulesetType = rulesetTypes?.[selectedRulesetTypeIndex];

  // Fetch the active ruleset for the selected ruleset type
  const { data: activeRuleset, isLoading: activeRulesetLoading } = useActiveRuleset(
    selectedRulesetType?.rulesetTypeId || ''
  );

  // Fetch project rules for the active ruleset
  const {
    data: projectRules,
    isLoading: projectRulesLoading,
    isError: projectRulesError
  } = useProjectRules(activeRuleset?.rulesetId || '', project.id);

  // Mutations
  const { mutateAsync: setCompletionMutation, isLoading: isUpdatingStatus } = useSetRuleCompletion(
    activeRuleset?.rulesetId || '',
    project.id
  );

  const { mutateAsync: createProjectRuleMutation, isLoading: isCreating } = useCreateProjectRule();

  // Get the first team's ID for fetching unassigned rules
  const teamId = project.teams[0]?.teamId || '';
  const teamNames = project.teams.map((team) => team.teamName);

  // Convert project rules to rules
  const allRules = useMemo(() => {
    if (!projectRules) return [];
    return projectRules.map((pr) => pr.rule);
  }, [projectRules]);

  // Get top-level rules (rules without a parent)
  const topLevelRules = useMemo(() => {
    return allRules.filter((rule) => !rule.parentRule);
  }, [allRules]);

  // Handle completion update
  const handleStatusUpdate = async (ruleId: string, isComplete: boolean) => {
    try {
      await setCompletionMutation({ ruleId, isComplete, projectId: project.id });
      toast.success('Rule completion updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // Handle add rules
  const handleAddRules = async (ruleIds: string[]) => {
    try {
      for (const ruleId of ruleIds) {
        await createProjectRuleMutation({ ruleId, projectId: project.id });
      }
      toast.success(`${ruleIds.length} rule${ruleIds.length !== 1 ? 's' : ''} added successfully`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  // Handle opening status popover
  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, rule: Rule) => {
    const projectRule = projectRules?.find((pr) => pr.rule.ruleId === rule.ruleId);
    if (projectRule) {
      // Only allow status updates for leaf rules
      const hasChildren = allRules.some((r) => r.parentRule?.ruleId === rule.ruleId);
      if (!hasChildren) {
        setSelectedProjectRule(projectRule);
        setStatusPopoverAnchor(event.currentTarget);
      }
    }
  };

  // Handle closing status popover
  const handleStatusPopoverClose = () => {
    setStatusPopoverAnchor(null);
    setSelectedProjectRule(null);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedRulesetTypeIndex(newValue);
  };

  if (rulesetTypesError) {
    return <ErrorPage message={'Failed to load ruleset types'} />;
  }

  if (rulesetTypesLoading) {
    return <LoadingIndicator />;
  }

  // No ruleset types
  if (!rulesetTypes || rulesetTypes.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No ruleset types configured for this organization.
        </Typography>
      </Box>
    );
  }

  // Check if we have no active ruleset
  const hasNoActiveRuleset = !activeRulesetLoading && !activeRuleset;

  // Right content for rule rows - status badge. Leaf rules are clickable to open
  // the completion popover; parents show an aggregated, read-only status.
  const renderRightContent = (rule: Rule) => {
    const isLeafRule = !allRules.some((r) => r.parentRule?.ruleId === rule.ruleId);
    const isPopoverOpenForRule = Boolean(statusPopoverAnchor) && selectedProjectRule?.rule.ruleId === rule.ruleId;

    return (
      <RuleStatusTag
        rule={rule}
        allRules={allRules}
        popoverOpen={isPopoverOpenForRule}
        onClick={isLeafRule ? (e) => handleStatusClick(e, rule) : undefined}
      />
    );
  };

  const backgroundColor = theme.palette.background.default;
  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  return (
    <Box>
      {/* Ruleset Type Tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
        <MuiTabs
          value={selectedRulesetTypeIndex}
          onChange={handleTabChange}
          aria-label="ruleset-type-tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontWeight: 600,
              minWidth: 80
            }
          }}
        >
          {rulesetTypes.map((rulesetType, idx) => (
            <Tab
              key={rulesetType.rulesetTypeId}
              label={rulesetType.name}
              value={idx}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            />
          ))}
        </MuiTabs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip
            title={
              teamNames.length > 0
                ? `Assign rules to the ${teamNames.join(', ')} team${
                    teamNames.length === 1 ? '' : 's'
                  } to add them to this project`
                : 'Add a team to this project to assign rules'
            }
            arrow
            slotProps={{ tooltip: { sx: { textAlign: 'center' } } }}
          >
            <IconButton
              size="small"
              onClick={(e) => e.stopPropagation()}
              sx={{
                padding: '5px',
                color: 'text.secondary'
              }}
            >
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            disabled={!activeRuleset || teamNames.length === 0}
            onClick={() =>
              activeRuleset &&
              history.push(
                `${routes.RULESET_EDIT.replace(':rulesetId', activeRuleset.rulesetId)}/assign-rules${
                  teamId ? `?teamId=${teamId}` : ''
                }`
              )
            }
            sx={{
              border: 1,
              height: '2.25rem'
            }}
          >
            <Typography fontSize={'.75rem'} align="center">
              Assign Rules
            </Typography>
          </Button>
        </Box>
      </Box>

      {/* Active ruleset name for this ruleset type */}
      {activeRuleset && (
        <Typography variant="h5" sx={{ mb: 1 }}>
          {activeRuleset.name}
        </Typography>
      )}

      {/* Rules Content */}
      {projectRulesError ? (
        <Alert severity="error">Failed to load rules</Alert>
      ) : activeRulesetLoading || projectRulesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : hasNoActiveRuleset ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No active ruleset configured for this ruleset type.
          </Typography>
        </Box>
      ) : topLevelRules.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No rules assigned to this project yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ paddingBottom: '80px' }}>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden', backgroundColor }}>
            <Table
              sx={{
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
                backgroundColor
              }}
            >
              <TableBody>
                {topLevelRules.map((rule) => (
                  <RuleRow
                    key={rule.ruleId}
                    rule={rule}
                    allRules={allRules}
                    rightContent={renderRightContent}
                    backgroundColor={tableBackgroundColor}
                    textColor={tableTextColor}
                    hoverColor={tableHoverColor}
                    rowHeight="40px"
                    verticalPadding="8px"
                    indentRow
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Add Rule Button */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 100
        }}
      >
        <Box sx={{ borderBottom: `2px solid ${theme.palette.divider}`, mb: 2, ml: '30px' }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: '30px', pb: 1 }}>
          <Button
            variant="contained"
            onClick={() => setAddRuleModalOpen(true)}
            disabled={!teamId || hasNoActiveRuleset}
            sx={{
              borderRadius: '8px',
              backgroundColor: '#ef4345',
              padding: '2px 15px',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#b0191a' },
              '&.Mui-disabled': { backgroundColor: theme.palette.action.disabled, color: theme.palette.text.disabled }
            }}
          >
            Add Rule
          </Button>
        </Box>
      </Box>

      {/* Update Status Popover */}
      {selectedProjectRule && (
        <UpdateStatusPopover
          anchorEl={statusPopoverAnchor}
          onClose={handleStatusPopoverClose}
          rule={selectedProjectRule.rule}
          onStatusChange={handleStatusUpdate}
        />
      )}

      {/* Add Rule Modal */}
      {activeRuleset && (
        <AddRuleModal
          open={addRuleModalOpen}
          onHide={() => setAddRuleModalOpen(false)}
          rulesetId={activeRuleset.rulesetId}
          projectId={project.id}
          teamNames={project.teams.map((team) => team.teamName)}
          onSubmit={handleAddRules}
        />
      )}

      {/* Loading overlay */}
      {(isUpdatingStatus || isCreating) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};
