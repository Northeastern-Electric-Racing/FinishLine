import React from 'react';
import { Box, Paper, Table, TableBody, TableContainer } from '@mui/material';
import { Rule } from 'shared';
import RuleRow from '../RuleRow';

interface RulesetGeneralViewProps {
  allRules: Rule[];
}

/**
 * general view for displaying all top-level rules as dropdowns
 */
const RulesetGeneralView: React.FC<RulesetGeneralViewProps> = ({ allRules }) => {
  const topLevelRules = allRules.filter((rule) => !rule.parentRule);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table sx={{ borderCollapse: 'collapse' }}>
          <TableBody>
            {topLevelRules.map((rule) => (
              <RuleRow
                key={rule.ruleId}
                rule={rule}
                allRules={allRules}
                rightContent={() => null}
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
    </Box>
  );
};

export default RulesetGeneralView;
