import { Box, useTheme } from '@mui/material';
import {
  GanttChange,
  GanttCollection,
  GanttTask,
  GanttTimeWindow,
  getDateOffsetPx,
  getGanttScale,
  HighlightTaskComparator,
  RequestEventChange
} from '../../../utils/gantt.utils';
import GanttChartCollectionSection from './GanttChartCollectionSection';
import { GanttChartTimeline } from './GanttChartComponents/GanttChartTimeline';
import { startOfDay } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
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
  startDate: Date; // earliest date the chart needs to show; padding is added based on the time window
  endDate: Date; // latest date the chart needs to show
  collections: GanttCollection<E, T>[];
  editability?: GanttEditability<E, T>;
  timeWindow?: GanttTimeWindow;
}

const GanttChart = <E, T>({
  startDate,
  endDate,
  collections,
  editability,
  timeWindow = GanttTimeWindow.HalfYear // closest to the chart's original layout, for pages without a view selector
}: GanttChartProps<E, T>) => {
  const theme = useTheme();
  // keyed on the timestamps so new Date objects for the same dates don't rebuild the scale
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const scale = useMemo(
    () => getGanttScale(new Date(startTime), new Date(endTime), timeWindow),
    [startTime, endTime, timeWindow]
  );

  const today = startOfDay(new Date());
  const isTodayOnChart = today >= scale.start && today < scale.end;
  // centered on today's date
  const todayOffsetPx = getDateOffsetPx(today, scale.start, scale.pixelsPerDay) + scale.pixelsPerDay / 2;

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

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
      <GanttChartTimeline scale={scale} />
      <Box sx={{ position: 'relative' }}>
        {collections.map((collection) => {
          return collection.tasks ? (
            <GanttChartCollectionSection
              scale={scale}
              collection={collection}
              editability={editability}
              toggleExpanded={toggleExpanded}
              expanded={expanded}
              key={collection.id}
            />
          ) : (
            <></>
          );
        })}

        {isTodayOnChart && (
          <Box
            sx={{
              position: 'absolute',
              // collection rows are indented by spacing(2)
              left: `calc(${theme.spacing(2)} + ${todayOffsetPx}px)`,
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
