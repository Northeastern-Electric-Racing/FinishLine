/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, useTheme } from '@mui/material';
import { Rule } from 'shared';

interface RuleContentProps {
  rule: Rule;
  rulesById: Map<string, Rule>;
  color?: string;
  onReferenceClick?: (ruleId: string) => void; // if true, clicking a referenced code navigates to it
  onReferenceRemove?: (ruleId: string) => void; // if true, referenced code turns red on hover and clicking it starts removal (for edit view)
}

/**
 * Renders a rule's content followed by a bracketed underlined list of its referenced rule codes.
 */
const RuleContent: React.FC<RuleContentProps> = ({ rule, rulesById, color, onReferenceClick, onReferenceRemove }) => {
  const theme = useTheme();

  const referencedRules = rule.referencedRuleIds.map((id) => rulesById.get(id)).filter((r): r is Rule => Boolean(r));

  const handleReferenceClick = (referencedRuleId: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReferenceClick) {
      onReferenceClick(referencedRuleId);
    } else if (onReferenceRemove) {
      onReferenceRemove(referencedRuleId);
    }
  };

  const interactive = Boolean(onReferenceClick || onReferenceRemove);

  return (
    <span style={{ color }}>
      {rule.ruleContent}
      {referencedRules.length > 0 && (
        <Box component="span" sx={{ ml: 0.5 }}>
          {' [ '}
          {referencedRules.map((ref, index) => (
            <Box component="span" key={ref.ruleId}>
              {index > 0 && ', '}
              <Box
                component="span"
                onClick={interactive ? handleReferenceClick(ref.ruleId) : undefined}
                sx={{
                  textDecoration: 'underline',
                  cursor: interactive ? 'pointer' : 'default',
                  // In edit view, hovering over a referenced rule code highlights it red to signal removal
                  ...(onReferenceRemove && { '&:hover': { color: theme.palette.primary.main } })
                }}
              >
                {ref.ruleCode}
              </Box>
            </Box>
          ))}
          {' ]'}
        </Box>
      )}
    </span>
  );
};

export default RuleContent;
