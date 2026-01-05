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

/**
 * Placeholder hook to fetch a single ruleset.
 * @param rulesetId - The ID of the ruleset to fetch.
 * @returns The ruleset data.
 */
export const useSingleRuleset = (rulesetId: string) => {
  const placeholderRules: Rule[] = [
    {
      ruleId: '1',
      ruleCode: 'GR - General Regulations',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: ['1.1'],
      referencedRuleIds: []
    },
    {
      ruleId: '1.1',
      ruleCode: 'G.1',
      ruleContent: 'Content for G.1 Rule',
      imageFileIds: [],
      parentRule: { ruleId: '1', ruleCode: 'GR - General Regulations' },
      subRuleIds: ['1.1.1'],
      referencedRuleIds: []
    },
    {
      ruleId: '1.1.1',
      ruleCode: 'G.1.1',
      ruleContent: 'Content for G.1.1 Rule',
      imageFileIds: [],
      parentRule: { ruleId: '1.1', ruleCode: 'G.1' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '2',
      ruleCode: 'AD - Administrative Regulations',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: ['2.1'],
      referencedRuleIds: []
    },
    {
      ruleId: '2.1',
      ruleCode: 'AD.1',
      ruleContent: 'Content for AD.1 Rule',
      imageFileIds: [],
      parentRule: { ruleId: '2', ruleCode: 'AD - Administrative Regulations' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '3',
      ruleCode: 'DR - Document Requirements',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: ['3.1'],
      referencedRuleIds: []
    },
    {
      ruleId: '3.1',
      ruleCode: 'DR.1',
      ruleContent: 'Content for DR.1 Rule',
      imageFileIds: [],
      parentRule: { ruleId: '3', ruleCode: 'DR - Document Requirements' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '4',
      ruleCode: 'V - Vehicle Requirements',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: ['5', '6', '7'],
      referencedRuleIds: []
    },
    {
      ruleId: '5',
      ruleCode: 'V.1 - Configuration',
      ruleContent: '',
      imageFileIds: [],
      parentRule: { ruleId: '4', ruleCode: 'V - Vehicle Requirements' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '6',
      ruleCode: 'V.2 - Driver',
      ruleContent: '',
      imageFileIds: [],
      parentRule: { ruleId: '4', ruleCode: 'V - Vehicle Requirements' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '7',
      ruleCode: 'V.3 - Suspension and Steering',
      ruleContent: '',
      imageFileIds: [],
      parentRule: { ruleId: '4', ruleCode: 'V - Vehicle Requirements' },
      subRuleIds: ['8', '9'],
      referencedRuleIds: []
    },
    {
      ruleId: '8',
      ruleCode: 'V.3.1 - Suspension',
      ruleContent: '',
      imageFileIds: [],
      parentRule: { ruleId: '7', ruleCode: 'V.3 - Suspension and Steering' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '9',
      ruleCode: 'V.3.2 - Steering',
      ruleContent: '',
      imageFileIds: [],
      parentRule: { ruleId: '7', ruleCode: 'V.3 - Suspension and Steering' },
      subRuleIds: ['10', '11', '12'],
      referencedRuleIds: []
    },
    {
      ruleId: '10',
      ruleCode: 'V.3.2.1',
      ruleContent:
        'Some super long rule content that should wrap to the next line, Some super long rule content that should wrap to the next line, Some super long rule content that should wrap to the next line, Some super long rule content that should wrap to the next line',
      imageFileIds: [],
      parentRule: { ruleId: '9', ruleCode: 'V.3.2 - Steering' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '11',
      ruleCode: 'V.3.2.2',
      ruleContent: 'Electrically actuated steering of the front wheels is prohibited',
      imageFileIds: [],
      parentRule: { ruleId: '9', ruleCode: 'V.3.2 - Steering' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '12',
      ruleCode: 'V.3.2.3',
      ruleContent:
        'Steering systems must use a rigid mechanical linkage capable of tension and compression loads for operation',
      imageFileIds: [],
      parentRule: { ruleId: '9', ruleCode: 'V.3.2 - Steering' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '13',
      ruleCode: 'F - Chassis and Structural',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: ['13.1'],
      referencedRuleIds: []
    },
    {
      ruleId: '13.1',
      ruleCode: 'F.1',
      ruleContent: 'Content for F.1 Rule',
      imageFileIds: [],
      parentRule: { ruleId: '13', ruleCode: 'F - Chassis and Structural' },
      subRuleIds: [],
      referencedRuleIds: []
    }
  ];

  return {
    data: { name: 'FSAE Original Version', rulesetId, rules: placeholderRules },
    isLoading: false,
    isError: false,
    error: undefined
  };
};

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
              baseUrl={routes.RULESET_VIEW.replace(':rulesetId', rulesetId)}
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
