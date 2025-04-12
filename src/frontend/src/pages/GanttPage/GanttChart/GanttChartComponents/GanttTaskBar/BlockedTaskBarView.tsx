import { GanttTask, HighlightTaskComparator, RequestEventChange } from '../../../../../utils/gantt.utils';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';

interface BlockedGanttTaskViewProps<T> {
  task: GanttTask<T>;
  days: Date[];
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: GanttTask<T>) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  highlightedChange?: RequestEventChange<T>;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const BlockedGanttTaskView = <T,>({
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
