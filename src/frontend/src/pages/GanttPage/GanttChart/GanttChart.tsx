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
import { eachDayOfInterval, isMonday } from 'date-fns';
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
  const currentDayCol = days.findIndex((day) => dateToString(day) === dateToString(getMonday(new Date()))) + 1;

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
      <Box>
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
      </Box>

      {currentDayCol > 0 && (
        <Box
          sx={{
            position: 'absolute',
            left: `calc(${currentDayCol - 1} * (${GANTT_CHART_CELL_SIZE} + ${GANTT_CHART_GAP_SIZE}) + 2rem)`,
            top: '5rem',
            width: '1px',
            backgroundColor: theme.palette.info.main,
            zIndex: 3,
            pointerEvents: 'none',
            height: '150%'
          }}
        />
      )}
    </Box>
  );
};

export default GanttChart;
