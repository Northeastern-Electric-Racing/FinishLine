/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Button, CircularProgress, Paper, Table, TableBody, TableContainer, TextField, useTheme } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMemo, useState } from 'react';
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
import AddReferencedRuleModal from './components/AddReferencedRuleModal';
import AddImageModal from './components/AddImageModal';
import RemoveReferencedRuleModal from './components/RemoveReferencedRuleModal';
import RemoveImageModal from './components/RemoveImageModal';
import RuleContent from './components/RuleContent';
import { AddRuleBox } from './components/AddRuleBox';
import AssignRulesTab from './AssignRulesTab';
import { NERButton } from '../../components/NERButton';
import DeleteRuleModal from './components/DeleteRuleModal';
import MismatchedRuleCodeModal from './components/MismatchedRuleCodeModal';
import {
  useDeleteRule,
  useEditRule,
  useRemoveRuleReferences,
  useRemoveRuleImage,
  useSingleRuleset,
  useAllRulesForRuleset,
  useGetTopLevelRules,
  useEnsureAllRulesLoaded
} from '../../hooks/rules.hooks';
import { countRulesToDelete, compareRuleCodes } from '../../utils/rules.utils';
import { Rule } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';
import { useRuleTreeNavigation } from './useRuleTreeNavigation';

/**
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and adding rules.
 */
const RulesetEditPage: React.FC = () => {
  const { rulesetId } = useParams<{ rulesetId: string; tabValue?: string }>(); //why tab value??
  const [tabValue, setTabValue] = useState(0);
  const defaultTab = 'edit-rules';

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

  const [showAddRuleSectionModal, setShowAddRuleSectionModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddReferencedRuleModal, setShowAddReferencedRuleModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [showRemoveReferenceModal, setShowRemoveReferenceModal] = useState(false);

  const [referenceToRemove, setReferenceToRemove] = useState<{ rule: Rule; referencedRule: Rule } | null>(null);
  const [imageToRemove, setImageToRemove] = useState<{ rule: Rule; fileId: string } | null>(null);
  const [showRemoveImageModal, setShowRemoveImageModal] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  // Editing state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [editedCode, setEditedCode] = useState<string>('');

  // Editing rule code warnings
  const [pendingCodeWarnings, setPendingCodeWarnings] = useState<string[] | null>(null);

  const theme = useTheme();
  const toast = useToast();

  const {
    data: ruleset,
    isError: isRulesetError,
    error: rulesetError,
    isLoading: isRulesetLoading
  } = useSingleRuleset(rulesetId!);

  // Edit Rules table only needs top-level rules to render immediately; subrules are fetched lazily as rows expand
  const {
    data: topLevelRules,
    isError: isTopLevelRulesError,
    error: topLevelRulesError,
    isLoading: isTopLevelRulesLoading
  } = useGetTopLevelRules(rulesetId!);

  const {
    data: allRules,
    isError: isRulesError,
    error: rulesError,
    isLoading: isRulesLoading
  } = useAllRulesForRuleset(rulesetId!);

  const { mutateAsync: deleteRuleMutation } = useDeleteRule();
  const { mutateAsync: editRuleMutation } = useEditRule();
  const { mutateAsync: removeRuleReferencesMutation } = useRemoveRuleReferences();
  const { mutateAsync: removeRuleImageMutation } = useRemoveRuleImage();

  const rulesById = useMemo(() => new Map((allRules ?? []).map((r) => [r.ruleId, r])), [allRules]);

  // Expand All needs whole tree, so load it on demand rather than up front
  const ensureAllRulesLoaded = useEnsureAllRulesLoaded(rulesetId!);

  const { expandedIds, toggleExpand, expandAll, collapseAll, areAllExpanded, isLoadingFullTree } = useRuleTreeNavigation(
    topLevelRules ?? [],
    ensureAllRulesLoaded
  );

  const tabs = [
    { tabUrlValue: 'edit-rules', tabName: 'Edit Rules' },
    { tabUrlValue: 'assign-rules', tabName: 'Assign Rules' }
  ];

  if (isRulesetError) {
    return <ErrorPage error={rulesetError} />;
  }

  if (isTopLevelRulesError) {
    return <ErrorPage error={topLevelRulesError} />;
  }

  if (isRulesError) {
    return <ErrorPage error={rulesError} />;
  }

  if (isRulesetLoading || isTopLevelRulesLoading || !ruleset || !topLevelRules) {
    return <LoadingIndicator />;
  }

  const handleAddRuleSection = () => {
    setShowAddRuleSectionModal(true);
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

  const handleAddRuleFromMenu = () => {
    setShowAddRuleModal(true);
    handleCloseAddMenu();
  };

  const handleAddReferencedRuleFromMenu = () => {
    setShowAddReferencedRuleModal(true);
    handleCloseAddMenu();
  };

  const handleAddImageFromMenu = () => {
    setShowAddImageModal(true);
    handleCloseAddMenu();
  };

  const handleRemoveReference = (ruleId: string, referencedRuleId: string) => {
    const rule = rulesById.get(ruleId);
    const referencedRule = rulesById.get(referencedRuleId);
    if (rule && referencedRule) {
      setReferenceToRemove({ rule, referencedRule });
      setShowRemoveReferenceModal(true);
    }
  };

  const handleRemoveReferenceCancel = () => {
    setShowRemoveReferenceModal(false);
    setReferenceToRemove(null);
  };

  const handleConfirmRemoveReference = async () => {
    if (!referenceToRemove) return;

    try {
      await removeRuleReferencesMutation({
        ruleId: referenceToRemove.rule.ruleId,
        referencedRuleId: referenceToRemove.referencedRule.ruleId
      });
      toast.success('Referenced rule removed successfully');
      setShowRemoveReferenceModal(false);
      setReferenceToRemove(null);
    } catch (err) {
      toast.error('Failed to remove referenced rule');
    }
  };

  const handleRemoveImage = (ruleId: string, fileId: string) => {
    const rule = rulesById.get(ruleId);
    if (rule) {
      setImageToRemove({ rule, fileId });
      setShowRemoveImageModal(true);
    }
  };

  const handleRemoveImageCancel = () => {
    setShowRemoveImageModal(false);
    setImageToRemove(null);
  };

  const handleConfirmRemoveImage = async () => {
    if (!imageToRemove) return;

    try {
      await removeRuleImageMutation({ rule: imageToRemove.rule, fileId: imageToRemove.fileId });
      setShowRemoveImageModal(false);
      setImageToRemove(null);
    } catch (err) {
      console.error('Failed to remove image:', err);
    }
  };

  const handleRemoveRule = (ruleId: string) => {
    const rule = (allRules ?? []).find((r) => r.ruleId === ruleId);
    if (rule) {
      setRuleToDelete(rule);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRuleMutation({
        ruleId: ruleToDelete.ruleId,
        totalRulesToDelete: countRulesToDelete(ruleToDelete, allRules ?? [])
      });
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
    const rule = (allRules ?? []).find((r) => r.ruleId === ruleId);
    if (rule) {
      setEditingRuleId(ruleId);
      setEditedContent(rule.ruleContent);
      setEditedCode(rule.ruleCode);
    }
  };

  const performSaveEdit = async () => {
    if (!editingRuleId) return;

    try {
      await editRuleMutation({ ruleId: editingRuleId, ruleContent: editedContent, ruleCode: editedCode });
      setEditingRuleId(null);
      setEditedContent('');
      setEditedCode('');
    } catch (err) {
      console.error('Failed to update rule:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingRuleId) return;

    if (!editedCode.trim()) {
      toast.error('Rule code cannot be empty');
      return;
    }

    const currentRule = (allRules ?? []).find((r) => r.ruleId === editingRuleId);
    const warnings: string[] = [];

    if (currentRule && currentRule.ruleCode !== editedCode) {
      if (currentRule.parentRule && !editedCode.startsWith(currentRule.parentRule.ruleCode)) {
        warnings.push(`This code doesn't start with its parent rule's code: ${currentRule.parentRule.ruleCode}.`);
      }

      const affectedCount = countRulesToDelete(currentRule, allRules ?? []) - 1;
      if (affectedCount > 0) {
        warnings.push(
          `This rule has ${affectedCount} child rule${affectedCount === 1 ? '' : 's'} whose code${
            affectedCount === 1 ? '' : 's'
          } won't update with the new prefix.`
        );
      }
    }

    if (warnings.length > 0) {
      setPendingCodeWarnings(warnings);
      return;
    }

    await performSaveEdit();
  };

  const handleConfirmCodeWarning = async () => {
    setPendingCodeWarnings(null);
    await performSaveEdit();
  };

  const handleCancelCodeWarning = () => {
    setPendingCodeWarnings(null);
  };

  const handleCancelEdit = () => {
    setEditingRuleId(null);
    setEditedContent('');
    setEditedCode('');
  };

  const totalRulesToDelete = ruleToDelete ? countRulesToDelete(ruleToDelete, allRules ?? []) : 0;

  // Sort top-level rules by rule code for stable numeric order
  const sortedTopLevelRules = [...topLevelRules].sort(compareRuleCodes);

  return (
    <PageLayout
      title={`${ruleset?.name} - ${tabValue === 0 ? 'Edit Rules' : 'Assign Rules'}`}
      previousPages={[
        { name: 'Rules', route: routes.RULES },
        {
          name: `${ruleset.rulesetType?.name} Rulesets`,
          route: `${routes.RULESET_BY_ID.replace(':rulesetTypeId', ruleset.rulesetType.rulesetTypeId)}` // <-- rulesetId variable should eventually be replaced by ruleset.rulestType.rulesetTypeId or somethign like that
        }
      ]}
      tabs={
        <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FullPageTabs
            setTab={setTabValue}
            tabsLabels={tabs}
            baseUrl={routes.RULESET_EDIT.replace(':rulesetId', rulesetId!)}
            defaultTab={defaultTab}
            id="rules-tabs"
          />
          {tabValue === 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isLoadingFullTree && <CircularProgress size={20} />}
              <NERButton variant="outlined" onClick={areAllExpanded ? collapseAll : expandAll}>
                {areAllExpanded ? 'Collapse All' : 'Expand All'}
              </NERButton>
            </Box>
          )}
        </Box>
      }
    >
      <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
        {tabValue === 0 ? (
          <Box sx={{ paddingBottom: '100px' }}>
            <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableBody sx={{ backgroundColor: theme.palette.grey[500] }}>
                  {sortedTopLevelRules.map((rule) => (
                    <RuleRow
                      key={rule.ruleId}
                      rule={rule}
                      leftContent={(currentRule, level, isExpanded, hasSubRules, toggleExpand) => {
                        const isEditing = editingRuleId === currentRule.ruleId;
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              paddingLeft: `${level * 20}px`,
                              color: theme.palette.common.black
                            }}
                          >
                            {hasSubRules && (
                              <ChevronRightIcon
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand();
                                }}
                                sx={{
                                  fontSize: '20px',
                                  color: theme.palette.common.black,
                                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    borderRadius: '50%'
                                  }
                                }}
                              />
                            )}
                            {isEditing ? (
                              <TextField
                                value={editedCode}
                                onChange={(e) => setEditedCode(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                variant="outlined"
                                size="small"
                                autoFocus
                                sx={{
                                  width: '80px',
                                  flexShrink: 0,
                                  backgroundColor: theme.palette.grey[100],
                                  '& .MuiOutlinedInput-root': {
                                    color: theme.palette.common.black,
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
                            ) : (
                              <span style={{ color: theme.palette.common.black }}>{currentRule.ruleCode}</span>
                            )}
                          </Box>
                        );
                      }}
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
                                  color: theme.palette.common.black,
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
                          (currentRule.ruleContent || currentRule.referencedRules.length > 0) && (
                            <RuleContent
                              rule={currentRule}
                              color={theme.palette.common.black}
                              onReferenceRemove={(refId) => handleRemoveReference(currentRule.ruleId, refId)}
                              onImageRemove={(fileId) => handleRemoveImage(currentRule.ruleId, fileId)}
                            />
                          )
                        );
                      }}
                      rightContent={(currentRule) => (
                        <RuleActions
                          ruleId={currentRule.ruleId}
                          onAdd={handleOpenAddMenu}
                          onRemove={handleRemoveRule}
                          onEdit={handleEditRule}
                          iconColor={theme.palette.common.black}
                        />
                      )}
                      backgroundColor={(currentRule) =>
                        editingRuleId === currentRule.ruleId ? theme.palette.grey[400] : theme.palette.grey[500]
                      }
                      textColor={theme.palette.common.black}
                      hoverColor={theme.palette.grey[700]}
                      rowHeight="10px"
                      verticalPadding="5px"
                      expandedIds={expandedIds}
                      onToggleExpand={toggleExpand}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <AddRuleBox
              open={showAddMenu}
              anchorEl={addMenuAnchorEl}
              onClose={handleCloseAddMenu}
              onAddRule={handleAddRuleFromMenu}
              onAddReferencedRule={handleAddReferencedRuleFromMenu}
              onAddImage={handleAddImageFromMenu}
            />

            <AddRuleSectionModal
              open={showAddRuleSectionModal}
              onClose={() => setShowAddRuleSectionModal(false)}
              rulesetId={rulesetId}
            />

            <AddRuleModal
              open={showAddRuleModal}
              onClose={() => setShowAddRuleModal(false)}
              rulesetId={rulesetId}
              initialParentRuleId={activeRuleId || undefined}
              parentRuleCode={activeRuleId ? rulesById.get(activeRuleId)?.ruleCode : undefined}
            />

            <AddReferencedRuleModal
              open={showAddReferencedRuleModal}
              onClose={() => setShowAddReferencedRuleModal(false)}
              ruleId={activeRuleId}
              allRules={allRules ?? []}
            />

            <AddImageModal
              open={showAddImageModal}
              onClose={() => setShowAddImageModal(false)}
              ruleId={activeRuleId}
              allRules={allRules ?? []}
            />

            <MismatchedRuleCodeModal
              open={!!pendingCodeWarnings}
              onHide={handleCancelCodeWarning}
              onConfirm={handleConfirmCodeWarning}
              messages={pendingCodeWarnings ?? []}
              originalCode={editingRuleId ? rulesById.get(editingRuleId)?.ruleCode : undefined}
              updatedCode={editedCode}
            />

            {referenceToRemove && (
              <RemoveReferencedRuleModal
                open={showRemoveReferenceModal}
                onHide={handleRemoveReferenceCancel}
                onConfirm={handleConfirmRemoveReference}
                rule={referenceToRemove.rule}
                referencedRule={referenceToRemove.referencedRule}
              />
            )}

            {imageToRemove && (
              <RemoveImageModal
                open={showRemoveImageModal}
                onHide={handleRemoveImageCancel}
                onConfirm={handleConfirmRemoveImage}
                ruleCode={imageToRemove.rule.ruleCode}
                imageNumber={imageToRemove.rule.imageFileIds.indexOf(imageToRemove.fileId) + 1}
              />
            )}

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
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  mb: 2,
                  ml: '20px'
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pr: '30px', pb: 2 }}>
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
                    <NERButton variant="contained" sx={{ color: '#ededed' }} onClick={handleSaveEdit}>
                      Save
                    </NERButton>
                  </>
                ) : (
                  <NERButton variant="contained" sx={{ color: '#ededed' }} onClick={handleAddRuleSection}>
                    Add Rule Section
                  </NERButton>
                )}
              </Box>
            </Box>
          </Box>
        ) : isRulesLoading || !allRules ? (
          <LoadingIndicator />
        ) : (
          <AssignRulesTab />
        )}
      </Box>
    </PageLayout>
  );
};

export default RulesetEditPage;
