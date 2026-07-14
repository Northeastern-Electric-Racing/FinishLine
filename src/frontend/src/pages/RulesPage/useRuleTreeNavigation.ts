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
 * @param rules the rules currently rendered on this page
 * @returns 
 */
export const useRuleTreeNavigation = (rules: Rule[]) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const ruleIds = useMemo(() => new Set(rules.map((r) => r.ruleId)), [rules]);

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

  // Expand the target's full ancestor path and queue a scroll to it. 
  // The scroll doesnt happen until the newly-expanded ancestor rows are mounted
  const navigateToRule = useCallback(
    (targetId: string) => {
      if (!ruleIds.has(targetId)) return;
      const ancestors = getAncestorIds(targetId, rules);
      setExpandedIds((prev) => new Set([...prev, ...ancestors, targetId]));
      setPendingScrollId(targetId);
    },
    [rules, ruleIds]
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

  return { expandedIds, toggleExpand, navigateToRule };
};
