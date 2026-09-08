/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Expansion state for a rule tree. Skips re-render when rule is unchanged.
 */
export interface RuleExpansionStore {
  isExpanded: (ruleId: string) => boolean;
  getExpandedIds: () => ReadonlySet<string>;
  toggle: (ruleId: string) => void;
  expand: (ruleIds: Iterable<string>) => void; // expand these on top of what is already expanded
  expandOnly: (ruleIds: Iterable<string>) => void; // expand exactly these rules and collapse others
  collapseAll: () => void;
  subscribe: (onChange: () => void) => () => void;
}

export const createRuleExpansionStore = (): RuleExpansionStore => {
  let expandedIds: ReadonlySet<string> = new Set();
  const listeners = new Set<() => void>();

  const setExpanded = (next: ReadonlySet<string>) => {
    expandedIds = next;
    listeners.forEach((onChange) => onChange());
  };

  return {
    isExpanded: (ruleId) => expandedIds.has(ruleId),
    getExpandedIds: () => expandedIds,
    toggle: (ruleId) => {
      const next = new Set(expandedIds);
      if (!next.delete(ruleId)) next.add(ruleId);
      setExpanded(next);
    },
    expand: (ruleIds) => setExpanded(new Set([...expandedIds, ...ruleIds])),
    expandOnly: (ruleIds) => setExpanded(new Set(ruleIds)),
    collapseAll: () => setExpanded(new Set()),
    subscribe: (onChange) => {
      listeners.add(onChange);
      return () => {
        listeners.delete(onChange);
      };
    }
  };
};

const RuleExpansionContext = createContext<RuleExpansionStore | null>(null);

export const RuleExpansionProvider = RuleExpansionContext.Provider;

/**
 * Expansion for one row, or null when there is no store above it and the row owns its own state.
 * A toggle notifies every row, but React drops the re-render for rows whose flag didn't change.
 */
export const useRuleExpansion = (ruleId: string): { isExpanded: boolean; toggle: () => void } | null => {
  const store = useContext(RuleExpansionContext);
  const [isExpanded, setIsExpanded] = useState(() => store?.isExpanded(ruleId) ?? false);

  useEffect(() => {
    if (!store) return;
    const read = () => setIsExpanded(store.isExpanded(ruleId));
    read(); // the flag can change between this row rendering and the subscription landing
    return store.subscribe(read);
  }, [store, ruleId]);

  return store ? { isExpanded, toggle: () => store.toggle(ruleId) } : null;
};

/** Subscribes to the whole expanded set - for Expand All's label and the queued scroll, not for rows. */
export const useExpandedIds = (store: RuleExpansionStore): ReadonlySet<string> => {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(store.getExpandedIds);

  useEffect(() => store.subscribe(() => setExpandedIds(store.getExpandedIds())), [store]);

  return expandedIds;
};
