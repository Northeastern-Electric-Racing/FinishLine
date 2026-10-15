/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rule } from 'shared';
import { getAncestorIds } from '../../utils/rules.utils';

/**
 * Controlled expand + click-to-navigate for referenced rules.
 * Clicking a referenced rule link expands its full ancestor path and scrolls to it on the page.
 * @param rules the rules currently rendered/loaded on this page (may just be top-level rules)
 * @param loadFullTree optional loader for the entire rule tree
 * @returns expansion state + handlers
 */
export const useRuleTreeNavigation = (rules: Rule[], loadFullTree?: () => Promise<Rule[]>) => {
  // set of rule ids currently expanded
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // rule pending to scroll to
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  // ids of rules that are expandable (have sub-rules)
  const expandableIds = useMemo(() => new Set(rules.filter((r) => r.subRuleIds.length > 0).map((r) => r.ruleId)), [rules]);

  const areAllExpanded = expandableIds.size > 0 && [...expandableIds].every((id) => expandedIds.has(id));

  const [isLoadingFullTree, setIsLoadingFullTree] = useState(false);

  const latestRules = useRef(rules);
  latestRules.current = rules;

  // the rules to work with, fetching the whole tree when this view only holds part of it
  const resolveRules = useCallback(async () => {
    // no loader means view already has every rule needed (project/team view)
    if (!loadFullTree) return latestRules.current;
    setIsLoadingFullTree(true); // loading for expand all and clicked ref rule link
    try {
      // fetch the whole tree
      return await loadFullTree();
    } finally {
      setIsLoadingFullTree(false);
    }
  }, [loadFullTree]);

  // expands every rule with children, fetching the whole tree first when this view loads lazily
  const expandAll = useCallback(async () => {
    if (!loadFullTree) return setExpandedIds(new Set(expandableIds));
    const allRules = await resolveRules();
    setExpandedIds(new Set(allRules.filter((r) => r.subRuleIds.length > 0).map((r) => r.ruleId)));
  }, [expandableIds, loadFullTree, resolveRules]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // flips a rule's expanded/collapsed state
  const toggleExpand = useCallback((ruleId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId); // expanded -> collapsed
      } else {
        next.add(ruleId); // collapsed -> expanded
      }
      return next;
    });
  }, []);

  // Expand the target's full ancestor path and queue a scroll to it
  const navigateToRule = useCallback(
    async (targetId: string) => {
      const searchRules = await resolveRules();
      if (!searchRules.some((r) => r.ruleId === targetId)) return; // ensure target rule exists in this view
      setExpandedIds((prev) => new Set([...prev, ...getAncestorIds(targetId, searchRules), targetId]));
      setPendingScrollId(targetId); // queue the scroll
    },
    [resolveRules]
  );

  // Scrolls to target rule after ancestors expand
  useEffect(() => {
    if (!pendingScrollId) return;
    const node = document.getElementById(`rule-row-${pendingScrollId}`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setPendingScrollId(null);
    }
  }, [pendingScrollId, expandedIds]);

  return { expandedIds, toggleExpand, navigateToRule, expandAll, collapseAll, areAllExpanded, isLoadingFullTree };
};
