/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { createContext, memo, useContext, useState } from 'react';
import { Rule, RuleStatus } from 'shared';
import RuleStatusTag from './RuleStatusTag';

export interface RuleStatusActions {
  /** Writes a rule's new status. Omitted when the user can't update statuses, making cells read-only. */
  setStatus?: (rule: Rule, status: RuleStatus) => Promise<unknown>;
  openHistory: (rule: Rule) => void;
}

const RuleStatusActionsContext = createContext<RuleStatusActions | null>(null);

export const RuleStatusActionsProvider = RuleStatusActionsContext.Provider;

interface RuleStatusCellProps {
  rule: Rule;
  isLeaf: boolean;
}

/**
 * Status cell for a rule row, connecting a rule's status tag to whatever writes statuses in this view.
 * A click re-renders this one cell rather than every row in the tree.
 */
const RuleStatusCell: React.FC<RuleStatusCellProps> = ({ rule, isLeaf }) => {
  const actions = useContext(RuleStatusActionsContext);
  if (!actions) throw new Error('RuleStatusCell must be rendered inside a RuleStatusActionsProvider');
  const { setStatus, openHistory } = actions;

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: RuleStatus) => {
    if (!setStatus) return;
    setIsUpdating(true);
    try {
      await setStatus(rule, status);
    } catch {
      // the mutation hook toasts the failure; cell only needs to stop showing pending
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <RuleStatusTag
      rule={rule}
      isLeaf={isLeaf}
      onStatusChange={setStatus ? handleStatusChange : undefined}
      disabled={isUpdating}
      onInfoClick={openHistory}
    />
  );
};

// memo so a re-render of the rules tree doesn't re-render every status cell
export default memo(RuleStatusCell);
