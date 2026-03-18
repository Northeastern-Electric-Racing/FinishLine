import {
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions,
  RequestEventChange
} from '../../../../../utils/gantt.utils';
import { wbsPipe, WbsNumber } from 'shared';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';

interface BlockedGanttTaskViewProps<T> {
  parentTask: GanttTask<T>;
  task: GanttTask<T>;
  days: Date[];
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  highlightedChange?: RequestEventChange<T>;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

interface TaskWithBlockingInfo {
  blockedBy: WbsNumber[];
  wbsNum: WbsNumber;
}

const hasBlockingInfo = (value: unknown): value is TaskWithBlockingInfo => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'blockedBy' in value &&
    'wbsNum' in value &&
    Array.isArray((value as { blockedBy: unknown }).blockedBy)
  );
};

const shouldRenderUnderParent = <T,>(parentTask: GanttTask<T>, task: GanttTask<T>): boolean => {
  if (!hasBlockingInfo(task.element) || !hasBlockingInfo(parentTask.element)) {
    return true;
  }

  const parentWbs = wbsPipe(parentTask.element.wbsNum);
  const canonicalBlockedByParent = task.element.blockedBy.map(wbsPipe).sort()[0];
  return canonicalBlockedByParent === parentWbs;
};

const BlockedGanttTaskView = <T,>({
  parentTask,
  task,
  days,
  getStartCol,
  getEndCol,
  handleOnMouseOver,
  handleOnMouseLeave,
  onShowChildrenToggle,
  highlightedChange,
  highlightSubtaskComparator,
  highlightTaskComparator
}: BlockedGanttTaskViewProps<T>) => {
  if (!shouldRenderUnderParent(parentTask, task)) {
    return null;
  }

  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        onShowChildrenToggle={onShowChildrenToggle}
        highlightSubtaskComparator={highlightSubtaskComparator}
        highlightTaskComparator={highlightTaskComparator}
        showChildren={false}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
      />
      {task.blocking.map((child) => {
        return (
          <BlockedGanttTaskView
            key={child.id}
            parentTask={task}
            task={child}
            days={days}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            onShowChildrenToggle={onShowChildrenToggle}
            highlightTaskComparator={highlightTaskComparator}
            highlightSubtaskComparator={highlightSubtaskComparator}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={highlightedChange}
          />
        );
      })}
    </>
  );
};

export default BlockedGanttTaskView;
