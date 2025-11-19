/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import FullPageTabs from '../../components/FullPageTabs';
import { routes } from '../../utils/routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

// Placeholder
const useSingleRuleset = (rulesetId: string) => {
  const placeholderRules = [
    {
      ruleId: '1',
      ruleCode: 'GR - General Regulations',
      ruleContent: 'General Regulations',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '2',
      ruleCode: 'AD - Administrative Regulations',
      ruleContent: 'Administrative Regulations',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '3',
      ruleCode: 'DR - Document Requirements',
      ruleContent: 'Document Requirements',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '4',
      ruleCode: 'V - Vehicle Requirements',
      ruleContent: 'Vehicle Requirements',
      imageFileIds: [],
      parentRule: undefined,
      subRuleIds: ['5', '6', '7'],
      referencedRuleIds: []
    },
    {
      ruleId: '5',
      ruleCode: 'V.1 - Configuration',
      ruleContent: 'Configuration',
      imageFileIds: [],
      parentRule: { ruleId: '4', ruleCode: 'V - Vehicle Requirements' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '6',
      ruleCode: 'V.2 - Driver',
      ruleContent: 'Driver',
      imageFileIds: [],
      parentRule: { ruleId: '4', ruleCode: 'V - Vehicle Requirements' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '7',
      ruleCode: 'V.3 - Suspension and Steering',
      ruleContent: 'Suspension and Steering',
      imageFileIds: [],
      parentRule: { ruleId: '4', ruleCode: 'V - Vehicle Requirements' },
      subRuleIds: ['8', '9'],
      referencedRuleIds: []
    },
    {
      ruleId: '8',
      ruleCode: 'V.3.1 - Suspension',
      ruleContent: 'Suspension',
      imageFileIds: [],
      parentRule: { ruleId: '7', ruleCode: 'V.3 - Suspension and Steering' },
      subRuleIds: [],
      referencedRuleIds: []
    },
    {
      ruleId: '9',
      ruleCode: 'V.3.2 - Steering',
      ruleContent: 'Steering',
      imageFileIds: [],
      parentRule: { ruleId: '7', ruleCode: 'V.3 - Suspension and Steering' },
      subRuleIds: ['10', '11', '12'],
      referencedRuleIds: []
    },
    {
      ruleId: '10',
      ruleCode: 'V.3.2.1',
      ruleContent: 'The Steering Wheel must be mechanically connected to the front wheels',
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
      ruleContent: 'Chassis and Structural',
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

const RulesetPage: React.FC = () => {
  const { rulesetId } = useParams<{ rulesetId: string; tabValue?: string }>();
  const [tabValue, setTabValue] = useState(0);
  const defaultTab = 'edit-rules';

  const { data: ruleset, isLoading, isError, error } = useSingleRuleset(rulesetId || '');

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

  return (
    <PageLayout
      title={`${ruleset.name} Rules`}
      tabs={
        <Box sx={{ width: 'fit-content', mt: 2 }}>
          <FullPageTabs
            setTab={setTabValue}
            tabsLabels={tabs}
            baseUrl={`${routes.RULES}/${rulesetId}`}
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
              <Table>
                <TableBody sx={{ backgroundColor: '#9d9d9d' }}>
                  {ruleset.rules?.map((rule) => (
                    <TableRow
                      key={rule.ruleId}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#5e5e5e' }
                      }}
                    >
                      <TableCell align="left" sx={{ color: '#000000', fontSize: '16px' }}>
                        {rule.ruleCode}
                      </TableCell>
                      <TableCell align="left" sx={{ color: '#000000', fontSize: '16px' }}>
                        {rule.ruleContent}
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#000000', fontSize: '16px' }}>
                        {/* Actions will be added in a future ticket */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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

export default RulesetPage;
