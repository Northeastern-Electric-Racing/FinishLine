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

interface GanttChartProps<E, T> {
  startDate: Date;
  endDate: Date;
  collections: GanttCollection<E, T>[];
  onCancelChanges: (collection: GanttCollection<E, T>) => void;
  onCreateChange: (change: GanttChange<T>) => void;
  highlightedChange: RequestEventChange<T>;
  shouldShowChildren: (task: GanttTask<T>) => boolean;
  onShowChildrenToggle: (task: GanttTask<T>) => void;
  onNewTaskPressed: (collection: GanttCollection<E, T>) => void;
  onNewSubTaskPressed: (parent: GanttTask<T>) => void;
  createTaskTitle: string;
  onEditPressed: (collection: GanttCollection<E, T>) => void;
  onSavePressed: () => void;
  allowEdit: boolean;
  highlightTaskComparator: HighlightTaskComparator<T>;
  highlightSubtaskComparator: HighlightTaskComparator<T>;
}

const GanttChart = <E, T>({
  startDate,
  endDate,
  collections,
  onCancelChanges,
  onCreateChange,
  highlightedChange,
  shouldShowChildren,
  onShowChildrenToggle,
  onNewSubTaskPressed,
  onNewTaskPressed,
  onEditPressed,
  onSavePressed,
  createTaskTitle,
  allowEdit,
  highlightSubtaskComparator,
  highlightTaskComparator
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
      <Box>
        {collections.map((collection) => {
          return collection.tasks ? (
            <GanttChartCollectionSection
              startDate={startDate}
              endDate={endDate}
              collection={collection}
              onCancelChanges={() => onCancelChanges(collection)}
              onCreateChange={onCreateChange}
              highlightedChange={highlightedChange}
              shouldShowChildren={shouldShowChildren}
              onShowChildrenToggle={onShowChildrenToggle}
              onNewSubTaskPressed={onNewSubTaskPressed}
              onNewTaskPressed={() => onNewTaskPressed(collection)}
              onEditPressed={() => onEditPressed(collection)}
              onSavePressed={onSavePressed}
              createTaskTitle={createTaskTitle}
              allowEdit={allowEdit}
              highlightSubtaskComparator={highlightSubtaskComparator}
              highlightTaskComparator={highlightTaskComparator}
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
