/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TableCell, TableRow, Box } from '@mui/material';
import { useState } from 'react';
import { Rule } from 'shared';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface RuleRowProps {
  rule: Rule;
  allRules: Rule[];
  level?: number;
  leftContent?: (rule: Rule, level: number, isExpanded: boolean, hasSubRules: boolean) => React.ReactNode;
  middleContent?: (rule: Rule, level: number) => React.ReactNode;
  rightContent: (rule: Rule, level: number) => React.ReactNode;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  rowHeight?: string;
  verticalPadding?: string;
  horizontalPadding?: string;
}

/**
 * Recursive component for rendering a rule row in a rules table.
 * Supports expand/collapsing of rules with sub-rules.
 */
const RuleRow: React.FC<RuleRowProps> = ({
  rule,
  allRules,
  level = 0,
  leftContent,
  middleContent,
  rightContent,
  backgroundColor,
  textColor,
  hoverColor,
  rowHeight,
  verticalPadding = '12px',
  horizontalPadding = '16px'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubRules = rule.subRuleIds.length > 0;
  const subRules = allRules.filter((r) => rule.subRuleIds.includes(r.ruleId));

  const toggleExpand = () => hasSubRules && setIsExpanded(!isExpanded);

  const commonCellStyles = {
    fontSize: '16px',
    padding: `${verticalPadding} ${horizontalPadding}`,
    backgroundColor: 'inherit',
    borderBottom: 'none',
    height: rowHeight
  };

  const defaultLeftContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        paddingLeft: `${level * 20}px`,
        color: textColor
      }}
    >
      {hasSubRules && (
        <ChevronRightIcon
          sx={{
            fontSize: '20px',
            color: textColor,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      )}
      <span style={{ color: textColor }}>{rule.ruleCode}</span>
    </Box>
  );

  return (
    <>
      <TableRow
        sx={{
          borderBottom: '1px solid #7d7d7d',
          backgroundColor,
          '&:hover': { backgroundColor: hoverColor },
          '&:last-child': {
            borderBottom: 'none'
          },
          height: rowHeight
        }}
      >
        <TableCell
          align="left"
          sx={{
            ...commonCellStyles,
            cursor: hasSubRules ? 'pointer' : 'default',
            width: '20%'
          }}
          onClick={hasSubRules ? toggleExpand : undefined}
        >
          {leftContent ? leftContent(rule, level, isExpanded, hasSubRules) : defaultLeftContent}
        </TableCell>
        <TableCell
          align="left"
          sx={{
            ...commonCellStyles,
            width: '70%',
            maxWidth: '700px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal'
          }}
        >
          {middleContent
            ? middleContent(rule, level)
            : rule.ruleContent && <span style={{ color: textColor }}>{rule.ruleContent}</span>}
        </TableCell>
        <TableCell
          align="center"
          sx={{
            ...commonCellStyles,
            width: '10%'
          }}
        >
          {rightContent(rule, level)}
        </TableCell>
      </TableRow>
      {isExpanded &&
        hasSubRules &&
        subRules.map((subRule) => (
          <RuleRow
            key={subRule.ruleId}
            rule={subRule}
            allRules={allRules}
            level={level + 1}
            leftContent={leftContent}
            middleContent={middleContent}
            rightContent={rightContent}
            backgroundColor={backgroundColor}
            textColor={textColor}
            hoverColor={hoverColor}
            rowHeight={rowHeight}
            verticalPadding={verticalPadding}
            horizontalPadding={horizontalPadding}
          />
        ))}
    </>
  );
};

export default RuleRow;
