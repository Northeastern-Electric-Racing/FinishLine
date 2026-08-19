import React, { useState } from 'react';
import { isAdmin } from 'shared';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { NERButton } from '../../components/NERButton';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import { CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import RulesetGeneralView from './components/RulesetGeneralView';
import RulesetTeamView from './components/RulesetTeamView';
import ResetStatusesModal from './components/ResetStatusesModal';
import {
  useSingleRuleset,
  useAllRulesForRuleset,
  useGetTopLevelRules,
  useFetchFullRuleTree,
  useResetRulesetStatuses
} from '../../hooks/rules.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useRuleTreeNavigation } from './useRuleTreeNavigation';
import { useTeamRuleOrganization } from './useTeamRuleOrganization';

const RulesetViewPage = () => {
  const user = useCurrentUser();
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [showResetModal, setShowResetModal] = useState(false);
  // bumped after a reset to force RulesetGeneralView to remount, clearing any open popover/history modal
  const [resetNonce, setResetNonce] = useState(0);
  const tabs = [
    { tabUrlValue: 'generalView', tabName: 'General View' },
    { tabUrlValue: 'teamView', tabName: 'Team View' }
  ];

  const { rulesetId } = useParams<{ rulesetId: string }>();

  const { mutateAsync: resetRulesetStatuses, isLoading: isResetting } = useResetRulesetStatuses(rulesetId!);

  const {
    data: ruleset,
    isError: isRulesetError,
    error: rulesetError,
    isLoading: isRulesetLoading
  } = useSingleRuleset(rulesetId!);

  // General View only needs top-level rules on first render; subrules fetched as dropdowns are expanded
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
  } = useAllRulesForRuleset(rulesetId!, tabIndex === 1);

  // Expand All needs the whole tree, load it on click instead of on page load
  const fetchFullRuleTree = useFetchFullRuleTree(rulesetId!);

  const { expandedIds, toggleExpand, navigateToRule, expandAll, collapseAll, areAllExpanded, isLoadingFullTree } =
    useRuleTreeNavigation(topLevelRules ?? [], fetchFullRuleTree);

  const {
    topLevelItems: teamTopLevelItems,
    rowsById: teamRowsById,
    actualRuleIds: teamActualRuleIds
  } = useTeamRuleOrganization(allRules ?? []);

  const {
    expandedIds: teamExpandedIds,
    toggleExpand: teamToggleExpand,
    expandAll: teamExpandAll,
    collapseAll: teamCollapseAll,
    areAllExpanded: teamAreAllExpanded
  } = useRuleTreeNavigation(teamRowsById);

  if (isRulesetError) {
    return <ErrorPage error={rulesetError} />;
  }

  if (isTopLevelRulesError) {
    return <ErrorPage error={topLevelRulesError} />;
  }

  if (tabIndex === 1 && isRulesError) {
    return <ErrorPage error={rulesError} />;
  }

  if (isRulesetLoading || isTopLevelRulesLoading) {
    return <LoadingIndicator />;
  }

  if (!ruleset || !topLevelRules) {
    return <LoadingIndicator />;
  }

  return (
    <Box>
      <PageLayout
        title={`${ruleset.name} View`}
        previousPages={[
          { name: 'Rules', route: routes.RULES },
          {
            name: `${ruleset.rulesetType?.name} Rulesets`,
            route: `${routes.RULESET_BY_ID.replace(':rulesetTypeId', ruleset.rulesetType.rulesetTypeId)}`
          }
        ]}
        tabs={
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box borderBottom={1} borderColor={'divider'}>
              <FullPageTabs
                noUnderline
                setTab={setTabIndex}
                tabsLabels={tabs}
                baseUrl={routes.RULESET_VIEW.replace(':rulesetId', rulesetId!)}
                defaultTab={'generalView'}
                id="rules-view-tabs"
              />
            </Box>
            {tabIndex === 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isLoadingFullTree && <CircularProgress size={20} />}
                <NERButton variant="outlined" onClick={areAllExpanded ? collapseAll : expandAll}>
                  {areAllExpanded ? 'Collapse All' : 'Expand All'}
                </NERButton>
                {isAdmin(user.role) && (
                  <NERButton variant="outlined" onClick={() => setShowResetModal(true)}>
                    Reset Status
                  </NERButton>
                )}
              </Box>
            )}
            {tabIndex === 1 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isRulesLoading && <CircularProgress size={20} />}
                <NERButton variant="outlined" onClick={teamAreAllExpanded ? teamCollapseAll : teamExpandAll}>
                  {teamAreAllExpanded ? 'Collapse All' : 'Expand All'}
                </NERButton>
              </Box>
            )}
          </Box>
        }
      >
        <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
          {tabIndex === 0 ? (
            <RulesetGeneralView
              key={resetNonce}
              topLevelRules={topLevelRules}
              rulesetId={rulesetId!}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              navigateToRule={navigateToRule}
            />
          ) : isRulesLoading || !allRules ? (
            <LoadingIndicator />
          ) : (
            <RulesetTeamView
              topLevelItems={teamTopLevelItems}
              rowsById={teamRowsById}
              actualRuleIds={teamActualRuleIds}
              expandedIds={teamExpandedIds}
              toggleExpand={teamToggleExpand}
            />
          )}
        </Box>
      </PageLayout>

      {showResetModal && (
        <ResetStatusesModal
          scopeDescription={`the ${ruleset.name} ruleset`}
          disabled={isResetting}
          onHide={() => setShowResetModal(false)}
          onReset={async () => {
            await resetRulesetStatuses();
            setShowResetModal(false);
            setResetNonce((n) => n + 1);
          }}
        />
      )}
    </Box>
  );
};

export default RulesetViewPage;
