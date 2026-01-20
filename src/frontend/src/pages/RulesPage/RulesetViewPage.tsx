import React, { useState } from 'react';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import { useParams } from 'react-router-dom';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import RulesetGeneralView from './components/RulesetGeneralView';
import { Rule } from 'shared';
import RulesetTeamView, { TeamRules } from './components/RulesetTeamView';
import { useSingleRuleset, useAllRulesForRuleset } from '../../hooks/rules.hooks';

/**
 * Organizes rules by team and project assignments.
 * Rules without team assignments are shown in the unassigned section.
 */
const getTeamOrganization = (allRules: Rule[]): { teamRules: TeamRules[]; unassignedToTeam: Rule[] } => {
  const teamRules: TeamRules[] = [];
  const unassignedToTeam = allRules.filter((r) => !r.parentRule);

  return { teamRules, unassignedToTeam };
};

const RulesetViewPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'teamView', tabName: 'Team View' },
    { tabUrlValue: 'generalView', tabName: 'General View' }
  ];

  const { rulesetId } = useParams<{ rulesetId: string }>();
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

  if (isRulesetLoading || isRulesLoading) {
    return <LoadingIndicator />;
  }

  if (isRulesetError) {
    return <ErrorPage error={rulesetError} />;
  }

  if (isRulesError) {
    return <ErrorPage error={rulesError} />;
  }

  if (!ruleset || !allRules) {
    return <LoadingIndicator />;
  }

  const { teamRules, unassignedToTeam } = getTeamOrganization(allRules);

  return (
    <Box>
      <PageLayout
        title={ruleset.name}
        tabs={
          <Box borderBottom={1} borderColor={'divider'}>
            <FullPageTabs
              noUnderline
              setTab={setTabIndex}
              tabsLabels={tabs}
              baseUrl={routes.RULESET_VIEW.replace(':rulesetId', rulesetId!)}
              defaultTab={'teamView'}
              id="rules-view-tabs"
            />
          </Box>
        }
      >
        <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
          {tabIndex === 0 ? (
            <RulesetTeamView allRules={allRules} teamRules={teamRules} unassignedToTeam={unassignedToTeam} />
          ) : (
            <RulesetGeneralView allRules={allRules} />
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

export default RulesetViewPage;
