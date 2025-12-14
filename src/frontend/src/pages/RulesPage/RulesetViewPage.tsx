import React, { useState } from 'react';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useSingleRuleset } from './RulesetPage';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';

const RulesetViewPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'teamView', tabName: 'Team View' },
    { tabUrlValue: 'generalView', tabName: 'General View' }
  ];

  const { rulesetId } = useParams<{ rulesetId: string }>();

  const { data: ruleset, isError, error, isLoading } = useSingleRuleset(rulesetId);

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (isLoading || !ruleset) {
    return <LoadingIndicator />;
  }

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
              baseUrl={`${routes.RULES}/${rulesetId}/view`}
              defaultTab={'teamView'}
              id="rules-view-tabs"
            />
          </Box>
        }
      >
        {tabIndex === 0 ? (
          <Typography>Team View rules table PLACEHOLDER</Typography>
        ) : (
          <Typography>General View rules table PLACEHOLDER</Typography>
        )}
      </PageLayout>
    </Box>
  );
};

export default RulesetViewPage;
