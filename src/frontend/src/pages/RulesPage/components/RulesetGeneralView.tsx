import React, { useCallback, useMemo, useState } from 'react';
import { Box, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { Rule, RuleStatus, isLeadership } from 'shared';
import RuleRow from '../RuleRow';
import RuleStatusTag from './RuleStatusTag';
import RuleContent from './RuleContent';
import RuleStatusHistoryModal from './RuleStatusHistoryModal';
import { useSetRuleStatus } from '../../../hooks/rules.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { compareRuleCodes } from '../../../utils/rules.utils';

interface RulesetGeneralViewProps {
  topLevelRules: Rule[];
  rulesetId: string;
  expandedIds: Set<string>;
  toggleExpand: (ruleId: string) => void;
  navigateToRule: (ruleId: string) => void;
}

/**
 * General view for displaying all top-level rules as dropdowns.
 * Subrules are fetched only when a rule is expanded.
 */
const RulesetGeneralView: React.FC<RulesetGeneralViewProps> = ({
  topLevelRules,
  rulesetId,
  expandedIds,
  toggleExpand,
  navigateToRule
}) => {
  const theme = useTheme();
  const toast = useToast();
  const user = useCurrentUser();
  const [historyModalRule, setHistoryModalRule] = useState<Rule | null>(null);
  // the rule currently being written, so only its checkboxes disable
  const [pendingRuleId, setPendingRuleId] = useState<string | null>(null);

  const canUpdateStatus = isLeadership(user.role);

  const backgroundColor = theme.palette.background.default;
  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  // Status in general view is independent of any project
  const { mutateAsync: setStatus } = useSetRuleStatus(rulesetId);

  // Sort once by rule code so top-level rows render in a stable numeric order.
  const sortedTopLevelRules = useMemo(() => [...topLevelRules].sort(compareRuleCodes), [topLevelRules]);

  const handleStatusChange = useCallback(
    async (ruleId: string, status: RuleStatus) => {
      setPendingRuleId(ruleId);
      try {
        await setStatus({ ruleId, status });
        toast.success('Rule status updated successfully');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setPendingRuleId(null);
      }
    },
    [setStatus, toast]
  );

  // Hoisted out of the JSX so their identity is stable across renders of this component. Without this
  // every RuleRow re-renders whenever any state here changes, and memo(RuleRow) can never hold.
  const renderMiddleContent = useCallback(
    (r: Rule) => <RuleContent rule={r} onReferenceClick={navigateToRule} color={tableTextColor} />,
    [navigateToRule, tableTextColor]
  );

  const renderRightContent = useCallback(
    (r: Rule) => (
      <RuleStatusTag
        rule={r}
        isLeaf={r.subRuleIds.length === 0}
        onStatusChange={canUpdateStatus ? (status) => handleStatusChange(r.ruleId, status) : undefined}
        disabled={pendingRuleId === r.ruleId}
        onInfoClick={setHistoryModalRule}
      />
    ),
    [canUpdateStatus, handleStatusChange, pendingRuleId]
  );

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden', backgroundColor }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 8px', backgroundColor }}>
          <TableBody>
            {sortedTopLevelRules.map((rule) => (
              <RuleRow
                key={rule.ruleId}
                rule={rule}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                middleContent={renderMiddleContent}
                rightContent={renderRightContent}
                backgroundColor={tableBackgroundColor}
                textColor={tableTextColor}
                hoverColor={tableHoverColor}
                rowHeight="40px"
                verticalPadding="8px"
                indentRow
                windowChildren
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {historyModalRule && <RuleStatusHistoryModal open onClose={() => setHistoryModalRule(null)} rule={historyModalRule} />}
    </Box>
  );
};

export default RulesetGeneralView;
