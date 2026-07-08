import React, { useState } from 'react';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import { useParams } from 'react-router-dom';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import RulesetGeneralView from './components/RulesetGeneralView';
import RulesetTeamView from './components/RulesetTeamView';
import { useSingleRuleset, useAllRulesForRuleset } from '../../hooks/rules.hooks';

const RulesetViewPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'generalView', tabName: 'General View' },
    { tabUrlValue: 'teamView', tabName: 'Team View' }
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

  if (isRulesetError) {
    return <ErrorPage error={rulesetError} />;
  }

  if (isRulesError) {
    return <ErrorPage error={rulesError} />;
  }

  if (isRulesetLoading || isRulesLoading) {
    return <LoadingIndicator />;
  }

  if (!ruleset || !allRules) {
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
        }
      >
        <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
          {tabIndex === 0 ? (
            <RulesetTeamView allRules={allRules} />
          ) : (
            <RulesetGeneralView allRules={allRules} rulesetId={rulesetId!} />
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

export default RulesetViewPage;
