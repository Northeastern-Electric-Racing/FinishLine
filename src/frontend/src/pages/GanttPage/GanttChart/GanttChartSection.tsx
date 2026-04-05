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
import { Box, Typography } from '@mui/material';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar/GanttTaskBar';
import GanttToolTip from './GanttChartComponents/GanttToolTip';
import { ArcherContainer, ArcherContainerRef } from 'react-archer';

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

interface GanttTooltipLayerProps {
  updateRef: MutableRefObject<(options: OnMouseOverOptions | undefined, y?: number) => void>;
}

const GanttTooltipLayer: React.FC<GanttTooltipLayerProps> = ({ updateRef }) => {
  const [tooltipOptions, setTooltipOptions] = useState<OnMouseOverOptions | undefined>(undefined);
  const [cursorY, setCursorY] = useState(0);

  updateRef.current = (options, y = 0) => {
    setTooltipOptions(options);
    if (options && y !== undefined && y !== null) setCursorY(y);
  };

  if (!tooltipOptions) return null;

  return (
    <GanttToolTip
      yCoordinate={cursorY}
      title={tooltipOptions.name}
      startDate={tooltipOptions.start}
      endDate={tooltipOptions.end}
      color={tooltipOptions.styles?.backgroundColor}
      upperRightDisplay={tooltipOptions.tooltip?.upperRightDisplay}
      lowerRightDisplay={tooltipOptions.tooltip?.lowerRightDisplay}
    />
  );
};

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
  const days = eachDayOfInterval({ start, end }).filter((day) => isMonday(day));

  const archerRef = useRef<ArcherContainerRef>(null);
  const handleToggle = useCallback(() => archerRef.current?.refreshScreen(), []);

  const updateTooltip = useRef<(options: OnMouseOverOptions | undefined, y?: number) => void>(() => {});

  const handleOnMouseOver = useCallback(
    (e: React.MouseEvent, task: OnMouseOverOptions) => {
      if (!isEditMode) updateTooltip.current(task, e.clientY);
    },
    [isEditMode]
  );

  const handleOnMouseLeave = useCallback(() => {
    updateTooltip.current(undefined);
  }, []);

  const handleCreateProjectChange = useCallback(
    (change: GanttChange<T>) => {
      createChange(change);
      updateTooltip.current(undefined);
    },
    [createChange]
  );

  return (
    <ArcherContainer strokeColor="#ef4545">
      <Box sx={{ width: 'fit-content' }}>
        <Box sx={{ mt: '1rem', width: 'fit-content' }}>
          {tasks.map((task) => {
            return (
              <Box key={task.id} display="flex" alignItems="center">
                <GanttTaskBar
                  days={days}
                  task={task}
                  isEditMode={isEditMode}
                  createChange={handleCreateProjectChange}
                  handleOnMouseOver={handleOnMouseOver}
                  handleOnMouseLeave={handleOnMouseLeave}
                  onAddTaskPressed={onAddTaskPressed}
                  highlightedChange={highlightedChange}
                  highlightSubtaskComparator={highlightSubtaskComparator}
                  highlightTaskComparator={highlightTaskComparator}
                  onToggle={handleToggle}
                />
              </Box>
            );
          })}
        </Box>
        <GanttTooltipLayer updateRef={updateTooltip} />
      </Box>
    </ArcherContainer>
  );
};

export default GanttChartSection;
