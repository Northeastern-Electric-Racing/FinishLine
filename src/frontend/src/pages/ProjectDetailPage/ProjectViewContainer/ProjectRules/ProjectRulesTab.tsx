/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState, useMemo } from 'react';
import {
  Box,
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
import { Project, ProjectRule, Rule, isLeadership } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import RuleRow from '../../../RulesPage/RuleRow';
import RuleContent from '../../../RulesPage/components/RuleContent';
import { useRuleTreeNavigation } from '../../../RulesPage/useRuleTreeNavigation';
import UpdateStatusPopover from './UpdateStatusPopover';
import AddRuleModal from './AddProjectRuleModal';
import {
  useAllRulesetTypes,
  useActiveRuleset,
  useProjectRules,
  useSetRuleCompletion,
  useCreateProjectRule
} from '../../../../hooks/rules.hooks';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { InfoOutlined } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../../utils/routes';
import RuleStatusTag from '../../../RulesPage/components/RuleStatusTag';
import { NERButton } from '../../../../components/NERButton';
import { compareRuleCodes } from '../../../../utils/rules.utils';

interface ProjectRulesTabProps {
  project: Project;
}

export const ProjectRulesTab = ({ project }: ProjectRulesTabProps) => {
  const toast = useToast();
  const theme = useTheme();
  const history = useHistory();
  const user = useCurrentUser();

  // State for modals and popovers
  const [selectedRulesetTypeIndex, setSelectedRulesetTypeIndex] = useState(0);
  const [statusPopoverAnchor, setStatusPopoverAnchor] = useState<HTMLElement | null>(null);
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [selectedProjectRule, setSelectedProjectRule] = useState<ProjectRule | null>(null);

  // Fetch all ruleset types
  const { data: rulesetTypes, isLoading: rulesetTypesLoading, isError: rulesetTypesError } = useAllRulesetTypes();

  // Get the currently selected ruleset type
  const selectedRulesetType = rulesetTypes?.[selectedRulesetTypeIndex];

  // Fetch the active ruleset for the selected ruleset type, scoped to this project's own car
  const { data: activeRuleset, isLoading: activeRulesetLoading } = useActiveRuleset(
    selectedRulesetType?.rulesetTypeId || '',
    project.wbsNum.carNumber
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

  // First team's ID, used only to pre-select a team tab on the assign-rules deep link
  const teamId = project.teams[0]?.teamId || '';
  const teamNames = project.teams.map((team) => team.teamName);

  // Convert project rules to rules for display
  // Sorted by rule code so both top-level rows and their children render in stable numeric order
  const projectRuleList = useMemo(() => {
    if (!projectRules) return [];
    return projectRules.map((pr) => pr.rule).sort(compareRuleCodes);
  }, [projectRules]);

  // Get top-level rules (rules without a parent)
  const topLevelRules = useMemo(() => {
    return projectRuleList.filter((rule) => !rule.parentRule);
  }, [projectRuleList]);

  // all referenced rules are shown, only referenced rules that exist in this project are clickable
  const projectRuleIds = useMemo(() => new Set(projectRuleList.map((r) => r.ruleId)), [projectRuleList]);

  // controlled expansion + click-to-navigate
  const { expandedIds, toggleExpand, navigateToRule, expandAll, collapseAll, areAllExpanded } =
    useRuleTreeNavigation(projectRuleList);

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
      const hasChildren = projectRuleList.some((r) => r.parentRule?.ruleId === rule.ruleId);
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
    const isLeafRule = !projectRuleList.some((r) => r.parentRule?.ruleId === rule.ruleId);
    const isPopoverOpenForRule = Boolean(statusPopoverAnchor) && selectedProjectRule?.rule.ruleId === rule.ruleId;

    return (
      <RuleStatusTag
        rule={rule}
        allRules={projectRuleList}
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
        {activeRuleset && (
          <NERButton variant="outlined" onClick={areAllExpanded ? collapseAll : expandAll}>
            {areAllExpanded ? 'Collapse All' : 'Expand All'}
          </NERButton>
        )}
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
                    allRules={projectRuleList}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    middleContent={(r) => (
                      <RuleContent
                        rule={r}
                        color={tableTextColor}
                        onReferenceClick={navigateToRule}
                        isReferenceInteractive={(id) => projectRuleIds.has(id)}
                      />
                    )}
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
        {isLeadership(user.role) && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, pr: '30px', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Assign Rules Tooltip */}
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
              {/* Assign Rules Button */}
              <NERButton
                variant="outlined"
                disabled={!activeRuleset || teamNames.length === 0}
                // Assign rule page only supports highlighting a single team at a time
                onClick={() =>
                  activeRuleset &&
                  history.push(
                    `${routes.RULESET_EDIT.replace(':rulesetId', activeRuleset.rulesetId)}/assign-rules${
                      teamId ? `?teamId=${teamId}` : ''
                    }`
                  )
                }
              >
                Assign Rules
              </NERButton>
            </Box>
            {/* Add Rule Button */}
            <NERButton
              variant="contained"
              sx={{ color: '#ededed' }}
              onClick={() => setAddRuleModalOpen(true)}
              disabled={teamNames.length === 0 || hasNoActiveRuleset}
            >
              Add Rule
            </NERButton>
          </Box>
        )}
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
