/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  // list of rules in this view to determine if a referenced rule is able to be scrolled to (for project view)
  const ruleIds = useMemo(() => new Set(rules.map((r) => r.ruleId)), [rules]);
  // ids of rules that are expandable (have sub-rules)
  const expandableIds = useMemo(() => new Set(rules.filter((r) => r.subRuleIds.length > 0).map((r) => r.ruleId)), [rules]);

  const areAllExpanded = expandableIds.size > 0 && [...expandableIds].every((id) => expandedIds.has(id));

  const expandAll = useCallback(async () => {
    if (loadFullTree) {
      const allRules = await loadFullTree();
      const allExpandableIds = allRules.filter((r) => r.subRuleIds.length > 0).map((r) => r.ruleId);
      setExpandedIds(new Set(allExpandableIds));
      return;
    }
    setExpandedIds(new Set(expandableIds));
  }, [expandableIds, loadFullTree]);

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
  // Scroll doesnt happen until the newly-expanded ancestor rows complete expansion
  const navigateToRule = useCallback(
    async (targetId: string) => {
      if (loadFullTree) {
        const allRules = await loadFullTree();
        if (!allRules.some((r) => r.ruleId === targetId)) return; // ensure target rule exists in this view
        const ancestors = getAncestorIds(targetId, allRules);
        setExpandedIds((prev) => new Set([...prev, ...ancestors, targetId]));
        setPendingScrollId(targetId); // queue the scroll
        return;
      }
      if (!ruleIds.has(targetId)) return; // ensure target rule exists in this view
      const ancestors = getAncestorIds(targetId, rules);
      setExpandedIds((prev) => new Set([...prev, ...ancestors, targetId]));
      setPendingScrollId(targetId); // queue the scroll
    },
    [rules, ruleIds, loadFullTree]
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

  return { expandedIds, toggleExpand, navigateToRule, expandAll, collapseAll, areAllExpanded };
};
