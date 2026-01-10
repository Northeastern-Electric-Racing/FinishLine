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
import { useGetRuleset, useGetTopLevelRules, useGetUnassignedTeamRulesInRuleset } from '../../hooks/rules.hooks';
import { useAllTeams } from '../../hooks/teams.hooks';
import { Rule } from 'shared';

const RulesetViewPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'teamView', tabName: 'Team View' },
    { tabUrlValue: 'generalView', tabName: 'General View' }
  ];

  const { rulesetId } = useParams<{ rulesetId: string }>();

  const {
    data: ruleset,
    isLoading: rulesetLoading,
    isError: rulesetError,
    error: rulesetErrorMsg
  } = useGetRuleset(rulesetId);

  const {
    data: topLevelRules = [],
    isError: rulesError,
    error: rulesErrorMsg,
    isLoading: rulesLoading
  } = useGetTopLevelRules(rulesetId);

  const { data: teams = [], isError: teamsError, error: teamsErrorMsg, isLoading: teamsLoading } = useAllTeams();

  if (rulesetError) {
    return <ErrorPage error={rulesetErrorMsg} />;
  }

  if (rulesError) {
    return <ErrorPage error={rulesErrorMsg} />;
  }

  if (teamsError) {
    return <ErrorPage error={teamsErrorMsg} />;
  }

  if (rulesetLoading || rulesLoading || teamsLoading || !ruleset) {
    return <LoadingIndicator />;
  }

  const teamData = teams.map((team) => {
    // TODO: Fetch team rules for each team
    const {
      data: teamRules = [],
      isLoading: teamRulesLoading,
      isError: teamRulesError
    } = useGetTeamRulesInRuleset(rulesetId, team.teamId);

    // Fetch unassigned rules for each team
    const {
      data: unassignedTeamRules = [],
      isLoading: unassignedTeamRulesLoading,
      isError: unassignedTeamRulesError
    } = useGetUnassignedTeamRulesInRuleset(rulesetId, team.teamId);

    return {
      team,
      teamRules,
      unassignedTeamRules,
      isLoading: teamRulesLoading || unassignedTeamRulesLoading,
      isError: teamRulesError || unassignedTeamRulesError
    };
  });

  // TODO: fetch unassigned rules not assigned to any team
  const unassignedToAllTeams: Rule[] = [];

  const anyTeamLoading = teamData.some((team) => team.isLoading);
  if (anyTeamLoading) {
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
              baseUrl={routes.RULESET_VIEW.replace(':rulesetId', rulesetId)}
              defaultTab={'teamView'}
              id="rules-view-tabs"
            />
          </Box>
        }
      >
        <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
          {tabIndex === 0 ? (
            <RulesetTeamView allRules={topLevelRules} teamRules={teamData} unassignedToTeam={unassignedToAllTeams} />
          ) : (
            <RulesetGeneralView allRules={topLevelRules} />
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

export default RulesetViewPage;
