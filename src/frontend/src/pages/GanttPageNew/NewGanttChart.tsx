import { Box, useTheme } from '@mui/material';
import { eachDayOfInterval, isMonday, differenceInDays } from 'date-fns';

import { useMemo } from 'react';
import { dateToString, getMonday } from '../../utils/datetime.utils';
import {
  HighlightTaskComparator,
  GanttCollection,
  GanttTask,
  GanttChange,
  RequestEventChange,
  GANTT_CHART_CELL_SIZE,
  GANTT_CHART_GAP_SIZE
} from '../../utils/gantt.utils';
import GanttChartCollectionSection from '../GanttPage/GanttChart/GanttChartCollectionSection';
import { GanttChartTimeline } from '../GanttPage/GanttChart/GanttChartComponents/GanttChartTimeline';
export interface GanttEditability<E, T> {
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
  onNewTaskPressed: (collection: GanttCollection<E, T>) => void;
  onNewSubTaskPressed: (parent: GanttTask<T>) => void;
  createTaskTitle: string;
  onEditPressed: (collection: GanttCollection<E, T>) => void;
  onSavePressed: () => void;
  onCancelChanges: (collection: GanttCollection<E, T>) => void;
  onCreateChange: (change: GanttChange<T>) => void;
  highlightedChange: RequestEventChange<T>;
}

interface GanttChartProps<E, T> {
  startDate: Date;
  endDate: Date;
  collections: GanttCollection<E, T>[];
  shouldShowChildren: (task: GanttTask<T>) => boolean;
  onShowChildrenToggle: (task: GanttTask<T>) => void;

  editability?: GanttEditability<E, T>;
}

const GanttChart = <E, T>({
  startDate,
  endDate,
  collections,
  shouldShowChildren,
  onShowChildrenToggle,
  editability
}: GanttChartProps<E, T>) => {
  const theme = useTheme();
  const days = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }).filter((day) => isMonday(day)),
    [startDate, endDate]
  );

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

  const currentWeekCol = useMemo(
    () => days.findIndex((day) => dateToString(day) === dateToString(getMonday(today))) + 1,
    [days, today]
  );

  const daysIntoWeek = useMemo(() => differenceInDays(today, getMonday(today)), [today]);

  const dailyOffset = useMemo(() => daysIntoWeek * (parseFloat(GANTT_CHART_CELL_SIZE) / 7), [daysIntoWeek]);

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'calc(100vh - 9.5rem )', md: 'calc(100vh - 6.25rem)' },
        overflow: 'scroll',
        position: 'relative',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE and Edge
      }}
    >
      <GanttChartTimeline start={startDate} end={endDate} />
      <Box sx={{ position: 'relative' }}>
        {collections.map((collection) => {
          return collection.tasks ? (
            <GanttChartCollectionSection
              startDate={startDate}
              endDate={endDate}
              collection={collection}
              shouldShowChildren={shouldShowChildren}
              onShowChildrenToggle={onShowChildrenToggle}
              editability={editability}
            />
          ) : (
            <></>
          );
        })}

        {currentWeekCol > 0 && (
          <Box
            sx={{
              position: 'absolute',
              left: `calc(${currentWeekCol - 1} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}) + 1.1rem + ${dailyOffset}rem)`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: theme.palette.info.main,
              zIndex: 3,
              pointerEvents: 'none'
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default GanttChart;
