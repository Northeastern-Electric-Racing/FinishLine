/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Rule } from 'shared';
import { getAncestorIds } from '../../utils/rules.utils';
import { createRuleExpansionStore, useExpandedIds } from './ruleExpansion';

/**
 * Controlled expand + click-to-navigate for referenced rules.
 * Clicking a referenced rule link expands its full ancestor path and scrolls to it on the page.
 * @param rules the rules currently rendered/loaded on this page (may just be top-level rules)
 * @param loadFullTree optional loader for the entire rule tree
 * @returns the expansion store to provide to the rows, plus expansion state + handlers
 */
export const useRuleTreeNavigation = (rules: Rule[], loadFullTree?: () => Promise<Rule[]>) => {
  const expansionStore = useMemo(() => createRuleExpansionStore(), []);
  const expandedIds = useExpandedIds(expansionStore);
  // rule pending to scroll to
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  // ids of rules that are expandable (have sub-rules)
  const expandableIds = useMemo(() => new Set(rules.filter((r) => r.subRuleIds.length > 0).map((r) => r.ruleId)), [rules]);

  const areAllExpanded = expandableIds.size > 0 && [...expandableIds].every((id) => expandedIds.has(id));

  const [isLoadingFullTree, setIsLoadingFullTree] = useState(false);

  const latestRules = useRef(rules);
  latestRules.current = rules;

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
    if (!loadFullTree) return expansionStore.expandOnly(expandableIds);
    const allRules = await resolveRules();
    expansionStore.expandOnly(allRules.filter((r) => r.subRuleIds.length > 0).map((r) => r.ruleId));
  }, [expandableIds, loadFullTree, resolveRules, expansionStore]);

  const { collapseAll } = expansionStore;

  // Expand the target's full ancestor path and queue a scroll to it.
  // Scroll doesn't happen until the newly-expanded ancestor rows complete expansion.
  const navigateToRule = useCallback(
    async (targetId: string) => {
      const searchRules = await resolveRules();
      if (!searchRules.some((r) => r.ruleId === targetId)) return; // ensure target rule exists in this view
      expansionStore.expand([...getAncestorIds(targetId, searchRules), targetId]);
      setPendingScrollId(targetId); // queue the scroll
    },
    [resolveRules, expansionStore]
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

  return { expansionStore, navigateToRule, expandAll, collapseAll, areAllExpanded, isLoadingFullTree };
};
