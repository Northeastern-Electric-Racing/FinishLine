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
  const teamMap = new Map<string, TeamRules>();
  const unassignedToTeam: Rule[] = [];

  // Iterate through all rules and organize by team
  allRules.forEach((rule) => {
    if (!rule.teams || rule.teams.length === 0) {
      // Only add to unassigned if it's a top-level rule (no parent)
      if (!rule.parentRule) {
        unassignedToTeam.push(rule);
      }
    } else {
      // Add rule to each assigned team (includes both parents and children)
      rule.teams.forEach((team) => {
        if (!teamMap.has(team.teamId)) {
          teamMap.set(team.teamId, {
            teamId: team.teamId,
            teamName: team.teamName,
            projects: [],
            unassignedRules: []
          });
        }

        const teamRules = teamMap.get(team.teamId)!;
        if (!rule.parentRule) {
          teamRules.unassignedRules.push(rule);
        }
      });
    }
  });

  return { teamRules: Array.from(teamMap.values()), unassignedToTeam };
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

  const { teamRules, unassignedToTeam } = getTeamOrganization(allRules);

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
            <RulesetGeneralView allRules={allRules} rulesetId={rulesetId!} />
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

export default RulesetViewPage;
