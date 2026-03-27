/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { eachDayOfInterval, isMonday } from 'date-fns';
import {
  GanttChange,
  GanttTask,
  HighlightTaskComparator,
  OnMouseOverOptions,
  RequestEventChange
} from '../../../utils/gantt.utils';
import { Box } from '@mui/material';
import { useState } from 'react';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar/GanttTaskBar';
import GanttToolTip from './GanttChartComponents/GanttToolTip';
import { ArcherContainer } from 'react-archer';

interface GanttChartSectionProps<T> {
  start: Date;
  end: Date;
  tasks: GanttTask<T>[];
  isEditMode: boolean;
  createChange: (change: GanttChange<T>) => void;
  highlightedChange?: RequestEventChange<T>;
  onShowChildrenToggle: (task: GanttTask<T>) => void;
  shouldShowChildren: (task: GanttTask<T>) => boolean;
  onAddTaskPressed: (parentTask: GanttTask<T>) => void;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttChartSection = <T,>({
  start,
  end,
  tasks,
  isEditMode,
  createChange,
  highlightedChange,
  onShowChildrenToggle,
  onAddTaskPressed,
  shouldShowChildren,
  highlightSubtaskComparator,
  highlightTaskComparator
}: GanttChartSectionProps<T>) => {
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));
  const [currentTooltipOptions, setCurrentTooltipOptions] = useState<OnMouseOverOptions | undefined>(undefined);
  const [cursorY, setCursorY] = useState<number>(0);

  const handleOnMouseOver = (e: React.MouseEvent, task: OnMouseOverOptions) => {
    if (!isEditMode) {
      setCurrentTooltipOptions(task);
      setCursorY(e.clientY);
    }
  };

  const handleCreateProjectChange = (change: GanttChange<T>) => {
    createChange(change);
    setCurrentTooltipOptions(undefined);
  };

  const handleOnMouseLeave = () => {
    setCurrentTooltipOptions(undefined);
  };

  return (
    <Box sx={{ width: 'fit-content' }}>
      <Box sx={{ mt: '1rem', width: 'fit-content' }}>
        {tasks.map((task) => {
          return (
            <Box display="flex" alignItems="center">
              <GanttTaskBar
                key={task.id}
                days={days}
                task={task}
                isEditMode={isEditMode}
                createChange={handleCreateProjectChange}
                handleOnMouseOver={handleOnMouseOver}
                handleOnMouseLeave={handleOnMouseLeave}
                onShowChildrenToggle={() => onShowChildrenToggle(task)}
                onAddTaskPressed={onAddTaskPressed}
                showChildren={shouldShowChildren(task)}
                highlightedChange={highlightedChange}
                highlightSubtaskComparator={highlightSubtaskComparator}
                highlightTaskComparator={highlightTaskComparator}
              />
            </Box>
          );
        })}
      </Box>
      {currentTooltipOptions && (
        <GanttToolTip
          yCoordinate={cursorY}
          title={currentTooltipOptions.name}
          startDate={currentTooltipOptions.start}
          endDate={currentTooltipOptions.end}
          color={currentTooltipOptions.styles?.backgroundColor}
          upperRightDisplay={currentTooltipOptions.tooltip?.upperRightDisplay}
          lowerRightDisplay={currentTooltipOptions.tooltip?.lowerRightDisplay}
        />
      )}
    </Box>
  );
};

export default GanttChartSection;
