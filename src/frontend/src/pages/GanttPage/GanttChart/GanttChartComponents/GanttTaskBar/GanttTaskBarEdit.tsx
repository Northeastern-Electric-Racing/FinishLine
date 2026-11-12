import { GanttTask, GanttChange, GanttScale } from '../../../../../utils/gantt.utils';
import { GanttTaskBarEditView } from './GanttTaskBarEditView';

const GanttTaskBarEdit = <T,>({
  scale,
  task,
  createChange,
  onAddTaskPressed
}: {
  scale: GanttScale;
  task: GanttTask<T>;
  createChange: (change: GanttChange<T>) => void;
  onAddTaskPressed: (parent: GanttTask<T>) => void;
}) => {
  return (
    <>
      <GanttTaskBarEditView scale={scale} task={task} createChange={createChange} onAddTaskPressed={onAddTaskPressed} />
      {task.children.map((child) => {
        return (
          <GanttTaskBarEdit
            key={child.id}
            scale={scale}
            task={child}
            createChange={createChange}
            onAddTaskPressed={onAddTaskPressed}
          />
        );
      })}
      {task.blocking.map((blocking) => {
        return (
          <GanttTaskBarEdit
            key={blocking.id}
            scale={scale}
            task={blocking}
            createChange={createChange}
            onAddTaskPressed={onAddTaskPressed}
          />
        );
      })}
    </>
  );
};

export default GanttTaskBarEdit;
