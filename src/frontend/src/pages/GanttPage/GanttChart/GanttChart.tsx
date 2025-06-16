import { Box } from '@mui/material';
import {
  GanttChange,
  GanttCollection,
  GanttTask,
  HighlightTaskComparator,
  RequestEventChange
} from '../../../utils/gantt.utils';
import GanttChartCollectionSection from './GanttChartCollectionSection';
import { GanttChartTimeline } from './GanttChartComponents/GanttChartTimeline';

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
  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'calc(100vh - 9.5rem )', md: 'calc(100vh - 6.25rem)' },
        overflow: 'scroll',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE and Edge
      }}
    >
      <GanttChartTimeline start={startDate} end={endDate} />
      <Box sx={{ width: 'fit-content' }}>
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
    </Box>
  );
};

export default GanttChart;
