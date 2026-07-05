/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TableCell, TableRow, Box } from '@mui/material';
import { useState } from 'react';
import { Rule } from 'shared';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useGetChildRules } from '../../hooks/rules.hooks';

interface RuleRowProps {
  rule: Rule;
  allRules?: Rule[];
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
  initiallyExpanded?: boolean;
  // When true, the entire rule is shifted right per child depth
  indentRow?: boolean;
  // Amount of indentation per child depth when indentRow is enabled
  indentWidth?: number;
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
  leftWidth = '10%',
  middleWidth = '80%',
  rightWidth = '10%',
  initiallyExpanded = false,
  indentRow = false,
  indentWidth = 10
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  // a parent rule whose sub rules aren't in the set (e.g. rule T.1 was assigned to a project but T.1.1 wasn't)
  // will render as a leaf rule but with no expand dropdown
  const presentSubRules = allRules ? allRules.filter((r) => rule.subRuleIds.includes(r.ruleId)) : null;
  const hasSubRules = presentSubRules ? presentSubRules.length > 0 : rule.subRuleIds.length > 0;

  // Lazy load if allRules not provided
  const { data: fetchedSubRules = [] } = useGetChildRules(rule.ruleId, !allRules && isExpanded && hasSubRules);

  // Use allRules if provided, otherwise use fetched
  const subRules = presentSubRules ?? fetchedSubRules;

  const bgColor = typeof backgroundColor === 'function' ? backgroundColor(rule) : backgroundColor;
  const color = typeof textColor === 'function' ? textColor(rule) : textColor;
  const hoverBgColor = typeof hoverColor === 'function' ? hoverColor(rule) : hoverColor;

  const toggleExpand = () => hasSubRules && setIsExpanded(!isExpanded);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand();
  };

  const handleRowClick = () => {
    if (onRowClick) {
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

  const cardRadius = 8;
  const cardCellBg = indentRow ? { backgroundColor: bgColor } : {};
  const cardCellClass = indentRow ? 'rule-card-cell' : undefined;
  // Indent left edge of rule with transparent left border
  const leftInset = indentRow ? level * indentWidth : 0;
  const leftCellRadius = indentRow
    ? {
        borderTopLeftRadius: `${leftInset + cardRadius}px ${cardRadius}px`,
        borderBottomLeftRadius: `${leftInset + cardRadius}px ${cardRadius}px`
      }
    : {};
  const rightCellRadius = indentRow
    ? { borderTopRightRadius: `${cardRadius}px`, borderBottomRightRadius: `${cardRadius}px` }
    : {};

  const defaultLeftContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        paddingLeft: indentRow ? 0 : `${level * 20}px`,
        color
      }}
    >
      {hasSubRules && (
        <ChevronRightIcon
          onClick={handleChevronClick}
          sx={{
            fontSize: '20px',
            color,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderRadius: '50%'
            }
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
          backgroundColor: indentRow ? 'transparent' : bgColor,
          '&:hover': indentRow
            ? { '& .rule-card-cell': { backgroundColor: hoverBgColor } }
            : { backgroundColor: hoverBgColor },
          '&:last-child': {
            borderBottom: 'none'
          },
          height: rowHeight
        }}
      >
        <TableCell
          align="left"
          className={cardCellClass}
          sx={{
            ...commonCellStyles,
            ...cardCellBg,
            ...leftCellRadius,
            // Indent left edge of rule with transparent left border
            ...(indentRow && {
              borderLeft: `${level * indentWidth}px solid transparent`,
              backgroundClip: 'padding-box'
            }),
            cursor: onRowClick ? 'pointer' : 'default',
            width: leftWidth
          }}
          onClick={handleRowClick}
        >
          {leftContent ? leftContent(rule, level, isExpanded, hasSubRules) : defaultLeftContent}
        </TableCell>
        <TableCell
          align="left"
          className={cardCellClass}
          sx={{
            ...commonCellStyles,
            ...cardCellBg,
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
          className={cardCellClass}
          sx={{
            ...commonCellStyles,
            ...cardCellBg,
            ...rightCellRadius,
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
            indentRow={indentRow}
            indentWidth={indentWidth}
          />
        ))}
    </>
  );
};

export default RuleRow;
