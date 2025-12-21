/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Button, Paper, Table, TableBody, TableContainer } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import FullPageTabs from '../../components/FullPageTabs';
import { routes } from '../../utils/routes';
import RuleRow from './RuleRow';
import RuleActions from './RuleActions';
import { Rule } from 'shared';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import AddRuleSectionModal from './components/AddRuleSectionModal';
import AddRuleModal from './components/AddRuleModal';
import { AddRuleBox } from './components/AddRuleBox';

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
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '2',
      ruleCode: 'AD - Administrative Regulations',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '3',
      ruleCode: 'DR - Document Requirements',
      ruleContent: '',
      imageFileIds: [],
      parentRule: undefined,
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
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and assigning rules to projects and teams.
 */
const RulesetEditPage: React.FC = () => {
  const { rulesetId } = useParams<{ rulesetId: string; tabValue?: string }>();
  const [tabValue, setTabValue] = useState(0);
  const defaultTab = 'edit-rules';

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuAnchorEl, setAddMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeRuleId, setActiveRuleId] = useState<string | null>(null);

  // temporary placeholder useState fns for the add rule section and add rule modals
  const [showAddRuleSectionModal, setShowAddRuleSectionModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);

  const { data: ruleset, isError, error, isLoading } = useSingleRuleset(rulesetId);

  const tabs = [
    { tabUrlValue: 'edit-rules', tabName: 'Edit Rules' },
    { tabUrlValue: 'assign-rules', tabName: 'Assign Rules' }
  ];

  if (isError) {
    return <ErrorPage error={error} />;
  }

  if (isLoading || !ruleset) {
    return <LoadingIndicator />;
  }

  const handleAddRuleSection = () => {
    // Placeholder
  };

  const handleOpenAddMenu = (ruleId: string, anchorEl: HTMLElement) => {
    // trying to make tests run lol this comment can get deleted later
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

  const handleAddRuleSectionFromMenu = () => {
    setShowAddRuleSectionModal(true);
    handleCloseAddMenu();
  };

  const handleAddRuleFromMenu = () => {
    console.log('Add rule to:', activeRuleId);
    setShowAddRuleModal(true);
    handleCloseAddMenu();
  };

  const handleRemoveRule = (ruleId: string) => {
    // Placeholder
    console.log('Remove rule:', ruleId);
  };

  const handleEditRule = (ruleId: string) => {
    // Placeholder
    console.log('Edit rule:', ruleId);
  };

  // Filter to only show top-level rules
  const topLevelRules = ruleset.rules.filter((rule) => !rule.parentRule);

  return (
    <PageLayout
      title={`${ruleset.name} Rules`}
      tabs={
        <Box sx={{ width: 'fit-content', mt: 2 }}>
          <FullPageTabs
            setTab={setTabValue}
            tabsLabels={tabs}
            baseUrl={`${routes.RULES}/${rulesetId}/edit`}
            defaultTab={defaultTab}
            id="rules-tabs"
          />
        </Box>
      }
    >
      <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
        {tabValue === 0 ? (
          <Box sx={{ paddingBottom: '100px' }}>
            <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Table sx={{ borderCollapse: 'collapse' }}>
                <TableBody sx={{ backgroundColor: '#9d9d9d' }}>
                  {topLevelRules.map((rule) => (
                    <RuleRow
                      key={rule.ruleId}
                      rule={rule}
                      allRules={ruleset.rules}
                      rightContent={(currentRule) => (
                        <RuleActions
                          ruleId={currentRule.ruleId}
                          onAdd={handleOpenAddMenu}
                          onRemove={handleRemoveRule}
                          onEdit={handleEditRule}
                          iconColor="#000000"
                        />
                      )}
                      backgroundColor="#9d9d9d"
                      textColor="#000000"
                      hoverColor="#5e5e5e"
                      rowHeight="10px"
                      verticalPadding="5px"
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <AddRuleBox
              open={showAddMenu}
              anchorEl={addMenuAnchorEl}
              onClose={handleCloseAddMenu}
              onAddRuleSection={handleAddRuleSectionFromMenu}
              onAddRule={handleAddRuleFromMenu}
            />

            <AddRuleSectionModal open={showAddRuleSectionModal} onClose={() => setShowAddRuleSectionModal(false)} />
            <AddRuleModal open={showAddRuleModal} onClose={() => setShowAddRuleModal(false)} />

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
                  borderBottom: '2px solid white',
                  mb: 2,
                  ml: '30px'
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: '30px', pb: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleAddRuleSection}
                  sx={{
                    borderRadius: '8px',
                    color: '#ededed',
                    backgroundColor: '#dd514c',
                    padding: '2px 15px',
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#c74340'
                    }
                  }}
                >
                  Add Rule Section
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box>{/* Assign Rules tab content will be added in a future ticket */}</Box>
        )}
      </Box>
    </PageLayout>
  );
};

export default RulesetEditPage;
