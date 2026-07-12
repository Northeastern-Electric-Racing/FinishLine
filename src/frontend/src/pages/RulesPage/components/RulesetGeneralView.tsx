import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Paper, Table, TableBody, TableContainer, useTheme } from '@mui/material';
import { Rule } from 'shared';
import RuleRow from '../RuleRow';
import RuleStatusTag from './RuleStatusTag';
import RuleContent from './RuleContent';
import UpdateStatusPopover from '../../ProjectDetailPage/ProjectViewContainer/ProjectRules/UpdateStatusPopover';
import { useSetRuleCompletion } from '../../../hooks/rules.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { compareRuleCodes, getAncestorIds } from '../../../utils/rules.utils';

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

  // Clicking referenced rule link opens target rule's ancestor chain and scrolls to it
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set()); // the set of ruleIds currently expanded
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null); // a rule we want to scroll to

  const backgroundColor = theme.palette.background.default;
  const tableBackgroundColor = theme.palette.background.paper;
  const tableTextColor = theme.palette.text.primary;
  const tableHoverColor = theme.palette.action.hover;

  // Completion in general view is for the whole ruleset, so no projectId is passed in
  const { mutateAsync: setCompletion } = useSetRuleCompletion(rulesetId, '');

  // Sort once by rule code so both top-level rows and their children render in a stable numeric order.
  const sortedRules = useMemo(() => [...allRules].sort(compareRuleCodes), [allRules]);
  const topLevelRules = useMemo(() => sortedRules.filter((rule) => !rule.parentRule), [sortedRules]);
  const rulesById = useMemo(() => new Map(allRules.map((r) => [r.ruleId, r])), [allRules]);

  // Flip a single rule's expanded state
  const toggleExpand = useCallback((ruleId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  }, []);

  // Called when a referenced-rule link is clicked
  const navigateToRule = useCallback(
    (targetId: string) => {
      const ancestors = getAncestorIds(targetId, allRules);
      setExpandedIds((prev) => new Set([...prev, ...ancestors, targetId]));
      setPendingScrollId(targetId);
    },
    [allRules]
  );

  // Once reference rule expansion is complete, scroll to it
  useEffect(() => {
    if (!pendingScrollId) return;
    const node = document.getElementById(`rule-row-${pendingScrollId}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPendingScrollId(null);
    }
  }, [pendingScrollId, expandedIds]);

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
                allRules={sortedRules}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                middleContent={(r) => (
                  <RuleContent rule={r} rulesById={rulesById} onReferenceClick={navigateToRule} color={tableTextColor} />
                )}
                rightContent={(r) => (
                  <RuleStatusTag
                    rule={r}
                    allRules={sortedRules}
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
