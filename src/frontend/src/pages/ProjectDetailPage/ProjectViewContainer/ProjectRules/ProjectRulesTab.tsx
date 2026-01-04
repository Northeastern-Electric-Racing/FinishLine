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
  IconButton
} from '@mui/material';
import { Project, ProjectRule, Rule, RuleCompletion } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import RuleRow from '../../../RulesPage/RuleRow';
import UpdateStatusPopover from './UpdateStatusPopover';
import AddRuleModal from './AddRuleModal';
import {
  useAllRulesetTypes,
  useActiveRuleset,
  useProjectRules,
  useEditProjectRuleStatus,
  useCreateProjectRule
} from '../../../../hooks/rules.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { InfoOutlined } from '@mui/icons-material';
import { RuleHistoryModal } from './RuleHistoryModal';

interface ProjectRulesTabProps {
  project: Project;
}

/**
 * Get the status chip configuration
 */
const getStatusConfig = (status: RuleCompletion) => {
  switch (status) {
    case RuleCompletion.COMPLETED:
      return { label: 'Complete', color: '#4caf50' };
    case RuleCompletion.INCOMPLETE:
      return { label: 'Incomplete', color: '#f44336' };
    case RuleCompletion.REVIEW:
    default:
      return { label: 'Review', color: '#ff9800' };
  }
};

export const ProjectRulesTab = ({ project }: ProjectRulesTabProps) => {
  const toast = useToast();
  const theme = useTheme();

  // State for modals and popovers
  const [selectedRulesetTypeIndex, setSelectedRulesetTypeIndex] = useState(0);
  const [statusPopoverAnchor, setStatusPopoverAnchor] = useState<HTMLElement | null>(null);
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [selectedProjectRule, setSelectedProjectRule] = useState<ProjectRule | null>(null);

  const [selectedRuleForHistory, setSelectedRuleForHistory] = useState<Rule | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

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
  const { mutateAsync: editStatusMutation, isLoading: isUpdatingStatus } = useEditProjectRuleStatus(
    activeRuleset?.rulesetId || '',
    project.id
  );

  const { mutateAsync: createProjectRuleMutation, isLoading: isCreating } = useCreateProjectRule(
    activeRuleset?.rulesetId || '',
    project.id
  );

  // Get the first team's ID for fetching unassigned rules
  const teamId = project.teams[0]?.teamId || '';

  // Convert project rules to rules
  const allRules = useMemo(() => {
    if (!projectRules) return [];
    return projectRules.map((pr) => pr.rule);
  }, [projectRules]);

  // Get top-level rules (rules without a parent)
  const topLevelRules = useMemo(() => {
    return allRules.filter((rule) => !rule.parentRule);
  }, [allRules]);

  // Helper function to get all descendant leaf rules for a given rule
  const getDescendantLeafRules = (rule: Rule): Rule[] => {
    const children = allRules.filter((r) => r.parentRule?.ruleId === rule.ruleId);
    if (children.length === 0) {
      // This is a leaf rule
      return [rule];
    }
    // Recursively get leaf rules from all children
    return children.flatMap((child) => getDescendantLeafRules(child));
  };

  // Helper function to calculate aggregated status from leaf rules
  const getAggregatedStatus = (rule: Rule): RuleCompletion => {
    const leafRules = getDescendantLeafRules(rule);
    if (leafRules.length === 0) {
      return RuleCompletion.REVIEW;
    }

    const leafStatuses = leafRules.map((leafRule) => {
      const projectRule = projectRules?.find((pr) => pr.rule.ruleId === leafRule.ruleId);
      return projectRule?.currentStatus || RuleCompletion.REVIEW;
    });

    if (leafStatuses.every((s) => s === RuleCompletion.COMPLETED)) {
      return RuleCompletion.COMPLETED;
    }

    if (leafStatuses.some((s) => s === RuleCompletion.INCOMPLETE)) {
      return RuleCompletion.INCOMPLETE;
    }

    return RuleCompletion.REVIEW;
  };

  // Handle status update
  const handleStatusUpdate = async (projectRuleId: string, newStatus: RuleCompletion) => {
    try {
      await editStatusMutation({ projectRuleId, newStatus });
      toast.success('Rule status updated successfully');
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

  // Loading state
  if (rulesetTypesLoading) {
    return <LoadingIndicator />;
  }

  // Error state
  if (rulesetTypesError) {
    return <ErrorPage message={'Failed to load ruleset types'} />;
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

  // Right content for rule rows - status badge
  const renderRightContent = (rule: Rule) => {
    const hasChildren = allRules.some((r) => r.parentRule?.ruleId === rule.ruleId);
    const isLeafRule = !hasChildren;

    // Get status - for leaf rules use their own status, for parents calculate from children
    const status = isLeafRule
      ? projectRules?.find((pr) => pr.rule.ruleId === rule.ruleId)?.currentStatus || RuleCompletion.REVIEW
      : getAggregatedStatus(rule);
    const statusConfig = getStatusConfig(status);

    const projectRule = projectRules?.find((pr) => pr.rule.ruleId === rule.ruleId);

    return (
      <>
        <Box
          onClick={
            isLeafRule
              ? (e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  handleStatusClick(e, rule);
                }
              : undefined
          }
          sx={{
            backgroundColor: statusConfig.color,
            color: 'white',
            fontSize: '11px',
            fontWeight: 600,
            px: 0.75,
            py: 0.25,
            borderRadius: '3px',
            cursor: isLeafRule ? 'pointer' : 'default',
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            '&:hover': isLeafRule
              ? {
                  opacity: 0.85
                }
              : {}
          }}
        >
          {statusConfig.label}
        </Box>
        {isLeafRule && projectRule && projectRule.statusHistory && projectRule.statusHistory.length > 0 && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRuleForHistory(rule);
              setShowHistoryModal(true);
            }}
            sx={{
              padding: '2px',
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main'
              }
            }}
          >
            <InfoOutlined fontSize="small" />
          </IconButton>
        )}
      </>
    );
  };

  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  return (
    <Box>
      {/* Ruleset Type Tabs */}
      <Box sx={{ width: 'fit-content', mb: 2 }}>
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
      </Box>

      {/* Rules Content */}
      {activeRulesetLoading || projectRulesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : hasNoActiveRuleset ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No active ruleset configured for this ruleset type.
          </Typography>
        </Box>
      ) : projectRulesError ? (
        <Alert severity="error">Failed to load rules</Alert>
      ) : topLevelRules.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No rules assigned to this project yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ paddingBottom: '80px' }}>
          <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Table sx={{ borderCollapse: 'collapse' }}>
              <TableBody sx={{ backgroundColor: tableBackgroundColor }}>
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
          projectRule={selectedProjectRule}
          onStatusChange={handleStatusUpdate}
        />
      )}

      <RuleHistoryModal
        open={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedRuleForHistory(null);
        }}
        rule={selectedRuleForHistory}
        projectRules={projectRules}
      />

      {/* Add Rule Modal */}
      {activeRuleset && teamId && (
        <AddRuleModal
          open={addRuleModalOpen}
          onHide={() => setAddRuleModalOpen(false)}
          rulesetId={activeRuleset.rulesetId}
          teamId={teamId}
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
