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

  // read through a ref so navigateToRule keeps one identity for the life of the page. It is handed to
  // every rule's content as a click handler, and re-creating it re-renders every row that holds one.
  const latestRules = useRef(rules);
  latestRules.current = rules;

  // the rules to act on: the whole tree when this view can load it, otherwise what is already here
  const resolveRules = useCallback(async () => {
    if (!loadFullTree) return latestRules.current;
    setIsLoadingFullTree(true);
    try {
      return await loadFullTree();
    } finally {
      setIsLoadingFullTree(false);
    }
  }, [loadFullTree]);

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
      // delete reports whether it removed anything, so this is one lookup instead of has + add/delete
      if (!next.delete(ruleId)) next.add(ruleId);
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
