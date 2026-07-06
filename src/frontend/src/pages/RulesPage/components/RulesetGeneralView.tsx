import React, { useState } from 'react';
import { Box, Paper, Table, TableBody, TableContainer } from '@mui/material';
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
  const toast = useToast();
  const [statusPopoverAnchor, setStatusPopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  // Completion here is ruleset-wide (no project context), so no projectId is passed
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
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table sx={{ borderCollapse: 'collapse' }}>
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
