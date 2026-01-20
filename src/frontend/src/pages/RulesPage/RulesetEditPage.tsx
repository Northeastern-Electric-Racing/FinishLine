/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Button, Paper, Table, TableBody, TableContainer, TextField, useTheme } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import FullPageTabs from '../../components/FullPageTabs';
import { routes } from '../../utils/routes';
import RuleRow from './RuleRow';
import RuleActions from './RuleActions';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import AddRuleSectionModal from './components/AddRuleSectionModal';
import AddRuleModal from './components/AddRuleModal';
import { AddRuleBox } from './components/AddRuleBox';
import AssignRulesTab from './AssignRulesTab';
import DeleteRuleModal from './components/DeleteRuleModal';
import { useDeleteRule, useEditRule, useSingleRuleset, useAllRulesForRuleset } from '../../hooks/rules.hooks';
import { countRulesToDelete } from '../../utils/rules.utils';
import { Rule } from 'shared';

/**
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and assigning rules to projects and teams.
 */
const RulesetEditPage: React.FC = () => {
  const { rulesetId } = useParams<{ rulesetId: string; tabValue?: string }>(); //why tab value??
  const [tabValue, setTabValue] = useState(0);
  const defaultTab = 'edit-rules';

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

  // temporary placeholder useState fns for the add rule section and add rule modals
  const [showAddRuleSectionModal, setShowAddRuleSectionModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  // Editing state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const theme = useTheme();

  const {
    data: ruleset,
    isError: isRulesetError,
    error: rulesetError,
    isLoading: isRulesetLoading
  } = useSingleRuleset(rulesetId!);
  const {
    data: allRules,
    isError: isRulesError,
    error: rulesError,
    isLoading: isRulesLoading
  } = useAllRulesForRuleset(rulesetId!);
  const { mutateAsync: deleteRuleMutation } = useDeleteRule();
  const { mutateAsync: editRuleMutation } = useEditRule();

  const tabs = [
    { tabUrlValue: 'edit-rules', tabName: 'Edit Rules' },
    { tabUrlValue: 'assign-rules', tabName: 'Assign Rules' }
  ];

  if (isRulesetError) {
    return <ErrorPage error={rulesetError} />;
  }

  if (isRulesError) {
    return <ErrorPage error={rulesError} />;
  }

  if (isRulesetLoading || isRulesLoading || !ruleset || !allRules) {
    return <LoadingIndicator />;
  }

  const handleAddRuleSection = () => {
    // Placeholder
  };

  const handleOpenAddMenu = (ruleId: string, anchorEl: HTMLElement) => {
    if (showAddMenu && addMenuAnchorEl === anchorEl) {
      handleCloseAddMenu();
      return;
    }

    setActiveRuleId(ruleId);
    setAddMenuAnchorEl(anchorEl);
    setShowAddMenu(true);
  };

  const handleCloseAddMenu = () => {
    setShowAddMenu(false);
    setAddMenuAnchorEl(null);
  };

  const handleAddRuleSectionFromMenu = () => {
    setShowAddRuleSectionModal(true);
    handleCloseAddMenu();
  };

  const handleAddRuleFromMenu = () => {
    setShowAddRuleModal(true);
    handleCloseAddMenu();
  };

  const handleRemoveRule = (ruleId: string) => {
    const rule = allRules.find((r) => r.ruleId === ruleId);
    if (rule) {
      setRuleToDelete(rule);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRuleMutation(ruleToDelete.ruleId);
      setDeleteModalOpen(false);
      setRuleToDelete(null);
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setRuleToDelete(null);
  };

  const handleEditRule = (ruleId: string) => {
    const rule = allRules.find((r) => r.ruleId === ruleId);
    if (rule) {
      setEditingRuleId(ruleId);
      setEditedContent(rule.ruleContent);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRuleId) return;

    try {
      await editRuleMutation({ ruleId: editingRuleId, ruleContent: editedContent });
      setEditingRuleId(null);
      setEditedContent('');
    } catch (err) {
      console.error('Failed to update rule:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditedContent('');
  };

  const totalRulesToDelete = ruleToDelete ? countRulesToDelete(ruleToDelete, allRules) : 0;

  // Filter to only show top-level rules
  const topLevelRules = allRules.filter((rule) => !rule.parentRule);

  return (
    <PageLayout
      title={`${ruleset.name} Rules`}
      tabs={
        <Box sx={{ width: 'fit-content', mt: 2 }}>
          <FullPageTabs
            setTab={setTabValue}
            tabsLabels={tabs}
            baseUrl={routes.RULESET_EDIT.replace(':rulesetId', rulesetId!)}
            defaultTab={defaultTab}
            id="rules-tabs"
          />
        </Box>
      }
    >
      <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
        {tabValue === 0 ? (
          <Box sx={{ paddingBottom: '100px' }}>
            <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableBody sx={{ backgroundColor: '#9d9d9d' }}>
                  {topLevelRules.map((rule) => (
                    <RuleRow
                      key={rule.ruleId}
                      rule={rule}
                      allRules={allRules}
                      middleContent={(currentRule) => {
                        const isEditing = editingRuleId === currentRule.ruleId;
                        if (isEditing) {
                          return (
                            <TextField
                              fullWidth
                              multiline
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              variant="outlined"
                              size="small"
                              autoFocus
                              sx={{
                                backgroundColor: theme.palette.grey[100],
                                '& .MuiOutlinedInput-root': {
                                  color: '#000000',
                                  '& fieldset': {
                                    borderColor: '#dd514c'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#dd514c'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#dd514c'
                                  }
                                }
                              }}
                            />
                          );
                        }
                        return (
                          currentRule.ruleContent && <span style={{ color: '#000000' }}>{currentRule.ruleContent}</span>
                        );
                      }}
                      rightContent={(currentRule) => (
                        <RuleActions
                          ruleId={currentRule.ruleId}
                          onAdd={handleOpenAddMenu}
                          onRemove={handleRemoveRule}
                          onEdit={handleEditRule}
                          iconColor="#000000"
                        />
                      )}
                      backgroundColor={(currentRule) => (editingRuleId === currentRule.ruleId ? '#c0c0c0' : '#9d9d9d')}
                      textColor="#000000"
                      hoverColor="#5e5e5e"
                      rowHeight="10px"
                      verticalPadding="5px"
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <AddRuleBox
              open={showAddMenu}
              anchorEl={addMenuAnchorEl}
              onClose={handleCloseAddMenu}
              onAddRuleSection={handleAddRuleSectionFromMenu}
              onAddRule={handleAddRuleFromMenu}
            />

            <AddRuleSectionModal open={showAddRuleSectionModal} onClose={() => setShowAddRuleSectionModal(false)} />
            <AddRuleModal
              open={showAddRuleModal}
              onClose={() => setShowAddRuleModal(false)}
              rulesetId={rulesetId}
              initialParentRuleId={activeRuleId || undefined}
            />

            {ruleToDelete && (
              <DeleteRuleModal
                open={deleteModalOpen}
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                rule={ruleToDelete}
                totalRulesToDelete={totalRulesToDelete}
              />
            )}

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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pr: '30px', pb: 1 }}>
                {editingRuleId ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      sx={{
                        borderRadius: '8px',
                        color: '#ededed',
                        borderColor: '#ededed',
                        padding: '2px 15px',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#ededed',
                          backgroundColor: 'rgba(237, 237, 237, 0.1)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveEdit}
                      sx={{
                        borderRadius: '8px',
                        color: '#ededed',
                        backgroundColor: '#dd514c',
                        padding: '2px 15px',
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#c74340'
                        }
                      }}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleAddRuleSection}
                    sx={{
                      borderRadius: '8px',
                      color: '#ededed',
                      backgroundColor: '#dd514c',
                      padding: '2px 15px',
                      fontSize: '16px',
                      fontWeight: 700,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#c74340'
                      }
                    }}
                  >
                    Add Rule Section
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <AssignRulesTab rules={allRules} />
        )}
      </Box>
    </PageLayout>
  );
};

export default RulesetEditPage;
