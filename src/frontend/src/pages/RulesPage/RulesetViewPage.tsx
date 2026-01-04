import React, { useState } from 'react';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import { useParams } from 'react-router-dom';
import { useSingleRuleset } from './RulesetEditPage';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import RulesetGeneralView from './components/RulesetGeneralView';
import { Rule } from 'shared';
import RulesetTeamView, { TeamRules } from './components/RulesetTeamView';

/**
 * Mock function to organize rules by team and project
 * TODO: Replace with actual API calls after parsing PR is merged
 * Will need to call:
 * - GET /rules/:rulesetTypeId/team/:teamId for team rules
 * - GET /rules/ruleset/:rulesetId/project/:projectId/rules for project rules
 * - GET /rules/ruleset/:rulesetId/team/:teamId/rules/unassigned for unassigned team rules
 */
const getMockTeamOrganization = (allRules: Rule[]): { teamRules: TeamRules[]; unassignedToTeam: Rule[] } => {
  const teamRules: TeamRules[] = [
    {
      teamId: 'team1',
      teamName: 'Chassis Team',
      projects: [
        {
          projectId: 'proj1',
          projectName: 'NER-24 Chassis',
          rules: allRules.filter((r) => ['1', '13'].includes(r.ruleId)) // GR and F
        },
        {
          projectId: 'proj2',
          projectName: 'Suspension Design',
          rules: allRules.filter((r) => r.ruleId === '8') // V.3.1
        }
      ],
      unassignedRules: allRules.filter((r) => r.ruleId === '2') // AD
    },
    {
      teamId: 'team2',
      teamName: 'Electrical Team',
      projects: [
        {
          projectId: 'proj3',
          projectName: 'Battery Management System',
          rules: allRules.filter((r) => ['5', '6'].includes(r.ruleId)) // V.1, V.2
        }
      ],
      unassignedRules: []
    }
  ];

  const unassignedToTeam = allRules.filter((r) => ['4', '7', '9'].includes(r.ruleId));

  return { teamRules, unassignedToTeam };
};

const RulesetViewPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'teamView', tabName: 'Team View' },
    { tabUrlValue: 'generalView', tabName: 'General View' }
  ];

  const { rulesetId } = useParams<{ rulesetId: string }>();

  const { data: ruleset, isError, error, isLoading } = useSingleRuleset(rulesetId);

  // team organization mock for now
  const { teamRules, unassignedToTeam } = getMockTeamOrganization(ruleset.rules);

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
        <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
          {tabIndex === 0 ? (
            <RulesetTeamView allRules={ruleset.rules} teamRules={teamRules} unassignedToTeam={unassignedToTeam} />
          ) : (
            <RulesetGeneralView allRules={ruleset.rules} />
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

export default RulesetViewPage;
