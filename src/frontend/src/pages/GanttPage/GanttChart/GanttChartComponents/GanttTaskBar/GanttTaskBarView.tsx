import {
  RequestEventChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions
} from '../../../../../utils/gantt.utils';
import { Collapse } from '@mui/material';
import GanttTaskBar from './GanttTaskBar';
import BlockedGanttTaskView from './BlockedTaskBarView';
import GanttTaskBarDisplay from './GanttTaskBarDisplay';

interface GanttTaskBarViewProps<T> {
  days: Date[];
  task: GanttTask<T>;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  onShowChildrenToggle: () => void;
  showChildren: boolean;
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttTaskBarView = <T,>({
  days,
  task,
  getStartCol,
  getEndCol,
  handleOnMouseOver,
  handleOnMouseLeave,
  onShowChildrenToggle,
  showChildren,
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskBarViewProps<T>) => {
  return (
    <>
      <GanttTaskBarDisplay
        days={days}
        task={task}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        showChildren={showChildren}
        onShowChildrenToggle={onShowChildrenToggle}
        highlightedChange={highlightedChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
        highlightSubtaskComparator={highlightSubtaskComparator}
        highlightTaskComparator={highlightTaskComparator}
      />

      <Collapse in={showChildren}>
        {task.children.map((child) => {
          return (
            <GanttTaskBar
              key={child.id}
              days={days}
              task={child}
              isEditMode={false}
              createChange={() => {}}
              handleOnMouseOver={handleOnMouseOver}
              handleOnMouseLeave={handleOnMouseLeave}
              onShowChildrenToggle={onShowChildrenToggle}
              highlightedChange={highlightedChange}
              onAddTaskPressed={onAddTaskPressed}
              highlightSubtaskComparator={highlightSubtaskComparator}
              highlightTaskComparator={highlightTaskComparator}
            />
          );
        })}
      </Collapse>
      {task.blocking.map((blocking) => {
        return (
          <BlockedGanttTaskView
            key={blocking.id}
            task={blocking}
            days={days}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            handleOnMouseOver={handleOnMouseOver}
            onShowChildrenToggle={onShowChildrenToggle}
            highlightSubtaskComparator={highlightSubtaskComparator}
            highlightTaskComparator={highlightTaskComparator}
            handleOnMouseLeave={handleOnMouseLeave}
            highlightedChange={highlightedChange}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarView;
