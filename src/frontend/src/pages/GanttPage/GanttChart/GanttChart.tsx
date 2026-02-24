import { Box, useTheme } from '@mui/material';
import {
  GanttChange,
  GanttCollection,
  GanttTask,
  HighlightTaskComparator,
  RequestEventChange
} from '../../../utils/gantt.utils';
import GanttChartCollectionSection from './GanttChartCollectionSection';
import { GanttChartTimeline } from './GanttChartComponents/GanttChartTimeline';
import { eachDayOfInterval, isMonday, differenceInDays } from 'date-fns';
import { dateToString, getMonday } from '../../../utils/datetime.utils';
import { GANTT_CHART_CELL_SIZE, GANTT_CHART_GAP_SIZE } from '../../../utils/gantt.utils';
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
  const days = eachDayOfInterval({ start: startDate, end: endDate }).filter((day) => isMonday(day));

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const currentWeekCol = days.findIndex((day) => dateToString(day) === dateToString(getMonday(today))) + 1;

  const daysIntoWeek = differenceInDays(today, getMonday(today));
  const dailyOffset = daysIntoWeek * (parseFloat(GANTT_CHART_CELL_SIZE) / 7);

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
        {collections
          .filter((collection) => collection.tasks.length > 0)
          .map((collection) => {
            return (
              <GanttChartCollectionSection
                key={collection.id}
                startDate={startDate}
                endDate={endDate}
                collection={collection}
                shouldShowChildren={shouldShowChildren}
                onShowChildrenToggle={onShowChildrenToggle}
                editability={editability}
              />
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
