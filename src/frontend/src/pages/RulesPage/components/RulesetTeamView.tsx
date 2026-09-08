import React from 'react';
import { Box, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { Rule } from 'shared';
import RuleRow from '../RuleRow';
import RuleContent from './RuleContent';
import { RuleExpansionProvider, RuleExpansionStore } from '../ruleExpansion';

interface RulesetTeamViewProps {
  topLevelItems: Rule[];
  rowsById: Rule[];
  actualRuleIds: Set<string>;
  expansionStore: RuleExpansionStore;
}

/**
 * Displays rules organized by team and project.
 * Teams, projects, and unassigned sections are all rendered as RuleRows for consistent formatting.
 */
const RulesetTeamView: React.FC<RulesetTeamViewProps> = ({ topLevelItems, rowsById, actualRuleIds, expansionStore }) => {
  const theme = useTheme();

  const backgroundColor = theme.palette.background.default;
  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden', backgroundColor }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 8px', backgroundColor }}>
          <TableBody>
            <RuleExpansionProvider value={expansionStore}>
              {topLevelItems.map((item) => (
                <RuleRow
                  key={item.ruleId}
                  rule={item}
                  allRules={rowsById}
                  middleContent={(r) => <RuleContent rule={r} color={tableTextColor} />}
                  rightContent={() => null}
                  backgroundColor={tableBackgroundColor}
                  textColor={tableTextColor}
                  hoverColor={tableHoverColor}
                  rowHeight="40px"
                  verticalPadding="8px"
                  indentRow
                  fullWidthCode={(rule) => !actualRuleIds.has(rule.ruleId)}
                />
              ))}
            </RuleExpansionProvider>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RulesetTeamView;
