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
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GanttTaskBar from './GanttChartComponents/GanttTaskBar/GanttTaskBar';
import GanttToolTip from './GanttChartComponents/GanttToolTip';
import { ArcherContainer, ArcherContainerRef } from 'react-archer';
import { toDateString } from 'shared';
import { getMonday } from '../../../utils/datetime.utils';

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
  toggleExpanded: (id: string) => void;
  expanded: Set<string>;
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
  highlightTaskComparator,
  toggleExpanded,
  expanded
}: GanttChartSectionProps<T>) => {
  const days = useMemo(() => eachDayOfInterval({ start, end }).filter((day) => isMonday(day)), [start, end]);

  const dayColIndex = useMemo(() => {
    const m = new Map<string, number>();
    days.forEach((day, i) => m.set(toDateString(day), i));
    return m;
  }, [days]);

  const getStartCol = useCallback(
    (start: Date) => (dayColIndex.get(toDateString(getMonday(start))) ?? -1) + 1,
    [dayColIndex]
  );

  const getEndCol = useCallback(
    (end: Date) => {
      const idx = dayColIndex.get(toDateString(getMonday(end)));
      return idx === undefined ? days.length + 1 : idx + 2;
    },
    [dayColIndex, days.length]
  );
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const archerContainerRef = useRef<ArcherContainerRef>(null);

  const onToggle = useCallback(() => {
    archerContainerRef.current?.refreshScreen();
  }, []);

  useEffect(() => {
    const node = treeContainerRef.current;
    if (!node) return;

    let timeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(onToggle, 250);
    });

    observer.observe(node);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [onToggle]);

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
    <ArcherContainer strokeColor="#ef4545" ref={archerContainerRef}>
      <Box sx={{ width: 'fit-content' }}>
        <Box ref={treeContainerRef} sx={{ mt: '1rem', width: 'fit-content' }}>
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
                  onToggle={onToggle}
                  toggleExpanded={toggleExpanded}
                  isExpanded={expanded.has(task.id)}
                  expanded={expanded}
                  getStartCol={getStartCol}
                  getEndCol={getEndCol}
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
