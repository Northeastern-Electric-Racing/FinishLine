/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, CircularProgress, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import FullPageTabs from '../../components/FullPageTabs';
import { routes } from '../../utils/routes';
import RuleRow from './RuleRow';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import AddRuleSectionModal from './components/AddRuleSectionModal';
import AddRuleModal from './components/AddRuleModal';
import AddReferencedRuleModal from './components/AddReferencedRuleModal';
import AddImageModal from './components/AddImageModal';
import RemoveReferencedRuleModal from './components/RemoveReferencedRuleModal';
import RemoveImageModal from './components/RemoveImageModal';
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
  useFetchFullRuleTree
} from '../../hooks/rules.hooks';
import { countRulesToDelete, compareRuleCodes } from '../../utils/rules.utils';
import { Rule, isLeadership } from 'shared';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useRuleTreeNavigation } from './useRuleTreeNavigation';
import { RuleActionsCell, RuleBodyCell, RuleCodeCell, RuleDraft } from './components/RuleEditCells';

/**
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and adding rules.
 */
const RulesetEditPage: React.FC = () => {
  const { rulesetId } = useParams<{ rulesetId: string; tabValue?: string }>(); //why tab value??
  const user = useCurrentUser();
  const [tabValue, setTabValue] = useState(0);
  const defaultTab = 'edit-rules';

  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeRule, setActiveRule] = useState<Rule | null>(null);

  const [showAddRuleSectionModal, setShowAddRuleSectionModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddReferencedRuleModal, setShowAddReferencedRuleModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);

  const [referenceToRemove, setReferenceToRemove] = useState<{
    rule: Rule;
    referencedRule: { ruleId: string; ruleCode: string };
  } | null>(null);
  const [imageToRemove, setImageToRemove] = useState<{ rule: Rule; fileId: string } | null>(null);

  // Delete modal state, the count comes from the full tree since deleting cascades to every descendant
  const [ruleToDelete, setRuleToDelete] = useState<{ rule: Rule; totalRulesToDelete: number } | null>(null);

  // Editing state, only the row being edited lives in state.
  // The drafts live in a ref so a keystroke doesn't rerender every rule row.
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const draftRef = useRef<RuleDraft>({ ruleCode: '', ruleContent: '' });

  const editingRuleIdRef = useRef(editingRuleId);
  editingRuleIdRef.current = editingRuleId;

  // Editing rule code warnings
  const [pendingCodeWarnings, setPendingCodeWarnings] = useState<string[] | null>(null);

  // work that blocks the page (loading the full tree, expanding every rule) shows a spinner by the tabs
  const [isFetchingTree, setIsFetchingTree] = useState(false);

  const theme = useTheme();
  // useToast hands back a new object every render, so the latest one is kept in a ref to keep the callbacks stable.
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

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

  // Only the modals that browse the whole ruleset need every rule, so this stays unfetched until one opens
  const { data: allRules } = useAllRulesForRuleset(rulesetId!, showAddReferencedRuleModal || showAddImageModal);

  const { mutateAsync: deleteRuleMutation } = useDeleteRule(rulesetId!);
  const { mutateAsync: editRuleMutation } = useEditRule(rulesetId!);
  const { mutateAsync: removeRuleReferencesMutation } = useRemoveRuleReferences(rulesetId!);
  const { mutateAsync: removeRuleImageMutation } = useRemoveRuleImage(rulesetId!);

  // Expand All and the rule code checks need the whole tree, so load it on demand rather than up front
  const fetchFullRuleTree = useFetchFullRuleTree(rulesetId!);

  const loadFullTree = useCallback(async () => {
    setIsFetchingTree(true);
    try {
      return await fetchFullRuleTree();
    } finally {
      setIsFetchingTree(false);
    }
  }, [fetchFullRuleTree]);

  const { expandedIds, toggleExpand, expandAll, collapseAll, areAllExpanded, isLoadingFullTree } = useRuleTreeNavigation(
    topLevelRules ?? [],
    fetchFullRuleTree
  );

  const handleToggleExpandAll = useCallback(async () => {
    if (areAllExpanded) {
      collapseAll();
      return;
    }

    setIsFetchingTree(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      await expandAll();
    } catch (err) {
      if (err instanceof Error) toastRef.current.error(`Failed to load rules: ${err.message}`);
    } finally {
      setTimeout(() => setIsFetchingTree(false), 0);
    }
  }, [areAllExpanded, collapseAll, expandAll]);

  const handleAddRuleSection = useCallback(() => setShowAddRuleSectionModal(true), []);

  const handleOpenAddMenu = useCallback((rule: Rule, anchorEl: HTMLElement) => {
    setActiveRule(rule);
    // clicking the same row's add button again closes the menu
    setAddMenuAnchorEl((previousAnchorEl) => (previousAnchorEl === anchorEl ? null : anchorEl));
  }, []);

  const handleCloseAddMenu = useCallback(() => setAddMenuAnchorEl(null), []);

  const handleAddRuleFromMenu = useCallback(() => {
    setShowAddRuleModal(true);
    handleCloseAddMenu();
  }, [handleCloseAddMenu]);

  const handleAddReferencedRuleFromMenu = useCallback(() => {
    setShowAddReferencedRuleModal(true);
    handleCloseAddMenu();
  }, [handleCloseAddMenu]);

  const handleAddImageFromMenu = useCallback(() => {
    setShowAddImageModal(true);
    handleCloseAddMenu();
  }, [handleCloseAddMenu]);

  const handleRemoveReference = useCallback((rule: Rule, referencedRuleId: string) => {
    const referencedRule = rule.referencedRules.find((r) => r.ruleId === referencedRuleId);
    if (referencedRule) {
      setReferenceToRemove({ rule, referencedRule });
    }
  }, []);

  const handleRemoveReferenceCancel = useCallback(() => setReferenceToRemove(null), []);

  const handleConfirmRemoveReference = useCallback(async () => {
    if (!referenceToRemove) return;

    try {
      await removeRuleReferencesMutation({
        ruleId: referenceToRemove.rule.ruleId,
        referencedRuleId: referenceToRemove.referencedRule.ruleId,
        referencedRuleCode: referenceToRemove.referencedRule.ruleCode
      });
      setReferenceToRemove(null);
    } catch {
      // the modal stays open so the removal can be retried
    }
  }, [referenceToRemove, removeRuleReferencesMutation]);

  const handleRemoveImage = useCallback((rule: Rule, fileId: string) => setImageToRemove({ rule, fileId }), []);

  const handleRemoveImageCancel = useCallback(() => setImageToRemove(null), []);

  const handleConfirmRemoveImage = useCallback(async () => {
    if (!imageToRemove) return;

    try {
      await removeRuleImageMutation({ rule: imageToRemove.rule, fileId: imageToRemove.fileId });
      setImageToRemove(null);
    } catch {
      // the modal stays open so the removal can be retried
    }
  }, [imageToRemove, removeRuleImageMutation]);

  const handleRemoveRule = useCallback(
    async (rule: Rule) => {
      // deleting a rule deletes its whole subtree, which only the full tree can count
      try {
        const allRulesInRuleset = await loadFullTree();
        setRuleToDelete({ rule, totalRulesToDelete: countRulesToDelete(rule, allRulesInRuleset) });
      } catch (err) {
        if (err instanceof Error) toastRef.current.error(`Failed to load rules: ${err.message}`);
      }
    },
    [loadFullTree]
  );

  const handleDeleteCancel = useCallback(() => setRuleToDelete(null), []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRuleMutation({
        ruleId: ruleToDelete.rule.ruleId,
        ruleCode: ruleToDelete.rule.ruleCode,
        totalRulesToDelete: ruleToDelete.totalRulesToDelete
      });
      setRuleToDelete(null);
    } catch {
      // the modal stays open so the delete can be retried
    }
  }, [deleteRuleMutation, ruleToDelete]);

  const handleEditRule = useCallback((rule: Rule) => {
    draftRef.current = { ruleCode: rule.ruleCode, ruleContent: rule.ruleContent };
    setEditingRuleId(rule.ruleId);
  }, []);

  const handleCancelEdit = useCallback(() => setEditingRuleId(null), []);

  const performSaveEdit = useCallback(
    async (ruleId: string, draft: RuleDraft) => {
      try {
        await editRuleMutation({ ruleId, ruleContent: draft.ruleContent, ruleCode: draft.ruleCode.trim() });
        // another row may have started editing while this save was in flight, so leave it open
        setEditingRuleId((currentlyEditing) => (currentlyEditing === ruleId ? null : currentlyEditing));
      } catch {
        // the row stays in edit mode with the typed text intact
      }
    },
    [editRuleMutation]
  );

  const handleSaveEdit = useCallback(
    async (rule: Rule) => {
      const draft = { ...draftRef.current };
      const trimmedCode = draft.ruleCode.trim();

      if (!trimmedCode) {
        toastRef.current.error('Rule code cannot be empty');
        return;
      }

      // an unchanged code can't collide or strand child codes, so content only edits skip the tree entirely
      if (trimmedCode === rule.ruleCode) {
        await performSaveEdit(rule.ruleId, draft);
        return;
      }

      let allRulesInRuleset: Rule[];
      try {
        allRulesInRuleset = await loadFullTree();
      } catch (err) {
        // the row stays in edit mode so the save can be retried
        if (err instanceof Error) toastRef.current.error(`Failed to load rules: ${err.message}`);
        return;
      }

      if (editingRuleIdRef.current !== rule.ruleId) return;

      // a duplicate code cannot be saved, so reject it before any of the warnings below
      if (allRulesInRuleset.some((r) => r.ruleId !== rule.ruleId && r.ruleCode === trimmedCode)) {
        toastRef.current.error(`Rule with code ${trimmedCode} already exists in this ruleset`);
        return;
      }

      const warnings: string[] = [];

      if (rule.parentRule && !trimmedCode.startsWith(rule.parentRule.ruleCode)) {
        warnings.push(`This code doesn't start with its parent rule's code: ${rule.parentRule.ruleCode}.`);
      }

      const affectedCount = countRulesToDelete(rule, allRulesInRuleset) - 1;
      if (affectedCount > 0) {
        warnings.push(
          `This rule has ${affectedCount} child rule${affectedCount === 1 ? '' : 's'} whose code${
            affectedCount === 1 ? '' : 's'
          } will not update with the new prefix.`
        );
      }

      if (warnings.length > 0) {
        setPendingCodeWarnings(warnings);
        return;
      }

      await performSaveEdit(rule.ruleId, draft);
    },
    [loadFullTree, performSaveEdit]
  );

  const handleConfirmCodeWarning = useCallback(async () => {
    if (!editingRuleId) return;
    setPendingCodeWarnings(null);
    await performSaveEdit(editingRuleId, { ...draftRef.current });
  }, [editingRuleId, performSaveEdit]);

  const handleCancelCodeWarning = useCallback(() => setPendingCodeWarnings(null), []);

  const renderLeftContent = useCallback(
    (currentRule: Rule, level: number, isExpanded: boolean, hasSubRules: boolean, toggleRuleExpand: () => void) => (
      <RuleCodeCell
        rule={currentRule}
        level={level}
        isExpanded={isExpanded}
        hasSubRules={hasSubRules}
        onToggleExpand={toggleRuleExpand}
        isEditing={editingRuleId === currentRule.ruleId}
        draftRef={draftRef}
      />
    ),
    [editingRuleId]
  );

  const renderMiddleContent = useCallback(
    (currentRule: Rule, level: number) => (
      <RuleBodyCell
        rule={currentRule}
        level={level}
        isEditing={editingRuleId === currentRule.ruleId}
        draftRef={draftRef}
        onReferenceRemove={handleRemoveReference}
        onImageRemove={handleRemoveImage}
      />
    ),
    [editingRuleId, handleRemoveImage, handleRemoveReference]
  );

  const renderRightContent = useCallback(
    (currentRule: Rule) => (
      <RuleActionsCell
        rule={currentRule}
        isEditing={editingRuleId === currentRule.ruleId}
        onAdd={handleOpenAddMenu}
        onRemove={handleRemoveRule}
        onEdit={handleEditRule}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    ),
    [editingRuleId, handleCancelEdit, handleEditRule, handleOpenAddMenu, handleRemoveRule, handleSaveEdit]
  );

  const getRowBackgroundColor = useCallback(
    (currentRule: Rule) => (editingRuleId === currentRule.ruleId ? theme.palette.grey[400] : theme.palette.grey[500]),
    [editingRuleId, theme]
  );

  // Sort top-level rules by rule code for stable numeric order
  const sortedTopLevelRules = useMemo(() => [...(topLevelRules ?? [])].sort(compareRuleCodes), [topLevelRules]);

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

  if (isRulesetLoading || isTopLevelRulesLoading || !ruleset || !topLevelRules) {
    return <LoadingIndicator />;
  }

  // creating, editing, deleting, and assigning rules all require leadership and above
  // if the user is not leadership, redirect them to the view page for this ruleset
  if (!isLeadership(user.role)) {
    return <Redirect to={routes.RULESET_VIEW.replace(':rulesetId', rulesetId!)} />;
  }

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
              {(isLoadingFullTree || isFetchingTree) && <CircularProgress size={20} />}
              <NERButton variant="outlined" onClick={handleToggleExpandAll}>
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
                      leftContent={renderLeftContent}
                      middleContent={renderMiddleContent}
                      rightContent={renderRightContent}
                      backgroundColor={getRowBackgroundColor}
                      textColor={theme.palette.common.black}
                      hoverColor={theme.palette.grey[700]}
                      rowHeight="40px"
                      verticalPadding="8px"
                      leftWidth="12%"
                      middleWidth="76%"
                      rightWidth="12%"
                      expandedIds={expandedIds}
                      onToggleExpand={toggleExpand}
                      windowChildren
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <AddRuleBox
              open={Boolean(addMenuAnchorEl)}
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
              initialParentRuleId={activeRule?.ruleId}
              parentRuleCode={activeRule?.ruleCode}
            />

            <AddReferencedRuleModal
              open={showAddReferencedRuleModal}
              onClose={() => setShowAddReferencedRuleModal(false)}
              ruleId={activeRule?.ruleId ?? null}
              rulesetId={rulesetId}
              allRules={allRules ?? []}
            />

            <AddImageModal
              open={showAddImageModal}
              onClose={() => setShowAddImageModal(false)}
              ruleId={activeRule?.ruleId ?? null}
              rulesetId={rulesetId}
              allRules={allRules ?? []}
            />

            <MismatchedRuleCodeModal
              open={!!pendingCodeWarnings}
              onHide={handleCancelCodeWarning}
              onConfirm={handleConfirmCodeWarning}
              messages={pendingCodeWarnings ?? []}
            />

            {referenceToRemove && (
              <RemoveReferencedRuleModal
                open
                onHide={handleRemoveReferenceCancel}
                onConfirm={handleConfirmRemoveReference}
                rule={referenceToRemove.rule}
                referencedRule={referenceToRemove.referencedRule}
              />
            )}

            {imageToRemove && (
              <RemoveImageModal
                open
                onHide={handleRemoveImageCancel}
                onConfirm={handleConfirmRemoveImage}
                ruleCode={imageToRemove.rule.ruleCode}
                imageNumber={imageToRemove.rule.imageFileIds.indexOf(imageToRemove.fileId) + 1}
              />
            )}

            {ruleToDelete && (
              <DeleteRuleModal
                open
                onHide={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                rule={ruleToDelete.rule}
                totalRulesToDelete={ruleToDelete.totalRulesToDelete}
              />
            )}

            <Box
              sx={{
                backgroundColor: '#121313',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 2,
                width: '100%',
                px: { xs: 1, md: 0 }
              }}
            >
              <Box
                sx={{
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  mb: 2
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, gap: 2, pr: '30px', pb: 2 }}>
                <NERButton variant="contained" sx={{ color: '#ededed' }} onClick={handleAddRuleSection}>
                  Add Rule Section
                </NERButton>
              </Box>
            </Box>
          </Box>
        ) : (
          <AssignRulesTab />
        )}
      </Box>
    </PageLayout>
  );
};

export default RulesetEditPage;
