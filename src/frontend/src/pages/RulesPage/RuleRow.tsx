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
  backgroundColor: string | ((rule: Rule) => string);
  textColor: string | ((rule: Rule) => string);
  hoverColor: string | ((rule: Rule) => string);
  onRowClick?: (rule: Rule) => void;
  rowHeight?: string;
  verticalPadding?: string;
  horizontalPadding?: string;
  leftWidth?: string;
  middleWidth?: string;
  rightWidth?: string;
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
  onRowClick,
  rowHeight,
  verticalPadding = '12px',
  horizontalPadding = '16px',
  leftWidth = '20%',
  middleWidth = '70%',
  rightWidth = '10%'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubRules = rule.subRuleIds.length > 0;
  const subRules = allRules.filter((r) => rule.subRuleIds.includes(r.ruleId));

  const bgColor = typeof backgroundColor === 'function' ? backgroundColor(rule) : backgroundColor;
  const color = typeof textColor === 'function' ? textColor(rule) : textColor;
  const hoverBgColor = typeof hoverColor === 'function' ? hoverColor(rule) : hoverColor;

  const toggleExpand = () => hasSubRules && setIsExpanded(!isExpanded);

  // if the rule has sub-rules, toggle the expand state, otherwise call the onRowClick function if it exists
  const handleLeftCellClick = () => {
    if (hasSubRules) {
      toggleExpand();
    } else if (onRowClick) {
      onRowClick(rule);
    }
  };

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
        color
      }}
    >
      {hasSubRules && (
        <ChevronRightIcon
          sx={{
            fontSize: '20px',
            color,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      )}
      <span style={{ color }}>{rule.ruleCode}</span>
    </Box>
  );

  return (
    <>
      <TableRow
        sx={{
          borderBottom: '1px solid #7d7d7d',
          backgroundColor: bgColor,
          '&:hover': { backgroundColor: hoverBgColor },
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
            cursor: hasSubRules || onRowClick ? 'pointer' : 'default',
            width: leftWidth
          }}
          onClick={handleLeftCellClick}
        >
          {leftContent ? leftContent(rule, level, isExpanded, hasSubRules) : defaultLeftContent}
        </TableCell>
        <TableCell
          align="left"
          sx={{
            ...commonCellStyles,
            width: middleWidth,
            maxWidth: '700px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal'
          }}
        >
          {middleContent
            ? middleContent(rule, level)
            : rule.ruleContent && <span style={{ color }}>{rule.ruleContent}</span>}
        </TableCell>
        <TableCell
          align="center"
          sx={{
            ...commonCellStyles,
            width: rightWidth
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
            onRowClick={onRowClick}
            rowHeight={rowHeight}
            verticalPadding={verticalPadding}
            horizontalPadding={horizontalPadding}
            leftWidth={leftWidth}
            middleWidth={middleWidth}
            rightWidth={rightWidth}
          />
        ))}
    </>
  );
};

export default RuleRow;
