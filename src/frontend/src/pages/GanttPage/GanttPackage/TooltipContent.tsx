import { Task } from './types/public-types';
import styles from './components/other/tooltip.module.css';
import { BarTask } from './types/bar-task';

export type TooltipProps = {
  task: BarTask;
  arrowIndent: number;
  rtl: boolean;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  headerHeight: number;
  taskListWidth: number;
  scrollX: number;
  scrollY: number;
  rowHeight: number;
  fontSize: string;
  fontFamily: string;
  TooltipContent: React.FC<{
    task: Task;
    fontSize: string;
    fontFamily: string;
  }>;
};
export const TooltipContent: React.FC<{
  task: Task;
  fontSize: string;
  fontFamily: string;
}> = ({ task, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily
  };
  const duration = (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24);
  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <b style={{ fontSize: fontSize + 6 }}>{`${task.name} - ${new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric'
      }).format(task.start)}`}</b>
      {task.end.getTime() - task.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>{`Duration: ${~~duration} ${
          duration > 1 ? 'days' : 'day'
        }`}</p>
      )}
      <p className={styles.tooltipDefaultContainerParagraph}>{`Percentage done: ${task.progress}%`}</p>
      <p className={styles.tooltipDefaultContainerParagraph}>{`End date: ${new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric'
      }).format(task.end)}`}</p>
    </div>
  );
};

export default TooltipContent;
