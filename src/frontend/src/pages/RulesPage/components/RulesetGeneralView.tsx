import React, { useState } from 'react';
import { Box, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { Rule } from 'shared';
import RuleRow from '../RuleRow';
import RuleStatusTag from './RuleStatusTag';
import UpdateStatusPopover from '../../ProjectDetailPage/ProjectViewContainer/ProjectRules/UpdateStatusPopover';
import { useSetRuleCompletion } from '../../../hooks/rules.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

interface RulesetGeneralViewProps {
  allRules: Rule[];
  rulesetId: string;
}

/**
 * general view for displaying all top-level rules as dropdowns
 */
const RulesetGeneralView: React.FC<RulesetGeneralViewProps> = ({ allRules, rulesetId }) => {
  const theme = useTheme();
  const toast = useToast();
  const [statusPopoverAnchor, setStatusPopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const backgroundColor = theme.palette.background.default;
  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  // Completion in general view is for the whole ruleset, so no projectId is passed in
  const { mutateAsync: setCompletion } = useSetRuleCompletion(rulesetId, '');

  const topLevelRules = allRules.filter((rule) => !rule.parentRule);

  const handleStatusClose = () => {
    setStatusPopoverAnchor(null);
    setSelectedRule(null);
  };

  const handleStatusChange = async (ruleId: string, isComplete: boolean) => {
    try {
      await setCompletion({ ruleId, isComplete });
      toast.success('Rule completion updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden', backgroundColor }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 8px', backgroundColor }}>
          <TableBody>
            {topLevelRules.map((rule) => (
              <RuleRow
                key={rule.ruleId}
                rule={rule}
                allRules={allRules}
                rightContent={(r) => (
                  <RuleStatusTag
                    rule={r}
                    allRules={allRules}
                    popoverOpen={selectedRule?.ruleId === r.ruleId && Boolean(statusPopoverAnchor)}
                    onClick={(e) => {
                      setSelectedRule(r);
                      setStatusPopoverAnchor(e.currentTarget);
                    }}
                  />
                )}
                backgroundColor={tableBackgroundColor}
                textColor={tableTextColor}
                hoverColor={tableHoverColor}
                rowHeight="40px"
                verticalPadding="8px"
                indentRow
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedRule && (
        <UpdateStatusPopover
          anchorEl={statusPopoverAnchor}
          onClose={handleStatusClose}
          rule={selectedRule}
          onStatusChange={handleStatusChange}
        />
      )}
    </Box>
  );
};

export default RulesetGeneralView;
