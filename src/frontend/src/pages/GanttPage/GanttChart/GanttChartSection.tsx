import { eachDayOfInterval, isMonday } from 'date-fns';
import {
  GanttChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions,
  RequestEventChange
} from '../../../utils/gantt.utils';
import { Box, Typography } from '@mui/material';
import { useState, useCallback, memo, useMemo } from 'react';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar/GanttTaskBar';
import { ArcherContainer } from 'react-archer';
import GanttToolTip from './GanttChartComponents/GanttToolTip';

interface GanttChartSectionProps<T> {
  start: Date;
  end: Date;
  tasks: GanttTask<T>[];
  isEditMode: boolean;
  createChange: (change: GanttChange<T>) => void;
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parentTask: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

interface GanttTaskListProps<T> {
  days: Date[];
  tasks: GanttTask<T>[];
  isEditMode: boolean;
  createChange: (change: GanttChange<T>) => void;
  highlightedChange?: RequestEventChange<T>;
  onAddTaskPressed: (parentTask: GanttTask<T>) => void;
  handleOnMouseOver: (e: React.MouseEvent, task: OnMouseOverOptions) => void;
  handleOnMouseLeave: () => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttTaskListInner = <T,>({
  days,
  tasks,
  isEditMode,
  createChange,
  highlightedChange,
  onAddTaskPressed,
  handleOnMouseOver,
  handleOnMouseLeave,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttTaskListProps<T>) => {
  return (
    <ArcherContainer strokeColor="#ef4545">
      <Box sx={{ width: 'fit-content' }}>
        <Box sx={{ mt: '1rem', width: 'fit-content' }}>
          {tasks.map((task) => (
            <Box key={task.id} display="flex" alignItems="center">
              <GanttTaskBar
                days={days}
                task={task}
                isEditMode={isEditMode}
                createChange={createChange}
                handleOnMouseOver={handleOnMouseOver}
                handleOnMouseLeave={handleOnMouseLeave}
                onAddTaskPressed={onAddTaskPressed}
                highlightedChange={highlightedChange}
                highlightSubtaskComparator={highlightSubtaskComparator}
                highlightTaskComparator={highlightTaskComparator}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </ArcherContainer>
  );
};

const GanttTaskList = memo(GanttTaskListInner) as typeof GanttTaskListInner;

const GanttChartSection = <T,>({
  start,
  end,
  tasks,
  isEditMode,
  createChange,
  highlightedChange,
  onAddTaskPressed,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttChartSectionProps<T>) => {
  const days = useMemo(() => eachDayOfInterval({ start, end }).filter((day) => isMonday(day)), [start, end]);
  const [currentTooltipOptions, setCurrentTooltipOptions] = useState<OnMouseOverOptions | undefined>(undefined);
  const [cursorY, setCursorY] = useState<number>(0);

  const handleOnMouseOver = useCallback(
    (e: React.MouseEvent, task: OnMouseOverOptions) => {
      if (!isEditMode) {
        setCurrentTooltipOptions(task);
        setCursorY(e.clientY);
      }
    },
    [isEditMode]
  );

  const handleCreateProjectChange = useCallback(
    (change: GanttChange<T>) => {
      createChange(change);
      setCurrentTooltipOptions(undefined);
    },
    [createChange]
  );

  const handleOnMouseLeave = useCallback(() => {
    setCurrentTooltipOptions(undefined);
  }, []);

  return tasks.length > 0 ? (
    <Box sx={{ width: 'fit-content' }}>
      <GanttTaskList
        days={days}
        tasks={tasks}
        isEditMode={isEditMode}
        createChange={handleCreateProjectChange}
        highlightedChange={highlightedChange}
        onAddTaskPressed={onAddTaskPressed}
        handleOnMouseOver={handleOnMouseOver}
        handleOnMouseLeave={handleOnMouseLeave}
        highlightSubtaskComparator={highlightSubtaskComparator}
        highlightTaskComparator={highlightTaskComparator}
      />
      {currentTooltipOptions && (
        <GanttToolTip
          yCoordinate={cursorY}
          title={currentTooltipOptions.name}
          startDate={currentTooltipOptions.start ?? new Date()}
          endDate={currentTooltipOptions.end ?? new Date()}
          color={currentTooltipOptions.styles?.backgroundColor}
          upperRightDisplay={currentTooltipOptions.tooltip?.upperRightDisplay}
          lowerRightDisplay={currentTooltipOptions.tooltip?.lowerRightDisplay}
        />
      )}
    </Box>
  ) : (
    <Typography sx={{ marginTop: 5 }}>No Projects to Display</Typography>
  );
};

export default GanttChartSection;
