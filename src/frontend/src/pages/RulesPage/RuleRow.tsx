/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TableCell, TableRow, Box } from '@mui/material';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rule } from 'shared';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useGetChildRules } from '../../hooks/rules.hooks';
import { compareRuleCodes } from '../../utils/rules.utils';

// how many children of an expanded rule are mounted at a time
const RULE_PAGE_SIZE = 20;
const EMPTY_SUB_RULES: Rule[] = [];

interface RuleRowProps {
  rule: Rule;
  allRules?: Rule[];
  level?: number;
  leftContent?: (
    rule: Rule,
    level: number,
    isExpanded: boolean,
    hasSubRules: boolean,
    toggleExpand: () => void
  ) => React.ReactNode;
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
  // If a rule's code/name should span the entire row - used for team view header rows
  fullWidthCode?: (rule: Rule) => boolean;
  // Optional controlled expansion, otherwise each row manages its own open/closed state
  expandedIds?: Set<string>;
  onToggleExpand?: (ruleId: string) => void;
  // Mounts children incrementally instead of all at once. Opt-in so other views keep rendering every row.
  windowChildren?: boolean;
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
  indentWidth = 10,
  fullWidthCode,
  expandedIds,
  onToggleExpand,
  windowChildren = false
}) => {
  const [localExpanded, setLocalExpanded] = useState(initiallyExpanded);
  // Controlled by the parent when `expandedIds` is provided, otherwise from this row's own state
  const isExpanded = expandedIds ? expandedIds.has(rule.ruleId) : localExpanded;

  // a parent rule whose sub rules aren't in the set (e.g. rule T.1 was assigned to a project but T.1.1 wasn't)
  // will render as a leaf rule but with no expand dropdown
  const presentSubRules = useMemo(
    () => (allRules ? allRules.filter((r) => rule.subRuleIds.includes(r.ruleId)) : null),
    [allRules, rule.subRuleIds]
  );
  const hasSubRules = presentSubRules ? presentSubRules.length > 0 : rule.subRuleIds.length > 0;

  // Lazy load if allRules not provided
  const { data: fetchedSubRules = EMPTY_SUB_RULES } = useGetChildRules(rule.ruleId, !allRules && isExpanded && hasSubRules);

  // Use allRules if provided, otherwise use fetched.
  // Sorted by rule code so children render in a stable numeric order (e.g. F.2 before F.10).
  // Skipped entirely while collapsed - a collapsed row renders none of its children.
  const subRules = useMemo(() => {
    if (!isExpanded || !hasSubRules) return EMPTY_SUB_RULES;
    return [...(presentSubRules ?? fetchedSubRules)].sort(compareRuleCodes);
  }, [isExpanded, hasSubRules, presentSubRules, fetchedSubRules]);

  // Incremental rendering: only the first `visibleCount` children are mounted. The sentinel rendered
  // after the last child grows this as it scrolls into view.
  const [visibleCount, setVisibleCount] = useState(RULE_PAGE_SIZE);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setSentinel = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((count) => count + RULE_PAGE_SIZE);
      },
      { rootMargin: '400px' }
    );
    observerRef.current.observe(node);
  }, []);

  useEffect(() => () => observerRef.current?.disconnect(), []);

  // Start fresh when this row collapses or its child count changes, so reopening a huge branch
  // doesn't mount everything that was revealed last time. Keyed on length rather than identity so a
  // status refetch (same children, new array) doesn't yank the window back.
  useEffect(() => {
    setVisibleCount(RULE_PAGE_SIZE);
  }, [isExpanded, subRules.length]);

  const visibleSubRules = windowChildren ? subRules.slice(0, visibleCount) : subRules;
  const hasHiddenSubRules = windowChildren && visibleCount < subRules.length;

  const bgColor = typeof backgroundColor === 'function' ? backgroundColor(rule) : backgroundColor;
  const color = typeof textColor === 'function' ? textColor(rule) : textColor;
  const hoverBgColor = typeof hoverColor === 'function' ? hoverColor(rule) : hoverColor;

  const toggleExpand = () => {
    if (!hasSubRules) return;
    if (onToggleExpand) {
      onToggleExpand(rule.ruleId);
    } else {
      setLocalExpanded((prev) => !prev);
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand();
  };

  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(rule);
    } else if (hasSubRules) {
      toggleExpand();
    }
  };

  const rowIsClickable = Boolean(onRowClick) || hasSubRules;

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
        // id so a parent can scroll to this row
        id={`rule-row-${rule.ruleId}`}
        onClick={handleRowClick}
        sx={{
          borderBottom: '1px solid #7d7d7d',
          backgroundColor: indentRow ? 'transparent' : bgColor,
          cursor: rowIsClickable ? 'pointer' : 'default',
          '&:hover': indentRow
            ? { '& .rule-card-cell': { backgroundColor: hoverBgColor } }
            : { backgroundColor: hoverBgColor },
          '&:last-child': {
            borderBottom: 'none'
          },
          height: rowHeight
        }}
      >
        {fullWidthCode && fullWidthCode(rule) ? (
          <TableCell
            align="left"
            colSpan={3}
            className={cardCellClass}
            sx={{
              ...commonCellStyles,
              ...cardCellBg,
              ...leftCellRadius,
              ...rightCellRadius,
              // Indent left edge of rule with transparent left border
              ...(indentRow && {
                borderLeft: `${level * indentWidth}px solid transparent`,
                backgroundClip: 'padding-box'
              }),
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            {leftContent ? leftContent(rule, level, isExpanded, hasSubRules, toggleExpand) : defaultLeftContent}
          </TableCell>
        ) : (
          <>
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
                width: leftWidth
              }}
            >
              {leftContent ? leftContent(rule, level, isExpanded, hasSubRules, toggleExpand) : defaultLeftContent}
            </TableCell>
            <TableCell
              align="left"
              className={cardCellClass}
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
              sx={{
                ...commonCellStyles,
                ...cardCellBg,
                ...rightCellRadius,
                cursor: 'default',
                width: rightWidth
              }}
            >
              {rightContent(rule, level)}
            </TableCell>
          </>
        )}
      </TableRow>
      {isExpanded &&
        hasSubRules &&
        visibleSubRules.map((subRule) => (
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
            fullWidthCode={fullWidthCode}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            windowChildren={windowChildren}
          />
        ))}
      {hasHiddenSubRules && (
        <TableRow>
          <TableCell colSpan={3} sx={{ p: 0, border: 'none', height: 0 }}>
            <div ref={setSentinel} style={{ height: 1 }} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default memo(RuleRow);
