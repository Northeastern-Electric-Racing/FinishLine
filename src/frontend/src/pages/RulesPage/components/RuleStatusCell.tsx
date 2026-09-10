/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { memo, useState } from 'react';
import { Rule, RuleStatus } from 'shared';
import RuleStatusTag from './RuleStatusTag';

interface RuleStatusCellProps {
  rule: Rule;
  isLeaf: boolean;
  // Writes a rule's new status. Omitted when the user can't update statuses, making the status read only
  onSetStatus?: (rule: Rule, status: RuleStatus) => Promise<unknown>;
  onOpenHistory: (rule: Rule) => void;
}

/**
 * Status cell for a rule row, connecting a rule's status tag to whatever writes statuses in this view.
 * A click re-renders this one cell rather than every row in the tree.
 */
const RuleStatusCell: React.FC<RuleStatusCellProps> = ({ rule, isLeaf, onSetStatus, onOpenHistory }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: RuleStatus) => {
    if (!onSetStatus) return;
    setIsUpdating(true);
    try {
      await onSetStatus(rule, status);
    } catch {
      // the mutation hook toasts the failure, cell only needs to stop showing pending
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <RuleStatusTag
      rule={rule}
      isLeaf={isLeaf}
      onStatusChange={onSetStatus ? handleStatusChange : undefined}
      disabled={isUpdating}
      onInfoClick={onOpenHistory}
    />
  );
};

// memo so a re-render of the rules tree doesn't re-render every status cell
export default memo(RuleStatusCell);
