import { GanttTask, GanttChange } from '../../../../../utils/gantt.utils';
import { GanttTaskBarEditView } from './GanttTaskBarEditView';

const GanttTaskBarEdit = <T,>({
  days,
  task,
  createChange,
  getStartCol,
  getEndCol,
  onAddTaskPressed
}: {
  days: Date[];
  task: GanttTask<T>;
  createChange: (change: GanttChange<T>) => void;
  getStartCol: (start: Date) => number;
  getEndCol: (end: Date) => number;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
}) => {
  return (
    <>
      <GanttTaskBarEditView
        days={days}
        task={task}
        createChange={createChange}
        getStartCol={getStartCol}
        getEndCol={getEndCol}
        onAddTaskPressed={onAddTaskPressed}
      />
      {(task.children.length > 0 ? task.children : (task.loadChildren?.() ?? [])).map((child) => {
        return (
          <GanttTaskBarEdit
            key={child.id}
            days={days}
            task={child}
            createChange={createChange}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            onAddTaskPressed={onAddTaskPressed}
          />
        );
      })}
      {task.blocking.map((blocking) => {
        return (
          <GanttTaskBarEdit
            key={blocking.id}
            days={days}
            task={blocking}
            createChange={createChange}
            getStartCol={getStartCol}
            getEndCol={getEndCol}
            onAddTaskPressed={onAddTaskPressed}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarEdit;
