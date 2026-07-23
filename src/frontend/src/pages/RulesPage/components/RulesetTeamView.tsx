import React from 'react';
import { Box, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { Rule } from 'shared';
import RuleRow from '../RuleRow';

interface RulesetTeamViewProps {
  topLevelItems: Rule[];
  rowsById: Rule[];
  actualRuleIds: Set<string>;
  expandedIds: Set<string>;
  toggleExpand: (ruleId: string) => void;
}

/**
 * Displays rules organized by team and project.
 * Teams, projects, and unassigned sections are all rendered as RuleRows for consistent formatting.
 */
const RulesetTeamView: React.FC<RulesetTeamViewProps> = ({
  topLevelItems,
  rowsById,
  actualRuleIds,
  expandedIds,
  toggleExpand
}) => {
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
            {topLevelItems.map((item) => (
              <RuleRow
                key={item.ruleId}
                rule={item}
                allRules={rowsById}
                rightContent={() => null}
                backgroundColor={tableBackgroundColor}
                textColor={tableTextColor}
                hoverColor={tableHoverColor}
                rowHeight="40px"
                verticalPadding="8px"
                indentRow
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                fullWidthCode={(rule) => !actualRuleIds.has(rule.ruleId)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RulesetTeamView;
